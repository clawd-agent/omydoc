'use client'

import { useCallback } from 'react'
import { generateId } from '@/lib/documents/calculations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import type { LineItem, VatRate } from '@/types'
import { calculateLineItem, formatMoney } from '@/lib/documents/calculations'

interface LineItemsTableProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

const vatOptions: { value: string; label: string }[] = [
  { value: '0', label: 'Без НДС' },
  { value: '5', label: '5%' },
  { value: '7', label: '7%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '22', label: '22%' },
]

const unitOptions = ['шт', 'усл', 'ч', 'мес', 'компл', 'м²', 'м³', 'км', 'кг', 'л']

export function LineItemsTable({ items, onChange }: LineItemsTableProps) {
  const addItem = useCallback(() => {
    const newItem = calculateLineItem({
      id: generateId(),
      name: '',
      unit: 'усл',
      quantity: 1,
      price: 0,
      vatRate: 0,
    })
    onChange([...items, newItem])
  }, [items, onChange])

  const removeItem = useCallback((id: string) => {
    onChange(items.filter(item => item.id !== id))
  }, [items, onChange])

  const updateItem = useCallback((id: string, field: string, value: string | number) => {
    onChange(items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      return calculateLineItem(updated)
    }))
  }, [items, onChange])

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-emerald-600" />
        </div>
        Товары / Услуги
      </h3>

      {/* Десктопная таблица */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-3 font-semibold text-slate-600 w-8">№</th>
              <th className="text-left p-3 font-semibold text-slate-600">Наименование</th>
              <th className="text-left p-3 font-semibold text-slate-600 w-24">Ед.</th>
              <th className="text-right p-3 font-semibold text-slate-600 w-24">Кол-во</th>
              <th className="text-right p-3 font-semibold text-slate-600 w-32">Цена, ₽</th>
              <th className="text-left p-3 font-semibold text-slate-600 w-28">НДС</th>
              <th className="text-right p-3 font-semibold text-slate-600 w-32">Сумма, ₽</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="p-3 text-slate-400 font-medium">{index + 1}</td>
                <td className="p-3">
                  <Input
                    placeholder="Наименование услуги"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="h-10"
                  />
                </td>
                <td className="p-3">
                  <Select value={item.unit} onValueChange={(v) => updateItem(item.id, 'unit', v)}>
                    <SelectTrigger size="sm" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-10 text-right font-mono"
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price || ''}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="h-10 text-right font-mono"
                  />
                </td>
                <td className="p-3">
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(v) => updateItem(item.id, 'vatRate', parseInt(v) as VatRate)}
                  >
                    <SelectTrigger size="sm" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vatOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right font-bold text-slate-900 font-mono">
                  {formatMoney(item.totalAmount)}
                </td>
                <td className="p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Мобильные карточки */}
      <div className="md:hidden space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500">Позиция {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-red-500 hover:bg-red-50"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Наименование"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Ед.</label>
                <Select value={item.unit} onValueChange={(v) => updateItem(item.id, 'unit', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Кол-во</label>
                <Input
                  type="number"
                  min="0"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Цена, ₽</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price || ''}
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Select
                value={String(item.vatRate)}
                onValueChange={(v) => updateItem(item.id, 'vatRate', parseInt(v) as VatRate)}
              >
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vatOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="font-bold text-slate-900 font-mono">{formatMoney(item.totalAmount)} ₽</span>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Добавить позицию
      </Button>
    </div>
  )
}
