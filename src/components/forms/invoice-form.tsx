'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileDown, Loader2, Calendar, Hash, ChevronDown, ChevronUp } from 'lucide-react'
import { CompanyFields } from './company-fields'
import { LineItemsTable } from './line-items-table'
import type { CompanyInfo, LineItem, InvoiceData, VatRate } from '@/types'
import { calculateLineItem, calculateTotals, formatMoney, generateDocNumber, todayISO, generateId } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError, trackFormStart, trackCompanyFilled, trackValidationError } from '@/lib/analytics/metrika'
import { canTrackCompanyFilled } from '@/lib/analytics/funnel'
import { getInvoiceWizardStatus } from '@/lib/ai/doc-wizard'
import { buildActDraftFromInvoice } from '@/lib/documents/bundle'

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

export interface ParsedInvoiceData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  notes?: string
}

interface InvoiceFormProps {
  initialData?: ParsedInvoiceData
  defaultExpanded?: boolean
}

const invoiceTemplates = [
  { label: 'Разработка', itemName: 'Разработка сайта', unit: 'усл', quantity: 1, note: 'Оплата по этапу разработки' },
  { label: 'Маркетинг', itemName: 'Маркетинговые услуги за месяц', unit: 'усл', quantity: 1, note: 'Ежемесячный пакет услуг' },
  { label: 'Консалтинг', itemName: 'Консультационные услуги', unit: 'ч', quantity: 10, note: 'Консультации по заявке заказчика' },
] as const

const invoiceNoteHints = [
  'Без НДС (УСН). Оплата в течение 5 рабочих дней.',
  'Предоплата 50% до начала работ, остаток 50% — после подписания акта.',
  'Назначение платежа: оплата услуг по счёту без НДС.',
] as const

const taxModes = [
  { label: 'УСН / без НДС', vatRate: 0 as VatRate, note: 'Без НДС (налоговый режим УСН).' },
  { label: 'ОСНО / НДС 20%', vatRate: 20 as VatRate, note: 'НДС 20% включён в позиции счёта.' },
] as const

export function InvoiceForm({ initialData, defaultExpanded = true }: InvoiceFormProps) {
  const taxModeStorageKey = 'omydoc:tax-mode:v1'
  const [number, setNumber] = useState(generateDocNumber())
  const [date, setDate] = useState(todayISO())
  const [supplier, setSupplier] = useState<CompanyInfo>(emptyCompany)
  const [buyer, setBuyer] = useState<CompanyInfo>(emptyCompany)
  const [items, setItems] = useState<LineItem[]>([
    calculateLineItem({ id: generateId(), name: '', unit: 'усл', quantity: 1, price: 0, vatRate: 0 }),
  ])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiWarning, setAiWarning] = useState('')
  const [generated, setGenerated] = useState(false)
  const [expanded, setExpanded] = useState(defaultExpanded)
  const formStartTrackedRef = useRef(false)
  const companyFilledTrackedRef = useRef(false)

  const totals = useMemo(() => calculateTotals(items), [items])
  const wizardStatus = useMemo(() => getInvoiceWizardStatus({
    supplierName: supplier.name,
    supplierInn: supplier.inn,
    buyerName: buyer.name,
    buyerInn: buyer.inn,
    firstItemName: items[0]?.name,
    totalAmount: totals.grandTotal,
  }), [supplier, buyer, items, totals.grandTotal])

  const missingChecklist = useMemo(() => {
    const issues: string[] = []
    if (!wizardStatus.partiesDone) issues.push('Заполните поставщика и покупателя (ИНН + наименование)')
    if (!wizardStatus.itemsDone) issues.push('Добавьте позицию услуги/товара')
    if (!wizardStatus.totalsDone) issues.push('Проверьте сумму и НДС перед скачиванием')
    return issues
  }, [wizardStatus])

  const taxConsistencyIssue = useMemo(() => {
    const hasVatItems = items.some((item) => item.vatRate > 0)
    const notesLower = notes.toLowerCase()
    const saysNoVat = notesLower.includes('без ндс') || notesLower.includes('усн')

    if (saysNoVat && hasVatItems) {
      return 'В примечании указано «без НДС», но в позициях есть НДС. Приведите режим к одному варианту.'
    }

    if (!saysNoVat && !hasVatItems && items.some((item) => item.price > 0)) {
      return 'В позициях НДС = 0. Добавьте пометку «без НДС» или примените НДС 20%.'
    }

    return ''
  }, [items, notes])

  // Apply initial data when it changes
  useEffect(() => {
    if (!initialData) return

    // Fill supplier data
    const supplierData = initialData.supplier
    if (supplierData) {
      setSupplier(prev => ({
        ...prev,
        name: supplierData.name || prev.name,
        inn: supplierData.inn || prev.inn,
        kpp: supplierData.kpp || prev.kpp,
        ogrn: supplierData.ogrn || prev.ogrn,
        address: supplierData.address || prev.address,
        bankName: supplierData.bankName || prev.bankName,
        bik: supplierData.bik || prev.bik,
        accountNumber: supplierData.accountNumber || prev.accountNumber,
        corrAccount: supplierData.corrAccount || prev.corrAccount,
        phone: supplierData.phone || prev.phone,
        directorName: supplierData.directorName || prev.directorName,
        directorTitle: supplierData.directorTitle || prev.directorTitle,
      }))
    }

    // Fill buyer data
    const buyerData = initialData.buyer
    if (buyerData) {
      setBuyer(prev => ({
        ...prev,
        name: buyerData.name || prev.name,
        inn: buyerData.inn || prev.inn,
        kpp: buyerData.kpp || prev.kpp,
        ogrn: buyerData.ogrn || prev.ogrn,
        address: buyerData.address || prev.address,
        bankName: buyerData.bankName || prev.bankName,
        bik: buyerData.bik || prev.bik,
        accountNumber: buyerData.accountNumber || prev.accountNumber,
        corrAccount: buyerData.corrAccount || prev.corrAccount,
        phone: buyerData.phone || prev.phone,
        directorName: buyerData.directorName || prev.directorName,
        directorTitle: buyerData.directorTitle || prev.directorTitle,
      }))
    }

    // Fill line items
    const itemsData = initialData.items
    if (itemsData && Array.isArray(itemsData) && itemsData.length > 0) {
      const validVatRates = [0, 5, 7, 10, 20, 22]
      const warnings: string[] = []
      
      const newItems: LineItem[] = itemsData.map((item, idx) => {
        const rawVat = Number(item.vatRate) || 0
        const vatRate = validVatRates.includes(rawVat) ? rawVat : 0
        if (!validVatRates.includes(rawVat) && rawVat !== 0) {
          warnings.push(`Позиция ${idx + 1}: AI указал НДС ${rawVat}% — проверьте`)
        }
        return calculateLineItem({
          id: generateId(),
          name: String(item.name || ''),
          unit: String(item.unit || 'усл'),
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          vatRate: vatRate as VatRate,
        })
      })
      setItems(newItems)
      
      if (warnings.length > 0) {
        setAiWarning(warnings.join('. '))
      } else {
        setAiWarning('')
      }
    }

    // Fill notes
    if (initialData.notes) {
      setNotes(initialData.notes)
    }

    // Auto-expand form when data is filled
    setExpanded(true)
  }, [initialData])

  const handleFirstInteraction = useCallback(() => {
    if (formStartTrackedRef.current) return
    formStartTrackedRef.current = true
    trackFormStart('invoice')
  }, [])

  useEffect(() => {
    if (!canTrackCompanyFilled({
      supplier,
      buyer,
      alreadyTracked: companyFilledTrackedRef.current,
    })) return

    companyFilledTrackedRef.current = true
    trackCompanyFilled('invoice')
  }, [supplier, buyer])

  const handleCreateActFromInvoice = useCallback(() => {
    const draft = buildActDraftFromInvoice({
      number,
      date,
      supplier,
      buyer,
      items,
    })

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('omydoc:invoice_to_act_draft', JSON.stringify(draft))
      window.location.href = '/akt?from=invoice'
    }
  }, [number, date, supplier, buyer, items])

  const applyInvoiceTemplate = useCallback((template: (typeof invoiceTemplates)[number]) => {
    setItems([
      calculateLineItem({
        id: generateId(),
        name: template.itemName,
        unit: template.unit,
        quantity: template.quantity,
        price: 0,
        vatRate: 0,
      }),
    ])
    setNotes(template.note)
  }, [])

  const applyNoteHint = useCallback((hint: string) => {
    setNotes((prev) => (prev.trim() ? `${prev.trim()} ${hint}` : hint))
  }, [])

  const applyTaxMode = useCallback((mode: (typeof taxModes)[number]) => {
    setItems((prev) => prev.map((item) => calculateLineItem({
      ...item,
      vatRate: mode.vatRate,
    })))

    setNotes((prev) => {
      const normalized = prev.trim()
      if (!normalized) return mode.note
      if (normalized.includes(mode.note)) return normalized
      return `${normalized} ${mode.note}`
    })

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(taxModeStorageKey, mode.label)
    }

    setAiWarning('')
  }, [taxModeStorageKey])

  useEffect(() => {
    if (initialData) return
    if (typeof window === 'undefined') return
    const saved = window.sessionStorage.getItem(taxModeStorageKey)
    const matched = taxModes.find((mode) => mode.label === saved)
    if (matched) applyTaxMode(matched)
  }, [initialData, applyTaxMode, taxModeStorageKey])

  const handleGenerate = useCallback(async () => {
    if (!supplier.inn || !supplier.name) {
      trackValidationError('invoice', 'supplier')
      setError('Заполните реквизиты поставщика (ИНН и наименование)')
      return
    }
    if (!buyer.inn || !buyer.name) {
      trackValidationError('invoice', 'buyer')
      setError('Заполните реквизиты покупателя (ИНН и наименование)')
      return
    }
    if (items.length === 0 || !items[0].name) {
      trackValidationError('invoice', 'items')
      setError('Добавьте хотя бы одну позицию')
      return
    }
    setError('')
    setGenerated(false)

    const data: InvoiceData = {
      number,
      date,
      supplier,
      buyer,
      items,
      totalAmount: totals.totalAmount,
      totalVat: totals.totalVat,
      grandTotal: totals.grandTotal,
      notes: notes || undefined,
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invoice', data }),
      })

      if (!res.ok) throw new Error('Failed to generate PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Счёт_${number}_${date}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      trackPdfGenerated('invoice')
      trackPdfDownloaded('invoice')
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('omydoc:package:done:invoice', '1')
      }
      setGenerated(true)
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      trackGenerationError('invoice', e instanceof Error ? e.message : 'Unknown error')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, items, notes, totals])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6" onFocusCapture={handleFirstInteraction}>
      {expanded && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-3">Мастер заполнения счёта</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'invoice-parties', title: 'Стороны', done: wizardStatus.partiesDone },
                { id: 'invoice-items', title: 'Позиции', done: wizardStatus.itemsDone },
                { id: 'invoice-total', title: 'Проверка', done: wizardStatus.totalsDone },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToSection(step.id)}
                  className={`text-left rounded-xl border px-3 py-2 transition ${step.done ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-violet-300'}`}
                >
                  <div className="text-xs text-slate-500">{step.done ? '✓ Готово' : 'Нужно заполнить'}</div>
                  <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Быстрые шаблоны счёта</h3>
          <div className="flex flex-wrap gap-2">
            {invoiceTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyInvoiceTemplate(template)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-violet-300"
              >
                {template.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Подставляем первую позицию и примечание — остаётся уточнить цену и реквизиты.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">AI-подсказки для примечания</h3>
          <div className="flex flex-wrap gap-2">
            {invoiceNoteHints.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => applyNoteHint(hint)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300"
              >
                + {hint}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Помогает быстро добавить юридически понятные формулировки в счёт.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Налоговый режим (AI Smart Defaults)</h3>
          <div className="flex flex-wrap gap-2">
            {taxModes.map((mode) => (
              <button
                key={mode.label}
                type="button"
                onClick={() => applyTaxMode(mode)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300"
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">За 1 клик применяем НДС ко всем позициям и добавляем корректную пометку в примечание.</p>
        </CardContent>
      </Card>

      {/* Collapsible header */}
      {!defaultExpanded && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
        >
          <span className="font-bold text-slate-900">
            {expanded ? 'Скрыть форму' : 'Заполнить вручную'}
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
      )}

      {expanded && (
        <>
          {/* Номер и дата */}
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="invoice-number">
                    <Hash className="h-3.5 w-3.5" />
                    Номер счёта
                  </Label>
                  <Input
                    id="invoice-number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-date">
                    <Calendar className="h-3.5 w-3.5" />
                    Дата
                  </Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Поставщик */}
          <Card id="invoice-parties">
            <CardContent>
              <CompanyFields
                prefix="supplier"
                label="Поставщик"
                value={supplier}
                onChange={setSupplier}
                showBankDetails={true}
              />
            </CardContent>
          </Card>

          {/* Покупатель */}
          <Card>
            <CardContent>
              <CompanyFields
                prefix="buyer"
                label="Покупатель"
                value={buyer}
                onChange={setBuyer}
              />
            </CardContent>
          </Card>

          {/* Позиции */}
          <Card id="invoice-items">
            <CardContent>
              <LineItemsTable items={items} onChange={setItems} />
            </CardContent>
          </Card>

          {/* Итого */}
          <Card id="invoice-total">
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-end gap-4 text-sm">
                  <span className="text-slate-500 font-medium">Итого без НДС:</span>
                  <span className="font-bold text-slate-900 w-32 text-right font-mono">{formatMoney(totals.totalAmount)} ₽</span>
                </div>
                {totals.totalVat > 0 && (
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-slate-500 font-medium">НДС:</span>
                    <span className="font-bold text-slate-900 w-32 text-right font-mono">{formatMoney(totals.totalVat)} ₽</span>
                  </div>
                )}
                <Separator className="my-4" />
                <div className="flex justify-end gap-4">
                  <span className="text-lg font-bold text-slate-900">Всего к оплате:</span>
                  <span className="text-xl font-black text-slate-900 w-36 text-right font-mono">{formatMoney(totals.grandTotal)} ₽</span>
                </div>
                {totals.grandTotal > 0 && (
                  <p className="text-sm text-slate-500 font-medium italic text-right mt-2">
                    {amountToWords(totals.grandTotal)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Примечание */}
          <Card>
            <CardContent>
              <Label htmlFor="notes">Примечание (необязательно)</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация к счёту..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Предупреждение AI */}
          {aiWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-xl font-medium flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-bold">Проверьте данные</div>
                <div className="text-sm">{aiWarning}</div>
              </div>
            </div>
          )}

          {missingChecklist.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl">
              <div className="font-semibold mb-1">Перед скачиванием проверьте:</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {missingChecklist.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {taxConsistencyIssue && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl">
              <div className="font-semibold mb-1">Проверка налогового режима</div>
              <div className="text-sm">{taxConsistencyIssue}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {taxModes.map((mode) => (
                  <Button key={mode.label} type="button" variant="outline" size="sm" onClick={() => applyTaxMode(mode)}>
                    Применить: {mode.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {generated && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl">
              <div className="font-semibold">Счёт готов. Следующий шаг:</div>
              <div className="text-sm mt-1">Можно сразу сформировать акт по этим же данным.</div>
              <div className="mt-2">
                <Button type="button" variant="outline" onClick={handleCreateActFromInvoice}>Создать акт из этого счёта</Button>
              </div>
            </div>
          )}

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Кнопка действия */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="xl"
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Генерация PDF...</>
            ) : (
              <><FileDown className="h-5 w-5 mr-2" /> Скачать счёт в PDF</>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
