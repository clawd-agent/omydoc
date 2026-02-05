import type { LineItem, VatRate } from '@/types'

// Простой генератор ID (работает без HTTPS, в отличие от crypto.randomUUID)
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

// Расчёт суммы НДС
export function calculateVat(amount: number, vatRate: VatRate): number {
  if (vatRate === 0) return 0
  return Math.round(amount * vatRate / 100 * 100) / 100
}

// Расчёт строки
export function calculateLineItem(item: Partial<LineItem>): LineItem {
  const quantity = item.quantity || 0
  const price = item.price || 0
  const vatRate = item.vatRate || 0
  const amount = Math.round(quantity * price * 100) / 100
  const vatAmount = calculateVat(amount, vatRate)
  const totalAmount = amount + vatAmount

  return {
    id: item.id || generateId(),
    name: item.name || '',
    unit: item.unit || 'шт',
    quantity,
    price,
    vatRate,
    amount,
    vatAmount,
    totalAmount,
  }
}

// Итоги по всем позициям
export function calculateTotals(items: LineItem[]) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0)
  const grandTotal = items.reduce((sum, item) => sum + item.totalAmount, 0)

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  }
}

// Форматирование числа как денежной суммы
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Генерация номера документа
export function generateDocNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${year}${month}-${random}`
}

// Текущая дата в формате ISO
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// Форматирование даты для отображения
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
