'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'

interface ParsedData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  notes?: string
}

interface ParseMeta {
  parseConfidence?: number
  usedStrongFallback?: boolean
  inputTruncated?: boolean
  warnings?: string[]
  cacheHit?: boolean
}

interface ParseResult {
  data: ParsedData
  meta?: ParseMeta
}

interface AIFillInputProps {
  documentType: 'invoice' | 'act' | 'contract'
  onFill: (data: ParsedData, meta?: ParseMeta) => void
  placeholder?: string
  examples?: string[]
}

const defaultPlaceholders = {
  invoice: 'Например: Счёт от ИП Иванов Иван Иванович ИНН 123456789012 для ООО Ромашка на 3 часа консультаций по 5000 рублей',
  act: 'Например: Акт от ИП Петров для ООО Звезда за разработку сайта 150000 рублей, работы выполнены с 1 по 15 января',
  contract: 'Например: Договор на разработку мобильного приложения между ООО Заказчик и ИП Программист на 500000 рублей',
}

const defaultExamplesByType = {
  invoice: [
    'Счёт от ИП Петров ИНН 123456789012 для ООО Ромашка ИНН 7701234567 за консультации 5 часов по 3000 руб без НДС',
    'Счёт для ООО Вектор от ООО Альфа за маркетинговые услуги за март 120000 руб с НДС 20%',
  ],
  act: [
    'Акт от ИП Петров для ООО Ромашка по договору 12 от 01.02.2026 за разработку сайта 150000 руб',
    'Акт выполненных работ от ООО Альфа для ООО Вектор за март: ведение рекламы 80000 руб без НДС',
  ],
  contract: [
    'Договор между ООО Вектор и ИП Петров на разработку сайта 300000 руб, срок до 30.04.2026, оплата 5 дней',
    'Договор оказания маркетинговых услуг между ООО Альфа и ООО Бета на 120000 руб в месяц, неустойка 0,1%',
  ],
} as const

const minCharsByType = {
  invoice: 8,
  act: 12,
  contract: 16,
} as const

function canonicalizeInput(text: string) {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/["'`«»]/g, '')
    .replace(/[.,;:!?()\[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getMissingHints(documentType: 'invoice' | 'act' | 'contract', text: string) {
  const t = text.toLowerCase()
  const hints: string[] = []

  const hasSupplier = /(от|исполнитель|поставщик)/.test(t)
  const hasBuyer = /(для|заказчик|покупатель)/.test(t)
  const hasAmount = /(\d+[\d\s]*(?:[.,]\d+)?\s*(?:руб|₽))/.test(t)

  if (!hasSupplier) hints.push('кто выставляет документ')
  if (!hasBuyer) hints.push('кому выставляется документ')
  if (!hasAmount) hints.push('сумму или цену')

  if (documentType === 'contract' && !/(срок|до\s*\d{2}[./-]\d{2}[./-]\d{4})/.test(t)) {
    hints.push('срок действия договора')
  }

  if (documentType === 'act' && !/(договор|акт)/.test(t)) {
    hints.push('основание (договор/период)')
  }

  return hints.slice(0, 3)
}

function buildBriefBooster(documentType: 'invoice' | 'act' | 'contract') {
  if (documentType === 'invoice') {
    return ' от ИП Исполнитель ИНН 123456789012 для ООО Заказчик ИНН 7701234567 за услуги 1 шт по 10000 руб без НДС'
  }
  if (documentType === 'act') {
    return ' от ИП Исполнитель для ООО Заказчик по договору 1 от 01.03.2026 за услуги 1 шт на 10000 руб'
  }
  return ' между ООО Заказчик и ИП Исполнитель на услуги 100000 руб, срок до 31.12.2026, оплата 5 дней'
}

function buildHintPatch(documentType: 'invoice' | 'act' | 'contract', hint: string) {
  if (hint.includes('кто выставляет')) {
    return documentType === 'contract'
      ? ' Исполнитель: ИП Исполнитель ИНН 123456789012.'
      : ' от ИП Исполнитель ИНН 123456789012'
  }

  if (hint.includes('кому выставляется')) {
    return documentType === 'contract'
      ? ' Заказчик: ООО Заказчик ИНН 7701234567.'
      : ' для ООО Заказчик ИНН 7701234567'
  }

  if (hint.includes('сумму') || hint.includes('цену')) {
    return documentType === 'contract'
      ? ' Стоимость: 100000 руб.'
      : ' на 10000 руб'
  }

  if (hint.includes('срок')) return ' срок до 31.12.2026'
  if (hint.includes('основание')) return ' по договору 1 от 01.03.2026'

  return ''
}

export function AIFillInput({ documentType, onFill, placeholder, examples }: AIFillInputProps) {
  const [text, setText] = useState('')
  const effectiveExamples = (examples?.length ? examples : defaultExamplesByType[documentType]) as string[]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metaHint, setMetaHint] = useState('')
  const [showAllExamples, setShowAllExamples] = useState(false)
  const [submitHint, setSubmitHint] = useState('')
  const localCacheRef = useRef<Map<string, ParseResult>>(new Map())
  const requestInFlightRef = useRef(false)

  useEffect(() => {
    if (!submitHint) return
    const timer = setTimeout(() => setSubmitHint(''), 2600)
    return () => clearTimeout(timer)
  }, [submitHint])
  const minChars = minCharsByType[documentType]
  const normalizedText = useMemo(() => canonicalizeInput(text), [text])
  const cacheKey = useMemo(() => `${documentType}::${normalizedText}`, [documentType, normalizedText])
  const storageKey = 'omydoc:ai-fill-cache:v1'
  const draftStorageKey = `omydoc:ai-brief:${documentType}`
  const missingHints = getMissingHints(documentType, text)
  const readiness = Math.max(0, Math.min(100,
    Math.round(
      (text.trim().length >= minChars ? 55 : (text.trim().length / minChars) * 55)
      + (3 - Math.min(3, missingHints.length)) * 15
    )
  ))
  const readinessTone = readiness >= 80 ? 'emerald' : readiness >= 55 ? 'amber' : 'slate'
  const mustImproveBrief = missingHints.length >= 2 && readiness < 55 && text.trim().length >= minChars

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.sessionStorage.getItem(draftStorageKey)
      if (saved && !text.trim()) setText(saved)
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (text.trim()) window.sessionStorage.setItem(draftStorageKey, text)
      else window.sessionStorage.removeItem(draftStorageKey)
    } catch {
      // ignore storage errors
    }
  }, [draftStorageKey, text])

  const handleBoostBrief = () => {
    const booster = buildBriefBooster(documentType)
    setText((prev) => `${prev.trim()}${booster}`.trim())
    setSubmitHint('Добавили недостающие поля в бриф — можно запускать AI')
  }

  const applySingleHintPatch = (hint: string) => {
    const patch = buildHintPatch(documentType, hint)
    if (!patch) return
    setText((prev) => `${prev.trim()} ${patch}`.trim())
    setSubmitHint(`Добавили в бриф: ${hint}`)
  }

  const applyAllHintPatches = () => {
    const patches = missingHints.map((hint) => buildHintPatch(documentType, hint)).filter(Boolean)
    if (!patches.length) return
    setText((prev) => `${prev.trim()} ${patches.join(' ')}`.trim())
    setSubmitHint('AI добавил ключевые недостающие поля в бриф')
  }

  const handleFill = async () => {
    const baseText = text.trim()
    if (!baseText) {
      setError('Введите описание документа')
      return
    }

    if (baseText.length < minChars) {
      setError(`Добавьте деталей: минимум ${minChars} символов для ${documentType === 'invoice' ? 'счёта' : documentType === 'act' ? 'акта' : 'договора'}`)
      setSubmitHint(`Слишком короткий бриф — добавьте ещё ${Math.max(0, minChars - baseText.length)} симв.`)
      return
    }

    let textForParse = baseText
    if (mustImproveBrief) {
      textForParse = `${baseText}${buildBriefBooster(documentType)}`.trim()
      setText(textForParse)
      setSubmitHint('AI дополнил бриф недостающими деталями и запускает заполнение')
    }

    if (requestInFlightRef.current) return

    setError('')
    setMetaHint('')

    const requestCacheKey = `${documentType}::${canonicalizeInput(textForParse)}`
    const inMemoryCached = localCacheRef.current.get(requestCacheKey)
    if (inMemoryCached) {
      onFill(inMemoryCached.data, { ...inMemoryCached.meta, cacheHit: true })
      setMetaHint('Быстрый ответ из локального кеша (без нового AI-запроса)')
      setText('')
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const raw = window.sessionStorage.getItem(storageKey)
        const parsed = raw ? JSON.parse(raw) as Record<string, ParseResult> : {}
        const cached = parsed[requestCacheKey]
        if (cached) {
          localCacheRef.current.set(cacheKey, cached)
          onFill(cached.data, { ...cached.meta, cacheHit: true })
          setMetaHint('Быстрый ответ из кеша текущей сессии')
          setText('')
          return
        }
      } catch {
        // ignore corrupted session cache
      }
    }

    setLoading(true)
    requestInFlightRef.current = true

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textForParse, documentType }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка парсинга')
      }

      const payload: ParseResult = {
        data: result.data as ParsedData,
        meta: result.meta as ParseMeta | undefined,
      }

      const shouldCacheLocally = textForParse.length <= 1500
      if (shouldCacheLocally) {
        localCacheRef.current.set(requestCacheKey, payload)
      }

      if (typeof window !== 'undefined' && shouldCacheLocally) {
        try {
          const raw = window.sessionStorage.getItem(storageKey)
          const prev = raw ? JSON.parse(raw) as Record<string, ParseResult> : {}
          const next = { ...prev, [requestCacheKey]: payload }
          const keys = Object.keys(next)
          if (keys.length > 25) {
            delete next[keys[0]]
          }
          window.sessionStorage.setItem(storageKey, JSON.stringify(next))
        } catch {
          // ignore storage quota/corruption
        }
      }

      const meta = payload.meta
      onFill(payload.data, meta)

      const warningText = meta?.warnings?.length ? `Проверьте: ${meta.warnings.join(' · ')}` : ''
      const quality = typeof meta?.parseConfidence === 'number' ? `Уверенность: ${Math.round(meta.parseConfidence * 100)}%` : ''
      const source = meta?.cacheHit ? ' (быстрый ответ из кеша)' : ''
      const fallback = meta?.usedStrongFallback ? ' · включён усиленный разбор' : ''
      setMetaHint([quality + source, warningText, fallback].filter(Boolean).join(' '))

      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка AI. Попробуйте ещё раз.')
      console.error('AI fill error:', e)
    } finally {
      setLoading(false)
      requestInFlightRef.current = false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      if (text.trim().length >= minChars && !loading) {
        handleFill()
      } else {
        setSubmitHint(`Ctrl+Enter: минимум ${minChars} символов для запуска AI`)
      }
    }
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Заполнить с помощью AI</div>
            <div className="text-sm text-slate-500">Опишите документ своими словами</div>
          </div>
        </div>

        <div className="space-y-4">
          {!!effectiveExamples?.length && text.trim().length === 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setText(effectiveExamples[0])}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700"
              >
                Вставить пример
              </button>
              {showAllExamples && (
                <div className="flex flex-wrap gap-2">
                  {effectiveExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setText(example)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
              {effectiveExamples.length > 1 && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-700"
                  onClick={() => setShowAllExamples((v) => !v)}
                >
                  {showAllExamples ? 'Скрыть другие примеры' : 'Показать другие примеры'}
                </button>
              )}
            </div>
          )}
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (submitHint) setSubmitHint('')
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholders[documentType]}
            rows={3}
            className="bg-white resize-none"
          />

          {text.trim().length > 0 && (
            <div className={`text-xs rounded-lg px-3 py-2 border space-y-2 ${
              readinessTone === 'emerald'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : readinessTone === 'amber'
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-slate-600 bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>Готовность брифа к AI-разбору</span>
                <span className="font-semibold">{readiness}%</span>
              </div>
              <div className="text-[11px] opacity-80">
                Длина брифа: {text.trim().length} симв. · Рекомендуем: 60+ для более точного черновика
              </div>
              <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
                <div
                  className={`h-full transition-all ${readinessTone === 'emerald' ? 'bg-emerald-500' : readinessTone === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`}
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>
          )}

          {text.trim().length > 0 && missingHints.length > 0 && readiness < 80 && (
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 space-y-2">
              <div>Для лучшего черновика добавьте: {missingHints.join(', ')}</div>
              <div className="flex flex-wrap gap-1.5">
                {missingHints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => applySingleHintPatch(hint)}
                    className="text-[11px] px-2 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100"
                  >
                    + {hint}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyAllHintPatches}
                  className="text-xs px-2.5 py-1 rounded-md border border-violet-200 bg-white hover:bg-violet-50 text-violet-700"
                >
                  Добавить недостающие поля
                </button>
                <button
                  type="button"
                  onClick={handleBoostBrief}
                  className="text-xs px-2.5 py-1 rounded-md border border-violet-200 bg-white hover:bg-violet-50 text-violet-700"
                >
                  AI добавит полный шаблон
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {submitHint && !error && (
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {submitHint}
            </div>
          )}

          {metaHint && !error && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {metaHint}
            </div>
          )}

          <Button
            type="button"
            onClick={handleFill}
            disabled={loading || text.trim().length < minChars}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI анализирует...
              </>
            ) : mustImproveBrief ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Улучшить и заполнить автоматически
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Заполнить форму
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Ctrl+Enter для быстрой отправки · минимум {minChars} символов
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
