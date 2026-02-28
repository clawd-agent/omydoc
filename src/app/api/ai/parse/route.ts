import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { findCompanyByInn, dadataToCompanyInfo } from '@/lib/dadata'
import { getSystemPrompt } from '@/lib/ai/prompts'
import { getModelConfigByType } from '@/lib/ai/model-config'
import { normalizeAiInput } from '@/lib/ai/input-normalizer'
import { buildParseWarnings, calculateParseConfidence, shouldRetryWithStrongModel } from '@/lib/ai/parse-quality'

const PROXYAPI_KEY = process.env.PROXYAPI_KEY
const PARSE_CACHE_TTL_MS = 1000 * 60 * 10
const parseCache = new Map<string, { expiresAt: number; payload: unknown }>()

type DocType = 'invoice' | 'act' | 'contract'

function parseAndNormalizeAIContent(content: string) {
  const jsonStr = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const parsed = JSON.parse(jsonStr)

  const mapFields = (obj: Record<string, unknown>, prefix: string) => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj || {})) {
      const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key
      result[newKey] = value
    }
    return result
  }

  if (parsed.supplier) parsed.supplier = mapFields(parsed.supplier, 's_')
  if (parsed.buyer) parsed.buyer = mapFields(parsed.buyer, 'b_')

  if (parsed.items && Array.isArray(parsed.items)) {
    parsed.items = parsed.items.map((item: Record<string, unknown>) => ({
      name: item.name || item.item_name,
      quantity: item.quantity || item.qty || 1,
      unit: item.unit || 'усл',
      price: item.price || 0,
      vatRate: Number(item.vatRate || item.vat || 0),
    }))
  }

  return parsed
}

function normalizeDate(raw?: string) {
  if (!raw) return undefined
  const m = raw.match(/(\d{2})[./-](\d{2})[./-](\d{4})/)
  if (!m) return undefined
  return `${m[3]}-${m[2]}-${m[1]}`
}

function normalizeNum(raw?: string) {
  if (!raw) return 0
  return Number(raw.replace(/\s+/g, '').replace(',', '.')) || 0
}

function extractPartyName(text: string, role: 'supplier' | 'buyer') {
  const pattern = role === 'supplier'
    ? /(?:от|исполнитель)\s+(.+?)(?=\s+(?:инн|для|заказчик|покупател[ья]|за|на)\b|[,.;\n]|$)/i
    : /(?:для|заказчик|покупател[ья])\s+(.+?)(?=\s+(?:инн|за|на|по|договор)\b|[,.;\n]|$)/i

  return text.match(pattern)?.[1]?.trim()
}

function parseHeuristic(text: string, type: DocType) {
  const inns = Array.from(text.matchAll(/\b\d{10}(?:\d{2})?\b/g)).map((m) => m[0])
  const supplierName = extractPartyName(text, 'supplier')
  const buyerName = extractPartyName(text, 'buyer')

  const qtyMatch = text.match(/(\d+[\d\s]*(?:[.,]\d+)?)\s*(час(?:а|ов)?|ч\b|шт\b|усл\b)/i)
  const priceMatch = text.match(/(?:по\s*)?(\d+[\d\s]*(?:[.,]\d+)?)\s*(?:руб(?:\.|лей)?|₽)/i)
  const itemName = text.match(/(?:за|на)\s+([^,.\n;]+)/i)?.[1]?.trim() || 'Услуги'

  const contractNumber = text.match(/договор[ау]?\s*№?\s*([\w/-]+)/i)?.[1]
  const contractDate = normalizeDate(text.match(/договор[ау]?.{0,20}?от\s*(\d{2}[./-]\d{2}[./-]\d{4})/i)?.[1])
  const endDate = normalizeDate(text.match(/(?:срок\s*до|до)\s*(\d{2}[./-]\d{2}[./-]\d{4})/i)?.[1])
  const paymentDays = normalizeNum(text.match(/оплат[аы]\s*(\d+)\s*д/i)?.[1]) || undefined

  const parsed: Record<string, unknown> = {
    supplier: {
      name: supplierName || '',
      inn: inns[0] || '',
    },
    buyer: {
      name: buyerName || '',
      inn: inns[1] || '',
    },
    items: [
      {
        name: itemName,
        quantity: qtyMatch ? normalizeNum(qtyMatch[1]) : 1,
        unit: qtyMatch?.[2]?.toLowerCase().includes('ч') ? 'ч' : 'усл',
        price: normalizeNum(priceMatch?.[1]),
        vatRate: 0,
      },
    ],
  }

  if (type === 'act') {
    parsed.contractNumber = contractNumber || ''
    parsed.contractDate = contractDate || ''
  }

  if (type === 'contract') {
    parsed.subject = itemName
    parsed.endDate = endDate || ''
    if (paymentDays) parsed.paymentDays = paymentDays
  }

  return parsed
}

export async function POST(request: NextRequest) {
  try {
    const { text, documentType = 'invoice' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const type = (['invoice', 'act', 'contract'].includes(documentType) ? documentType : 'invoice') as DocType
    const modelConfig = getModelConfigByType(type)
    const normalizedInput = normalizeAiInput(text, modelConfig.max_input_chars)

    const cacheKey = createHash('sha1').update(`${type}::${normalizedInput.text}`).digest('hex')
    const cached = parseCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      const payload = cached.payload as { meta?: Record<string, unknown> }
      return NextResponse.json({ ...payload, meta: { ...payload.meta, cacheHit: true } })
    }
    if (cached && cached.expiresAt <= Date.now()) parseCache.delete(cacheKey)

    const fewShotByType: Record<DocType, Array<{ role: 'user' | 'assistant'; content: string }>> = {
      invoice: [
        { role: 'user', content: 'счёт для ООО Яндекс инн 7736207543' },
        { role: 'assistant', content: '{"supplier":{},"buyer":{"b_name":"ООО Яндекс","b_inn":"7736207543"}}' },
      ],
      act: [
        { role: 'user', content: 'акт по договору 12 от 01.02.2026 от ИП Петров для ООО Ромашка за консультации 5 часов по 3000' },
        { role: 'assistant', content: '{"supplier":{"s_name":"ИП Петров"},"buyer":{"b_name":"ООО Ромашка"},"items":[{"name":"консультации","qty":5,"unit":"ч","price":3000,"vat":0}],"contractNumber":"12","contractDate":"2026-02-01"}' },
      ],
      contract: [
        { role: 'user', content: 'договор между ООО Альфа и ИП Петров на разработку сайта 200000, срок до 30.04.2026, оплата 5 дней' },
        { role: 'assistant', content: '{"supplier":{"s_name":"ИП Петров"},"buyer":{"b_name":"ООО Альфа"},"subject":"разработка сайта","items":[{"name":"разработка сайта","qty":1,"unit":"усл","price":200000,"vat":0}],"paymentDays":5,"endDate":"2026-04-30"}' },
      ],
    }

    let parsed: Record<string, unknown> | null = null
    let usage: unknown = undefined
    let parseConfidence = 0
    let usedStrongFallback = false
    let usedLocalFallback = false

    const messages = [
      { role: 'system', content: getSystemPrompt(type) },
      ...fewShotByType[type],
      { role: 'user', content: normalizedInput.text },
    ]

    if (PROXYAPI_KEY) {
      try {
        const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PROXYAPI_KEY}`,
          },
          body: JSON.stringify({
            model: modelConfig.model,
            messages,
            temperature: modelConfig.temperature,
            max_tokens: modelConfig.max_tokens,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          usage = data.usage
          if (content) {
            parsed = parseAndNormalizeAIContent(content)
            parseConfidence = calculateParseConfidence(type, parsed)
          }
        }
      } catch (e) {
        console.warn('Primary AI parse failed, switching to local fallback:', e)
      }
    }

    if (!parsed) {
      parsed = parseHeuristic(normalizedInput.text, type)
      parseConfidence = Math.max(0.35, calculateParseConfidence(type, parsed))
      usedLocalFallback = true
    }

    if (!usedLocalFallback && shouldRetryWithStrongModel(type, parseConfidence, normalizedInput.text.length) && PROXYAPI_KEY) {
      try {
        const retryResponse = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PROXYAPI_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: getSystemPrompt(type) },
              { role: 'user', content: normalizedInput.text },
            ],
            temperature: 0,
            max_tokens: modelConfig.max_tokens + 400,
          }),
        })

        if (retryResponse.ok) {
          const retryData = await retryResponse.json()
          const retryContent = retryData.choices?.[0]?.message?.content
          if (retryContent) {
            const retryParsed = parseAndNormalizeAIContent(retryContent)
            const retryConfidence = calculateParseConfidence(type, retryParsed)
            if (retryConfidence > parseConfidence) {
              parsed = retryParsed
              parseConfidence = retryConfidence
              usedStrongFallback = true
            }
          }
        }
      } catch (fallbackError) {
        console.warn('Strong fallback parse attempt failed:', fallbackError)
      }
    }

    try {
      if ((parsed.supplier as Record<string, string> | undefined)?.inn) {
        const supplierInn = (parsed.supplier as Record<string, string>).inn
        const companies = await findCompanyByInn(supplierInn)
        if (companies.length > 0) parsed.supplier = dadataToCompanyInfo(companies[0])
      }

      if ((parsed.buyer as Record<string, string> | undefined)?.inn) {
        const buyerInn = (parsed.buyer as Record<string, string>).inn
        const companies = await findCompanyByInn(buyerInn)
        if (companies.length > 0) parsed.buyer = dadataToCompanyInfo(companies[0])
      }
    } catch (dadataError) {
      console.warn('DaData enrichment failed:', dadataError)
    }

    const warnings = buildParseWarnings(type, parsed, parseConfidence)
    if (usedLocalFallback) warnings.unshift('Использован локальный офлайн-разбор — проверьте формулировки')

    const payload = {
      success: true,
      data: parsed,
      usage,
      meta: {
        inputTruncated: normalizedInput.truncated,
        parseConfidence,
        usedStrongFallback,
        usedLocalFallback,
        warnings,
        cacheHit: false,
      },
    }

    parseCache.set(cacheKey, { expiresAt: Date.now() + PARSE_CACHE_TTL_MS, payload })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('AI parse error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
