'use client'

import { useState } from 'react'
import { AIFillInput } from '@/components/ai/ai-fill-input'
import { ActForm } from '@/components/forms/act-form'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { PackageStepper } from '@/components/layout/package-stepper'
import { Button } from '@/components/ui/button'
import { buildActDataFromParsed, buildContractDataFromParsed, buildInvoiceDataFromParsed } from '@/lib/documents/package-pdf'

interface ParsedData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  contractNumber?: string
  contractDate?: string
  periodFrom?: string
  periodTo?: string
}

export function ActGenerator() {
  const [initialState] = useState<{ draft: ParsedData | null; source: 'none' | 'invoice' | 'bundle' | 'contract' }>(() => {
    if (typeof window === 'undefined') return { draft: null, source: 'none' }

    const rawInvoice = window.sessionStorage.getItem('omydoc:invoice_to_act_draft')
    const rawBundle = window.sessionStorage.getItem('omydoc:bundle_act_draft')
    const rawContract = window.sessionStorage.getItem('omydoc:contract_to_act_draft')
    const raw = rawInvoice || rawBundle || rawContract
    const source: 'invoice' | 'bundle' | 'contract' = rawInvoice ? 'invoice' : (rawBundle ? 'bundle' : 'contract')

    if (!raw) return { draft: null, source: 'none' }

    try {
      const parsed = JSON.parse(raw) as ParsedData
      if (source === 'invoice') window.sessionStorage.removeItem('omydoc:invoice_to_act_draft')
      if (source === 'contract') window.sessionStorage.removeItem('omydoc:contract_to_act_draft')
      return { draft: parsed, source }
    } catch {
      window.sessionStorage.removeItem('omydoc:invoice_to_act_draft')
      window.sessionStorage.removeItem('omydoc:bundle_act_draft')
      window.sessionStorage.removeItem('omydoc:contract_to_act_draft')
      return { draft: null, source: 'none' }
    }
  })

  const [parsedData, setParsedData] = useState<ParsedData | null>(initialState.draft)
  const [packageLoading, setPackageLoading] = useState(false)
  const [packageError, setPackageError] = useState('')
  const [packageStatus, setPackageStatus] = useState('')
  const source = initialState.source

  const handleDownloadAll = async () => {
    if (typeof window === 'undefined') return

    const rawContract = window.sessionStorage.getItem('omydoc:bundle_contract_draft')
    const rawInvoice = window.sessionStorage.getItem('omydoc:bundle_invoice_draft')
    const rawAct = window.sessionStorage.getItem('omydoc:bundle_act_draft')

    if (!rawContract || !rawInvoice || !rawAct) {
      setPackageError('Не хватает данных пакета. Откройте сначала договор и счёт в пакетном режиме.')
      return
    }

    setPackageError('')
    setPackageStatus('Подготавливаем комплект...')
    setPackageLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

    try {
      const contractDraft = JSON.parse(rawContract) as ParsedData
      const invoiceDraft = JSON.parse(rawInvoice) as ParsedData
      const actDraft = JSON.parse(rawAct) as ParsedData

      const contract = buildContractDataFromParsed(contractDraft)
      const invoice = buildInvoiceDataFromParsed(invoiceDraft)
      const act = buildActDataFromParsed(actDraft)

      setPackageStatus('Генерируем PDF и собираем ZIP...')
      const res = await fetch('/api/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract, invoice, act }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('Ошибка генерации ZIP-комплекта')

      setPackageStatus('ZIP готов, запускаем скачивание...')
      const zipBlob = await res.blob()
      const zipUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = `Комплект_OmyDoc_${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(zipUrl)

      window.sessionStorage.setItem('omydoc:package:done:contract', '1')
      window.sessionStorage.setItem('omydoc:package:done:invoice', '1')
      window.sessionStorage.setItem('omydoc:package:done:act', '1')
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setPackageError('Генерация заняла слишком много времени. Попробуйте ещё раз.')
      } else {
        setPackageError(e instanceof Error ? e.message : 'Не удалось скачать пакет документов')
      }
    } finally {
      clearTimeout(timeout)
      setPackageLoading(false)
      setPackageStatus('')
    }
  }

  return (
    <div className="space-y-6">
      <AIFillInput
        documentType="act"
        placeholder="Например: Акт №15 от ИП Иванов для ООО Ромашка за консультации за февраль, 10 часов по 3000 руб, без НДС, по договору 12 от 01.02.2026"
        examples={[
          'Акт от ИП Сидоров для ООО Вектор за дизайн логотипа 25000 без НДС, договор 18 от 10.02.2026',
          'Акт за маркетинговые услуги за февраль: 1 услуга 70000 руб, исполнитель ООО Маркет, заказчик ООО Орион',
          'Акт по договору 77 от 01.01.2026, период с 2026-02-01 по 2026-02-28, консультации 12 часов по 4000',
        ]}
        onFill={(data) => setParsedData(data)}
      />

      {source === 'bundle' && <PackageStepper current="act" />}

      {source !== 'none' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-xl font-medium space-y-3">
          <div>
            {source === 'invoice'
              ? 'Данные подтянуты из счёта. Проверьте акт и скачайте PDF.'
              : source === 'contract'
                ? 'Данные подтянуты из договора. Проверьте акт и скачайте PDF.'
                : 'Пакетный режим: шаг 3/3 — акт. Данные подтянуты автоматически.'}
          </div>
          {source === 'bundle' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button type="button" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/dogovor?package=1&step=contract' }} className="px-3 py-2 rounded-lg border border-blue-300 bg-white text-sm font-semibold">
                К договору
              </button>
              <button type="button" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/schet?package=1&step=invoice' }} className="px-3 py-2 rounded-lg border border-blue-300 bg-white text-sm font-semibold">
                К счёту
              </button>
              <Button type="button" variant="outline" className="px-3 py-2 h-auto" onClick={handleDownloadAll} disabled={packageLoading}>
                {packageLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Собираем ZIP...</> : 'Скачать комплект ZIP'}
              </Button>
            </div>
          )}
        </div>
      )}

      {packageStatus && (
        <div className="bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-medium">
          {packageStatus}
        </div>
      )}

      {packageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl font-medium">
          {packageError}
        </div>
      )}

      {parsedData && source === 'none' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl font-medium flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-bold">AI заполнил черновик акта</div>
            <div className="text-sm">Проверьте данные и скачайте PDF</div>
          </div>
        </div>
      )}

      <ActForm initialData={parsedData || undefined} />
    </div>
  )
}
