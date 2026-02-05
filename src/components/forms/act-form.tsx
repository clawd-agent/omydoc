'use client'

import { useState, useCallback, useMemo } from 'react'
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

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

export function ActForm() {
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
    if (items.length === 0 || !items[0].name) {
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
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, items, contractNumber, contractDate, periodFrom, periodTo, totals])

  return (
    <div className="space-y-6">
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
      <Card>
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
      <Card>
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
