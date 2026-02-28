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

export function ActForm({ initialData }: ActFormProps) {
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
