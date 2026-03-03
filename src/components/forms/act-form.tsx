'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileDown, Loader2 } from 'lucide-react'
import { CompanyFields } from './company-fields'
import { LineItemsTable } from './line-items-table'
import type { CompanyInfo, LineItem, ActData } from '@/types'
import { calculateLineItem, calculateTotals, formatMoney, generateDocNumber, todayISO, generateId } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError, trackFormStart, trackCompanyFilled, trackValidationError } from '@/lib/analytics/metrika'
import { canTrackCompanyFilled } from '@/lib/analytics/funnel'
import { getActWizardStatus } from '@/lib/ai/doc-wizard'
import { buildInvoiceDraftFromAct } from '@/lib/documents/bundle'

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

interface ParsedActData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  contractNumber?: string
  contractDate?: string
  periodFrom?: string
  periodTo?: string
}

interface ActFormProps {
  initialData?: ParsedActData
}

const actTemplates = [
  { label: 'Разработка', itemName: 'Разработка сайта', unit: 'усл', quantity: 1, contractNumber: '1' },
  { label: 'Маркетинг', itemName: 'Маркетинговые услуги за месяц', unit: 'усл', quantity: 1, contractNumber: '2' },
  { label: 'Консалтинг', itemName: 'Консультационные услуги', unit: 'ч', quantity: 8, contractNumber: '3' },
] as const

const taxModes = [
  { label: 'УСН / без НДС', vatRate: 0 as const },
  { label: 'ОСНО / НДС 20%', vatRate: 20 as const },
] as const

const actBasisHints = [
  { label: 'Период = текущий месяц', apply: 'month' },
  { label: 'Без договора (разовая услуга)', apply: 'single' },
  { label: 'Дата договора = сегодня', apply: 'today' },
] as const

export function ActForm({ initialData }: ActFormProps) {
  const taxModeStorageKey = 'omydoc:tax-mode:v1'
  const [number, setNumber] = useState(generateDocNumber())
  const [date, setDate] = useState(todayISO())
  const [supplier, setSupplier] = useState<CompanyInfo>(emptyCompany)
  const [buyer, setBuyer] = useState<CompanyInfo>(emptyCompany)
  const [items, setItems] = useState<LineItem[]>([
    calculateLineItem({ id: generateId(), name: '', unit: 'усл', quantity: 1, price: 0, vatRate: 0 }),
  ])
  const [contractNumber, setContractNumber] = useState('')
  const [contractDate, setContractDate] = useState('')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const formStartTrackedRef = useRef(false)
  const companyFilledTrackedRef = useRef(false)

  const totals = useMemo(() => calculateTotals(items), [items])
  const wizardStatus = useMemo(() => getActWizardStatus({
    supplierName: supplier.name,
    supplierInn: supplier.inn,
    buyerName: buyer.name,
    buyerInn: buyer.inn,
    firstItemName: items[0]?.name,
    contractNumber,
    totalAmount: totals.grandTotal,
  }), [supplier, buyer, items, contractNumber, totals.grandTotal])

  const missingChecklist = useMemo(() => {
    const issues: string[] = []
    if (!wizardStatus.partiesDone) issues.push('Заполните исполнителя и заказчика (ИНН + наименование)')
    if (!wizardStatus.basisDone) issues.push('Проверьте основание: номер/дата договора или оставьте осознанно пустым')
    if (!wizardStatus.itemsDone) issues.push('Добавьте позицию выполненных работ/услуг')
    if (!wizardStatus.totalsDone) issues.push('Проверьте итоговую сумму перед скачиванием')
    return issues
  }, [wizardStatus])

  const taxConsistencyIssue = useMemo(() => {
    const hasVatItems = items.some((item) => item.vatRate > 0)
    const hasMoneyItems = items.some((item) => item.price > 0)

    if (!hasMoneyItems) return ''

    if (!supplier.inn || !buyer.inn) return ''

    const likelyUsn = /\b\d{12}\b/.test(supplier.inn) || /\bип\b/i.test(supplier.name)

    if (likelyUsn && hasVatItems) {
      return 'Похоже на ИП/УСН, но в позициях акта указан НДС. Проверьте корректность налогового режима.'
    }

    return ''
  }, [items, supplier.inn, supplier.name, buyer.inn])

  useEffect(() => {
    if (!initialData) return

    if (initialData.supplier) {
      setSupplier((prev) => ({ ...prev, ...initialData.supplier }))
    }
    if (initialData.buyer) {
      setBuyer((prev) => ({ ...prev, ...initialData.buyer }))
    }
    if (initialData.items?.length) {
      const validVatRates = [0, 5, 7, 10, 20, 22]
      setItems(initialData.items.map((item) => {
        const rawVat = Number(item.vatRate ?? item.vat ?? 0)
        const vatRate = validVatRates.includes(rawVat) ? rawVat : 0
        return calculateLineItem({
          id: generateId(),
          name: String(item.name || ''),
          unit: String(item.unit || 'усл'),
          quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
          price: Number(item.price || 0) || 0,
          vatRate: vatRate as 0 | 5 | 7 | 10 | 20 | 22,
        })
      }))
    }

    if (initialData.contractNumber) setContractNumber(initialData.contractNumber)
    if (initialData.contractDate) setContractDate(initialData.contractDate)
    if (initialData.periodFrom) setPeriodFrom(initialData.periodFrom)
    if (initialData.periodTo) setPeriodTo(initialData.periodTo)
  }, [initialData])

  const handleFirstInteraction = useCallback(() => {
    if (formStartTrackedRef.current) return
    formStartTrackedRef.current = true
    trackFormStart('act')
  }, [])

  useEffect(() => {
    if (!canTrackCompanyFilled({
      supplier,
      buyer,
      alreadyTracked: companyFilledTrackedRef.current,
    })) return

    companyFilledTrackedRef.current = true
    trackCompanyFilled('act')
  }, [supplier, buyer])

  const applyActTemplate = useCallback((template: (typeof actTemplates)[number]) => {
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
    if (!contractNumber) setContractNumber(template.contractNumber)
  }, [contractNumber])

  const applyTaxMode = useCallback((mode: (typeof taxModes)[number]) => {
    setItems((prev) => prev.map((item) => calculateLineItem({ ...item, vatRate: mode.vatRate })))
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(taxModeStorageKey, mode.label)
    }
  }, [taxModeStorageKey])

  useEffect(() => {
    if (initialData) return
    if (typeof window === 'undefined') return
    const saved = window.sessionStorage.getItem(taxModeStorageKey)
    const matched = taxModes.find((mode) => mode.label === saved)
    if (matched) applyTaxMode(matched)
  }, [initialData, applyTaxMode, taxModeStorageKey])

  const applyBasisHint = useCallback((hint: (typeof actBasisHints)[number]['apply']) => {
    if (hint === 'single') {
      setContractNumber('')
      setContractDate('')
      return
    }

    if (hint === 'today') {
      if (!contractDate) setContractDate(todayISO())
      return
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setPeriodFrom(toIso(start))
    setPeriodTo(toIso(end))
  }, [contractDate])

  const handleCreateInvoiceFromAct = useCallback(() => {
    const draft = buildInvoiceDraftFromAct({
      number,
      date,
      supplier,
      buyer,
      items,
    })

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('omydoc:act_to_invoice_draft', JSON.stringify(draft))
      window.location.href = '/schet?from=act'
    }
  }, [number, date, supplier, buyer, items])

  const handleGenerate = useCallback(async () => {
    if (!supplier.inn || !supplier.name) {
      trackValidationError('act', 'supplier')
      setError('Заполните реквизиты исполнителя (ИНН и наименование)')
      return
    }
    if (!buyer.inn || !buyer.name) {
      trackValidationError('act', 'buyer')
      setError('Заполните реквизиты заказчика (ИНН и наименование)')
      return
    }
    if (items.length === 0 || !items[0].name) {
      trackValidationError('act', 'items')
      setError('Добавьте хотя бы одну позицию')
      return
    }
    setError('')
    setGenerated(false)

    const data: ActData = {
      number,
      date,
      supplier,
      buyer,
      items,
      totalAmount: totals.totalAmount,
      totalVat: totals.totalVat,
      grandTotal: totals.grandTotal,
      contractNumber: contractNumber || undefined,
      contractDate: contractDate || undefined,
      periodFrom: periodFrom || undefined,
      periodTo: periodTo || undefined,
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'act', data }),
      })

      if (!res.ok) throw new Error('Failed to generate PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Акт_${number}_${date}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Отправляем цели в Яндекс.Метрику
      trackPdfGenerated('act')
      trackPdfDownloaded('act')
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('omydoc:package:done:act', '1')
      }
      setGenerated(true)
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      trackGenerationError('act', e instanceof Error ? e.message : 'Unknown error')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, items, contractNumber, contractDate, periodFrom, periodTo, totals])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6" onFocusCapture={handleFirstInteraction}>
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Мастер заполнения акта</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {[
              { id: 'act-parties', title: 'Стороны', done: wizardStatus.partiesDone },
              { id: 'act-basis', title: 'Основание', done: wizardStatus.basisDone },
              { id: 'act-items', title: 'Позиции', done: wizardStatus.itemsDone },
              { id: 'act-total', title: 'Проверка', done: wizardStatus.totalsDone },
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

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Быстрые шаблоны акта</h3>
          <div className="flex flex-wrap gap-2">
            {actTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyActTemplate(template)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-violet-300"
              >
                {template.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Подставляем позицию и основу акта — остаётся проверить период и сумму.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">AI-подсказки по основанию</h3>
          <div className="flex flex-wrap gap-2">
            {actBasisHints.map((hint) => (
              <button
                key={hint.label}
                type="button"
                onClick={() => applyBasisHint(hint.apply)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-violet-300"
              >
                {hint.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Быстро заполняет спорные поля акта: период и основание.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Налоговый режим</h3>
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
          <p className="text-xs text-slate-500 mt-2">Применяет выбранный НДС ко всем позициям акта в один клик.</p>
        </CardContent>
      </Card>

      {/* Номер и дата */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="act-number">Номер акта</Label>
              <Input id="act-number" value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="act-date">Дата</Label>
              <Input id="act-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основание — договор */}
      <Card id="act-basis">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Основание (договор)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract-number">Номер договора</Label>
              <Input
                id="contract-number"
                placeholder="Необязательно"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contract-date">Дата договора</Label>
              <Input
                id="contract-date"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="period-from">Период с</Label>
              <Input
                id="period-from"
                type="date"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="period-to">Период по</Label>
              <Input
                id="period-to"
                type="date"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Исполнитель */}
      <Card id="act-parties">
        <CardContent className="pt-6">
          <CompanyFields prefix="supplier" label="Исполнитель" value={supplier} onChange={setSupplier} />
        </CardContent>
      </Card>

      {/* Заказчик */}
      <Card>
        <CardContent className="pt-6">
          <CompanyFields prefix="buyer" label="Заказчик" value={buyer} onChange={setBuyer} />
        </CardContent>
      </Card>

      {/* Позиции */}
      <Card id="act-items">
        <CardContent className="pt-6">
          <LineItemsTable items={items} onChange={setItems} />
        </CardContent>
      </Card>

      {/* Итого */}
      <Card id="act-total">
        <CardContent className="pt-6">
          <div className="space-y-2 text-right">
            <div className="flex justify-end gap-4">
              <span className="text-gray-600">Итого без НДС:</span>
              <span className="font-medium w-32">{formatMoney(totals.totalAmount)} ₽</span>
            </div>
            {totals.totalVat > 0 && (
              <div className="flex justify-end gap-4">
                <span className="text-gray-600">НДС:</span>
                <span className="font-medium w-32">{formatMoney(totals.totalVat)} ₽</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-end gap-4">
              <span className="text-lg font-semibold">Всего:</span>
              <span className="text-lg font-bold w-32">{formatMoney(totals.grandTotal)} ₽</span>
            </div>
            {totals.grandTotal > 0 && (
              <p className="text-sm text-gray-500 italic">{amountToWords(totals.grandTotal)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {missingChecklist.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          <div className="font-semibold mb-1">Перед скачиванием проверьте:</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {missingChecklist.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {taxConsistencyIssue && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          <div className="font-semibold mb-1">Проверка налогового режима</div>
          <div className="text-sm">{taxConsistencyIssue}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {taxModes.map((mode) => (
              <Button key={mode.label} type="button" variant="outline" size="sm" onClick={() => applyTaxMode(mode)}>
                Применить: {mode.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {generated && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
          <div className="font-semibold">Акт готов. Следующий шаг:</div>
          <div className="text-sm mt-1">Можно сразу создать счёт на оплату из данных акта.</div>
          <div className="mt-2">
            <Button type="button" variant="outline" onClick={handleCreateInvoiceFromAct}>Создать счёт из этого акта</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full text-lg py-6">
        {loading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Генерация PDF...</>
        ) : (
          <><FileDown className="h-5 w-5 mr-2" /> Скачать акт в PDF</>
        )}
      </Button>
    </div>
  )
}
