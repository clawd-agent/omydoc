'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, FileText, Zap, CheckCircle2 } from 'lucide-react'
import { InvoiceForm, type ParsedInvoiceData } from '@/components/forms/invoice-form'
import { buildDraftPackageFromInvoiceAI } from '@/lib/documents/bundle'
import { PackageStepper } from '@/components/layout/package-stepper'

export function InvoiceGenerator() {
  const [initialState] = useState<{ draft: ParsedInvoiceData | null; fromPackage: boolean }>(() => {
    if (typeof window === 'undefined') return { draft: null, fromPackage: false }
    const raw = window.sessionStorage.getItem('omydoc:bundle_invoice_draft')
    if (!raw) return { draft: null, fromPackage: false }

    try {
      const parsed = JSON.parse(raw) as ParsedInvoiceData
      return { draft: parsed, fromPackage: true }
    } catch {
      window.sessionStorage.removeItem('omydoc:bundle_invoice_draft')
      return { draft: null, fromPackage: false }
    }
  })

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(initialState.draft)
  const [showForm, setShowForm] = useState(Boolean(initialState.draft))

  const handleAIParse = async () => {
    if (!text.trim()) {
      setError('Опишите счёт: кто, кому, за что, сколько')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, documentType: 'invoice' }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка парсинга')
      }

      setParsedData(result.data)
      setShowForm(true)
      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка AI. Попробуйте ещё раз.')
      console.error('AI parse error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = () => {
    if (!parsedData || typeof window === 'undefined') return
    const pack = buildDraftPackageFromInvoiceAI(parsedData)
    window.sessionStorage.setItem('omydoc:bundle_invoice_draft', JSON.stringify(parsedData))
    window.sessionStorage.setItem('omydoc:bundle_act_draft', JSON.stringify(pack.act))
    window.sessionStorage.setItem('omydoc:bundle_contract_draft', JSON.stringify(pack.contract))
    window.location.href = '/dogovor?package=1&step=contract'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAIParse()
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <header className="text-center">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5">
          Счёт на оплату
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            за 30 секунд
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Опишите что нужно — AI заполнит форму. Скачайте готовый PDF.
        </p>
      </header>

      {initialState.fromPackage && <PackageStepper current="invoice" />}

      {/* AI Input Card */}
      <section className="bg-gradient-to-br from-violet-50 via-blue-50 to-white border border-violet-200 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-black text-lg text-slate-900">Опишите счёт</div>
            <div className="text-sm text-slate-500 font-medium">AI заполнит все поля автоматически</div>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Например: Счёт от ИП Иванов Иван Иванович ИНН 123456789012 для ООО Ромашка ИНН 7707123456 на 3 часа консультаций по 5000 рублей без НДС"
          rows={4}
          className="bg-white/80 backdrop-blur resize-none text-base border-slate-200 focus:border-violet-400 focus:ring-violet-400/20 mb-4"
        />

        {error && (
          <div className="text-sm text-red-600 font-medium mb-4 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <Button
          onClick={handleAIParse}
          disabled={loading || !text.trim()}
          size="xl"
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-xl shadow-violet-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              AI анализирует...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Создать счёт
            </>
          )}
        </Button>

        <p className="text-xs text-slate-400 text-center mt-3 font-medium">
          Ctrl+Enter для быстрой отправки
        </p>
      </section>

      {/* How it works - compact */}
      {!showForm && (
        <section className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">1. Опишите</div>
            <div className="text-xs text-slate-500 font-medium">Своими словами</div>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-violet-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">2. AI заполнит</div>
            <div className="text-xs text-slate-500 font-medium">Автоматически</div>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">3. Скачайте</div>
            <div className="text-xs text-slate-500 font-medium">Готовый PDF</div>
          </div>
        </section>
      )}

      {/* Form Section */}
      <section id="generator">
        {showForm ? (
          <>
            {/* Success indicator */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl font-medium flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-bold">AI заполнил форму</div>
                <div className="text-sm">Проверьте данные и скачайте PDF</div>
              </div>
            </div>
            {initialState.fromPackage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-3 rounded-xl font-medium mb-3">
                Пакетный режим: после счёта можно перейти к акту.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button type="button" variant="outline" className="w-full" onClick={handleCreatePackage}>
                Собрать комплект: договор + акт
              </Button>
              {initialState.fromPackage && (
                <Button type="button" variant="outline" className="w-full" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/akt?package=1&step=act' }}>
                  Перейти к акту
                </Button>
              )}
            </div>
            <InvoiceForm initialData={parsedData || undefined} defaultExpanded={true} />
          </>
        ) : (
          <InvoiceForm defaultExpanded={false} />
        )}
      </section>
    </div>
  )
}
