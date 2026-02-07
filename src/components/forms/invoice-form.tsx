'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
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
import { trackPdfGenerated, trackPdfDownloaded, trackGenerationError } from '@/lib/analytics/metrika'

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

export function InvoiceForm({ initialData, defaultExpanded = true }: InvoiceFormProps) {
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
  const [expanded, setExpanded] = useState(defaultExpanded)

  const totals = useMemo(() => calculateTotals(items), [items])

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
        </>
      )}
    </div>
  )
}
