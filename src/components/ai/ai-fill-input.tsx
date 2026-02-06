'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface ParsedData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  notes?: string
}

interface AIFillInputProps {
  documentType: 'invoice' | 'act' | 'contract'
  onFill: (data: ParsedData) => void
  placeholder?: string
}

const defaultPlaceholders = {
  invoice: 'Например: Счёт от ИП Иванов Иван Иванович ИНН 123456789012 для ООО Ромашка на 3 часа консультаций по 5000 рублей',
  act: 'Например: Акт от ИП Петров для ООО Звезда за разработку сайта 150000 рублей, работы выполнены с 1 по 15 января',
  contract: 'Например: Договор на разработку мобильного приложения между ООО Заказчик и ИП Программист на 500000 рублей',
}

export function AIFillInput({ documentType, onFill, placeholder }: AIFillInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleFill = async () => {
    if (!text.trim()) {
      setError('Введите описание документа')
      return
    }

    setError('')
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

      onFill(result.data)
      setText('')
      setExpanded(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка AI. Попробуйте ещё раз.')
      console.error('AI fill error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50">
      <CardContent>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Заполнить с помощью AI</div>
              <div className="text-sm text-slate-500">Опишите документ своими словами</div>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {expanded && (
          <div className="mt-5 space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder || defaultPlaceholders[documentType]}
              rows={3}
              className="bg-white resize-none"
            />

            {error && (
              <div className="text-sm text-red-600 font-medium">
                {error}
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
              AI извлечёт данные и заполнит форму. Проверьте и скорректируйте при необходимости.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
