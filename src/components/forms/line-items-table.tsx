'use client'

import { useCallback } from 'react'
import { generateId } from '@/lib/documents/calculations'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
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
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Товары / Услуги</h3>

      {/* Десктопная таблица */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 w-8">№</th>
              <th className="text-left p-2">Наименование</th>
              <th className="text-left p-2 w-20">Ед.</th>
              <th className="text-right p-2 w-20">Кол-во</th>
              <th className="text-right p-2 w-28">Цена, ₽</th>
              <th className="text-left p-2 w-28">НДС</th>
              <th className="text-right p-2 w-28">Сумма, ₽</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="p-2 text-gray-500">{index + 1}</td>
                <td className="p-2">
                  <Input
                    placeholder="Наименование услуги"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="p-2">
                  <Select value={item.unit} onValueChange={(v) => updateItem(item.id, 'unit', v)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-8 text-right"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price || ''}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="h-8 text-right"
                  />
                </td>
                <td className="p-2">
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(v) => updateItem(item.id, 'vatRate', parseInt(v) as VatRate)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vatOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 text-right font-medium">
                  {formatMoney(item.totalAmount)}
                </td>
                <td className="p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
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
          <div key={item.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Позиция {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
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
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Ед.</label>
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
                <label className="text-xs text-gray-500">Кол-во</label>
                <Input
                  type="number"
                  min="0"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Цена, ₽</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price || ''}
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
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
              <span className="font-semibold">{formatMoney(item.totalAmount)} ₽</span>
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
