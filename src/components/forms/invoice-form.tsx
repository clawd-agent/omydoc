'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileDown, Loader2, Calendar, Hash } from 'lucide-react'
import { CompanyFields } from './company-fields'
import { LineItemsTable } from './line-items-table'
import type { CompanyInfo, LineItem, InvoiceData } from '@/types'
import { calculateLineItem, calculateTotals, formatMoney, generateDocNumber, todayISO, generateId } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError } from '@/lib/analytics/metrika'

const emptyCompany: CompanyInfo = {
  name: '', inn: '', kpp: '', ogrn: '', address: '',
  bankName: '', bik: '', accountNumber: '', corrAccount: '',
  phone: '', directorName: '', directorTitle: '',
}

export function InvoiceForm() {
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

  const totals = useMemo(() => calculateTotals(items), [items])

  const handleGenerate = useCallback(async () => {
    if (!supplier.inn || !supplier.name) {
      setError('Заполните реквизиты поставщика (ИНН и наименование)')
      return
    }
    if (!buyer.inn || !buyer.name) {
      setError('Заполните реквизиты покупателя (ИНН и наименование)')
      return
    }
    if (items.length === 0 || !items[0].name) {
      setError('Добавьте хотя бы одну позицию')
      return
    }
    setError('')

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
    } catch (e) {
      setError('Ошибка генерации PDF. Попробуйте ещё раз.')
      trackGenerationError('invoice', e instanceof Error ? e.message : 'Unknown error')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [number, date, supplier, buyer, items, notes, totals])

  return (
    <div className="space-y-6">
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
      <Card>
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
      <Card>
        <CardContent>
          <LineItemsTable items={items} onChange={setItems} />
        </CardContent>
      </Card>

      {/* Итого */}
      <Card>
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

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Кнопка генерации */}
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
    </div>
  )
}
