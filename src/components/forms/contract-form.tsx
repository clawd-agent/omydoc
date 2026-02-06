'use client'

import { useState, useCallback, useMemo } from 'react'
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
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError } from '@/lib/analytics/metrika'

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

export function ContractForm() {
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

  const totals = useMemo(() => calculateTotals(items), [items])

  const handleGenerate = useCallback(async () => {
    if (!supplier.inn || !supplier.name) {
      setError('Заполните реквизиты исполнителя (ИНН и наименование)')
      return
    }
    if (!buyer.inn || !buyer.name) {
      setError('Заполните реквизиты заказчика (ИНН и наименование)')
      return
    }
    if (!subject) {
      setError('Укажите предмет договора')
      return
    }
    if (items.length === 0 || !items[0].name) {
      setError('Добавьте хотя бы одну позицию')
      return
    }
    if (!endDate) {
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
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      trackGenerationError('contract', e instanceof Error ? e.message : 'Unknown error')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, subject, items, startDate, endDate, paymentTerms, paymentDays, penaltyRate, jurisdiction, totals])

  return (
    <div className="space-y-6">
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

      {/* Предмет договора */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Предмет договора</h3>
          <Textarea
            placeholder="Опишите предмет договора: разработка сайта, консультационные услуги, дизайн логотипа..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            rows={3}
          />
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
      <Card>
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
      <Card>
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
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Условия</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-terms">Порядок оплаты (необязательно)</Label>
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
