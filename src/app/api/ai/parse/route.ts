import { NextRequest, NextResponse } from 'next/server'
import { findCompanyByInn, dadataToCompanyInfo } from '@/lib/dadata'

const PROXYAPI_KEY = process.env.PROXYAPI_KEY

const SYSTEM_PROMPT = `Извлеки данные из текста для счёта в JSON.

РОЛИ (не путай!):
- supplier = кто выставляет счёт ("от", "поставщик")
- buyer = кому счёт, кто платит ("для", "клиенту", "заказчик")

"Счёт для X" → X это BUYER!

JSON формат с РАЗНЫМИ полями:
{
  "supplier": {"s_name", "s_inn", "s_kpp", "s_address"},
  "buyer": {"b_name", "b_inn", "b_kpp", "b_address"},
  "items": [{"name", "qty", "unit", "price", "vat"}]
}

unit: шт/ч/усл. vat: 0/5/7/10/20/22 (только эти значения!). Только JSON.`

export async function POST(request: NextRequest) {
  if (!PROXYAPI_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { text, documentType = 'invoice' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const documentContextMap: Record<string, string> = {
      invoice: 'счёт на оплату',
      act: 'акт выполненных работ',
      contract: 'договор'
    }
    const documentContext = documentContextMap[documentType] || 'счёт на оплату'

    // Few-shot with DIFFERENT field names to prevent confusion
    const fewShotMessages = [
      { role: 'user', content: 'счёт для ООО Яндекс инн 7736207543' },
      { role: 'assistant', content: '{"supplier":{},"buyer":{"b_name":"ООО Яндекс","b_inn":"7736207543"}}' },
      { role: 'user', content: 'от ИП Петров для ООО Ромашка' },
      { role: 'assistant', content: '{"supplier":{"s_name":"ИП Петров"},"buyer":{"b_name":"ООО Ромашка"}}' },
    ]

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...fewShotMessages,
      { role: 'user', content: text }
    ]
    
    console.log('AI Request messages count:', messages.length)

    const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROXYAPI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ProxyAPI error:', errorData)
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 502 }
      )
    }

    // Parse JSON from response (handle markdown code blocks)
    let parsed
    try {
      // Remove markdown code blocks if present
      const jsonStr = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      parsed = JSON.parse(jsonStr)
      
      // Log raw AI response for debugging
      console.log('RAW AI RESPONSE:', JSON.stringify(parsed))
      
      // MAP prefixed fields back to standard names
      // b_name → name, s_inn → inn, etc.
      const mapFields = (obj: Record<string, unknown>, prefix: string) => {
        const result: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj || {})) {
          const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key
          result[newKey] = value
        }
        return result
      }
      
      if (parsed.supplier) {
        parsed.supplier = mapFields(parsed.supplier, 's_')
      }
      if (parsed.buyer) {
        parsed.buyer = mapFields(parsed.buyer, 'b_')
      }
      if (parsed.items && Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map((item: Record<string, unknown>) => {
          return {
            name: item.name || item.item_name,
            quantity: item.quantity || item.qty || 1,
            unit: item.unit || 'усл',
            price: item.price || 0,
            vatRate: Number(item.vatRate || item.vat || 0),
          }
        })
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: content },
        { status: 502 }
      )
    }

    // Enrich with DaData if INN is present
    // DaData = source of truth. If found — replace AI data completely.
    // AI data is only fallback when DaData doesn't find the company.
    try {
      // Enrich supplier data
      if (parsed.supplier?.inn) {
        const companies = await findCompanyByInn(parsed.supplier.inn)
        if (companies.length > 0) {
          // DaData found — full replacement
          const enriched = dadataToCompanyInfo(companies[0])
          console.log('DaData supplier (full replace):', JSON.stringify(enriched))
          parsed.supplier = enriched
        } else {
          // DaData not found — keep AI data as fallback
          console.log('DaData supplier not found, using AI fallback')
        }
      }

      // Enrich buyer data
      if (parsed.buyer?.inn) {
        const companies = await findCompanyByInn(parsed.buyer.inn)
        if (companies.length > 0) {
          // DaData found — full replacement
          const enriched = dadataToCompanyInfo(companies[0])
          console.log('DaData buyer (full replace):', JSON.stringify(enriched))
          parsed.buyer = enriched
        } else {
          // DaData not found — keep AI data as fallback
          console.log('DaData buyer not found, using AI fallback')
        }
      }
    } catch (dadataError) {
      // DaData enrichment is optional, don't fail the request
      console.warn('DaData enrichment failed:', dadataError)
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      usage: data.usage,
    })

  } catch (error) {
    console.error('AI parse error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
