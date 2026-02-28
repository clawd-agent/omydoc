'use client'

import { useState } from 'react'
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

export function AIFillInput({ documentType, onFill, placeholder, examples }: AIFillInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metaHint, setMetaHint] = useState('')

  const handleFill = async () => {
    if (!text.trim()) {
      setError('Введите описание документа')
      return
    }

    setError('')
    setMetaHint('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, documentType }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка парсинга')
      }

      const meta = result.meta as ParseMeta | undefined
      onFill(result.data, meta)

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
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleFill()
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
          {!!examples?.length && (
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
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
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholders[documentType]}
            rows={3}
            className="bg-white resize-none"
          />

          {error && (
            <div className="text-sm text-red-600 font-medium">
              {error}
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
            disabled={loading || !text.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI анализирует...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Заполнить форму
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Ctrl+Enter для быстрой отправки
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
