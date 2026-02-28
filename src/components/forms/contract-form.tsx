'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileDown, Loader2 } from 'lucide-react'
import { CompanyFields } from './company-fields'
import { LineItemsTable } from './line-items-table'
import type { CompanyInfo, LineItem, ContractData } from '@/types'
import { calculateLineItem, calculateTotals, formatMoney, generateDocNumber, todayISO, generateId } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError, trackFormStart, trackCompanyFilled, trackValidationError } from '@/lib/analytics/metrika'
import { canTrackCompanyFilled } from '@/lib/analytics/funnel'
import { getContractWizardStatus } from '@/lib/ai/contract-wizard'

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

interface ParsedContractData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  subject?: string
  startDate?: string
  endDate?: string
  paymentTerms?: string
  paymentDays?: number
  penaltyRate?: number
  jurisdiction?: string
}

interface ContractFormProps {
  initialData?: ParsedContractData
}

const contractTemplates = [
  {
    label: 'Разработка сайта',
    subject: 'Разработка сайта и внедрение базовой CMS по техническому заданию Заказчика',
    itemName: 'Разработка сайта',
    paymentTerms: '50% аванс в течение 3 рабочих дней, 50% после подписания акта.',
    paymentDays: 5,
    penaltyRate: 0.1,
    jurisdiction: 'Арбитражный суд г. Москвы',
  },
  {
    label: 'Маркетинг и лидогенерация',
    subject: 'Оказание маркетинговых услуг: подготовка контент-плана, запуск рекламных кампаний и ежемесячная оптимизация',
    itemName: 'Маркетинговые услуги за месяц',
    paymentTerms: 'Ежемесячная предоплата до 5-го числа расчётного месяца.',
    paymentDays: 3,
    penaltyRate: 0.1,
    jurisdiction: 'Арбитражный суд по месту нахождения Исполнителя',
  },
  {
    label: 'Консалтинг',
    subject: 'Оказание консультационных услуг по вопросам внедрения продукта и операционных процессов',
    itemName: 'Консультационные услуги',
    paymentTerms: '100% постоплата в течение 5 рабочих дней после подписания акта.',
    paymentDays: 5,
    penaltyRate: 0.1,
    jurisdiction: 'Арбитражный суд г. Москвы',
  },
] as const

export function ContractForm({ initialData }: ContractFormProps) {
  const [number, setNumber] = useState(generateDocNumber())
  const [date, setDate] = useState(todayISO())
  const [supplier, setSupplier] = useState<CompanyInfo>(emptyCompany)
  const [buyer, setBuyer] = useState<CompanyInfo>(emptyCompany)
  const [items, setItems] = useState<LineItem[]>([
    calculateLineItem({ id: generateId(), name: '', unit: 'усл', quantity: 1, price: 0, vatRate: 0 }),
  ])
  const [subject, setSubject] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [paymentDays, setPaymentDays] = useState(5)
  const [penaltyRate, setPenaltyRate] = useState(0.1)
  const [jurisdiction, setJurisdiction] = useState('Арбитражный суд г. Москвы')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formStartTrackedRef = useRef(false)
  const companyFilledTrackedRef = useRef(false)

  const totals = useMemo(() => calculateTotals(items), [items])
  const wizardStatus = useMemo(() => getContractWizardStatus({
    supplierName: supplier.name,
    supplierInn: supplier.inn,
    buyerName: buyer.name,
    buyerInn: buyer.inn,
    subject,
    firstItemName: items[0]?.name,
    paymentDays,
    paymentTerms,
    penaltyRate,
    jurisdiction,
    endDate,
  }), [supplier, buyer, subject, items, paymentDays, paymentTerms, penaltyRate, jurisdiction, endDate])

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

    if (initialData.subject) setSubject(initialData.subject)
    if (initialData.startDate) setStartDate(initialData.startDate)
    if (initialData.endDate) setEndDate(initialData.endDate)
    if (initialData.paymentTerms) setPaymentTerms(initialData.paymentTerms)
    if (typeof initialData.paymentDays === 'number' && initialData.paymentDays > 0) setPaymentDays(initialData.paymentDays)
    if (typeof initialData.penaltyRate === 'number' && initialData.penaltyRate >= 0) setPenaltyRate(initialData.penaltyRate)
    if (initialData.jurisdiction) setJurisdiction(initialData.jurisdiction)
  }, [initialData])

  const handleFirstInteraction = useCallback(() => {
    if (formStartTrackedRef.current) return
    formStartTrackedRef.current = true
    trackFormStart('contract')
  }, [])

  useEffect(() => {
    if (!canTrackCompanyFilled({
      supplier,
      buyer,
      alreadyTracked: companyFilledTrackedRef.current,
    })) return

    companyFilledTrackedRef.current = true
    trackCompanyFilled('contract')
  }, [supplier, buyer])

  const applyTemplate = useCallback((template: (typeof contractTemplates)[number]) => {
    setSubject(template.subject)
    setPaymentTerms(template.paymentTerms)
    setPaymentDays(template.paymentDays)
    setPenaltyRate(template.penaltyRate)
    setJurisdiction(template.jurisdiction)
    setItems([
      calculateLineItem({
        id: generateId(),
        name: template.itemName,
        unit: 'усл',
        quantity: 1,
        price: 0,
        vatRate: 0,
      }),
    ])
  }, [])

  const useSubjectAsFirstItem = useCallback(() => {
    const normalized = subject.trim()
    if (!normalized) return
    setItems((prev) => {
      if (prev.length === 0) {
        return [
          calculateLineItem({ id: generateId(), name: normalized, unit: 'усл', quantity: 1, price: 0, vatRate: 0 }),
        ]
      }
      const [first, ...rest] = prev
      return [
        calculateLineItem({
          ...first,
          name: normalized,
          unit: first.unit || 'усл',
          quantity: first.quantity || 1,
          price: first.price || 0,
          vatRate: first.vatRate,
        }),
        ...rest,
      ]
    })
  }, [subject])

  const handleGenerate = useCallback(async () => {
    if (!supplier.inn || !supplier.name) {
      trackValidationError('contract', 'supplier')
      setError('Заполните реквизиты исполнителя (ИНН и наименование)')
      return
    }
    if (!buyer.inn || !buyer.name) {
      trackValidationError('contract', 'buyer')
      setError('Заполните реквизиты заказчика (ИНН и наименование)')
      return
    }
    if (!subject) {
      trackValidationError('contract', 'subject')
      setError('Укажите предмет договора')
      return
    }
    if (items.length === 0 || !items[0].name) {
      trackValidationError('contract', 'items')
      setError('Добавьте хотя бы одну позицию')
      return
    }
    if (!endDate) {
      trackValidationError('contract', 'endDate')
      setError('Укажите дату окончания договора')
      return
    }
    setError('')

    const data: ContractData = {
      number,
      date,
      supplier,
      buyer,
      subject,
      items,
      totalAmount: totals.totalAmount,
      totalVat: totals.totalVat,
      grandTotal: totals.grandTotal,
      startDate,
      endDate,
      paymentTerms,
      paymentDays,
      penaltyRate,
      jurisdiction,
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contract', data }),
      })

      if (!res.ok) throw new Error('Failed to generate PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Договор_${number}_${date}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Отправляем цели в Яндекс.Метрику
      trackPdfGenerated('contract')
      trackPdfDownloaded('contract')
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('omydoc:package:done:contract', '1')
      }
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      trackGenerationError('contract', e instanceof Error ? e.message : 'Unknown error')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, subject, items, startDate, endDate, paymentTerms, paymentDays, penaltyRate, jurisdiction, totals])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6" onFocusCapture={handleFirstInteraction}>
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Мастер заполнения</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              { id: 'parties', title: 'Стороны', done: wizardStatus.partiesDone },
              { id: 'scope', title: 'Предмет', done: wizardStatus.scopeDone },
              { id: 'payment', title: 'Оплата', done: wizardStatus.paymentDone },
              { id: 'penalty-rate', title: 'Ответственность', done: wizardStatus.liabilityDone },
              { id: 'preview', title: 'Проверка', done: wizardStatus.previewDone },
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

      {/* Номер и дата */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract-number">Номер договора</Label>
              <Input id="contract-number" value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contract-date">Дата</Label>
              <Input id="contract-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">Быстрые шаблоны договора</h3>
          <div className="flex flex-wrap gap-2">
            {contractTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-violet-300"
              >
                {template.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Заполняем предмет, оплату и первую позицию — остаётся уточнить реквизиты и суммы.</p>
        </CardContent>
      </Card>

      {/* Предмет договора */}
      <Card id="scope">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Предмет договора</h3>
          <Textarea
            placeholder="Опишите предмет договора: разработка сайта, консультационные услуги, дизайн логотипа..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={useSubjectAsFirstItem}
              className="text-xs px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100"
            >
              Использовать предмет как первую позицию
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Сроки */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Сроки</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Дата начала</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date">Дата окончания *</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Исполнитель */}
      <Card id="parties">
        <CardContent className="pt-6">
          <CompanyFields prefix="supplier" label="Исполнитель" value={supplier} onChange={setSupplier} showBankDetails={true} />
        </CardContent>
      </Card>

      {/* Заказчик */}
      <Card>
        <CardContent className="pt-6">
          <CompanyFields prefix="buyer" label="Заказчик" value={buyer} onChange={setBuyer} showBankDetails={true} />
        </CardContent>
      </Card>

      {/* Позиции */}
      <Card>
        <CardContent className="pt-6">
          <LineItemsTable items={items} onChange={setItems} />
        </CardContent>
      </Card>

      {/* Итого */}
      <Card id="preview">
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
              <span className="text-lg font-semibold">Стоимость услуг:</span>
              <span className="text-lg font-bold w-32">{formatMoney(totals.grandTotal)} ₽</span>
            </div>
            {totals.grandTotal > 0 && (
              <p className="text-sm text-gray-500 italic">{amountToWords(totals.grandTotal)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Условия оплаты */}
      <Card id="payment">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Условия</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-terms">Порядок оплаты (необязательно)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: 'Постоплата 5д', value: '100% постоплата в течение 5 рабочих дней после подписания акта.' },
                  { label: '50/50 этапы', value: '50% аванс в течение 3 рабочих дней, 50% после подписания акта.' },
                  { label: 'Месячный аванс', value: 'Ежемесячная предоплата до 5-го числа расчётного месяца.' },
                ].map((hint) => (
                  <button
                    key={hint.label}
                    type="button"
                    onClick={() => setPaymentTerms(hint.value)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-violet-300"
                  >
                    {hint.label}
                  </button>
                ))}
              </div>
              <Textarea
                id="payment-terms"
                placeholder="Если не заполнено, будет стандартная формулировка"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payment-days">Срок оплаты (дней)</Label>
                <Input
                  id="payment-days"
                  type="number"
                  min="1"
                  value={paymentDays}
                  onChange={(e) => setPaymentDays(parseInt(e.target.value) || 5)}
                />
              </div>
              <div>
                <Label htmlFor="penalty-rate">Неустойка (%/день)</Label>
                <Input
                  id="penalty-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={penaltyRate}
                  onChange={(e) => setPenaltyRate(parseFloat(e.target.value) || 0.1)}
                />
              </div>
              <div>
                <Label htmlFor="jurisdiction">Подсудность</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: 'Москва', value: 'Арбитражный суд г. Москвы' },
                    { label: 'По исполнителю', value: 'Арбитражный суд по месту нахождения Исполнителя' },
                    { label: 'По заказчику', value: 'Арбитражный суд по месту нахождения Заказчика' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setJurisdiction(option.value)}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-violet-300"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <Input
                  id="jurisdiction"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                />
              </div>
            </div>
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
          <><FileDown className="h-5 w-5 mr-2" /> Скачать договор в PDF</>
        )}
      </Button>
    </div>
  )
}
