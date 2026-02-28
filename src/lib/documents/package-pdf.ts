import type { ActData, CompanyInfo, ContractData, InvoiceData, LineItem, VatRate } from '@/types'
import { calculateLineItem, calculateTotals, generateDocNumber, todayISO, generateId } from '@/lib/documents/calculations'

interface ParsedDraft {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  subject?: string
  endDate?: string
  paymentTerms?: string
  paymentDays?: number
  penaltyRate?: number
  jurisdiction?: string
  contractNumber?: string
  contractDate?: string
}

function mapCompany(raw?: Record<string, string>): CompanyInfo {
  return {
    name: raw?.name || '',
    inn: raw?.inn || '',
    kpp: raw?.kpp || '',
    ogrn: raw?.ogrn || '',
    address: raw?.address || '',
    bankName: raw?.bankName || '',
    bik: raw?.bik || '',
    accountNumber: raw?.accountNumber || '',
    corrAccount: raw?.corrAccount || '',
    phone: raw?.phone || '',
    directorName: raw?.directorName || '',
    directorTitle: raw?.directorTitle || '',
  }
}

function mapItems(items?: Array<Record<string, string | number>>): LineItem[] {
  const source = items && items.length ? items : [{ name: 'Услуги', quantity: 1, unit: 'усл', price: 0, vatRate: 0 }]
  const validVatRates = [0, 5, 7, 10, 20, 22]

  return source.map((item) => {
    const rawVat = Number(item.vatRate ?? item.vat ?? 0)
    const vatRate = (validVatRates.includes(rawVat) ? rawVat : 0) as VatRate

    return calculateLineItem({
      id: generateId(),
      name: String(item.name || 'Услуги'),
      unit: String(item.unit || 'усл'),
      quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
      price: Number(item.price || 0) || 0,
      vatRate,
    })
  })
}

export function buildInvoiceDataFromParsed(draft: ParsedDraft): InvoiceData {
  const items = mapItems(draft.items)
  const totals = calculateTotals(items)

  return {
    number: generateDocNumber(),
    date: todayISO(),
    supplier: mapCompany(draft.supplier),
    buyer: mapCompany(draft.buyer),
    items,
    totalAmount: totals.totalAmount,
    totalVat: totals.totalVat,
    grandTotal: totals.grandTotal,
  }
}

export function buildActDataFromParsed(draft: ParsedDraft): ActData {
  const items = mapItems(draft.items)
  const totals = calculateTotals(items)

  return {
    number: generateDocNumber(),
    date: todayISO(),
    supplier: mapCompany(draft.supplier),
    buyer: mapCompany(draft.buyer),
    items,
    totalAmount: totals.totalAmount,
    totalVat: totals.totalVat,
    grandTotal: totals.grandTotal,
    contractNumber: draft.contractNumber,
    contractDate: draft.contractDate,
  }
}

export function buildContractDataFromParsed(draft: ParsedDraft): ContractData {
  const items = mapItems(draft.items)
  const totals = calculateTotals(items)

  return {
    number: generateDocNumber(),
    date: todayISO(),
    supplier: mapCompany(draft.supplier),
    buyer: mapCompany(draft.buyer),
    subject: draft.subject || 'Оказание услуг по заданию Заказчика',
    items,
    totalAmount: totals.totalAmount,
    totalVat: totals.totalVat,
    grandTotal: totals.grandTotal,
    startDate: todayISO(),
    endDate: draft.endDate || todayISO(),
    paymentTerms: draft.paymentTerms || 'Оплата в течение 5 рабочих дней после подписания акта.',
    paymentDays: draft.paymentDays || 5,
    penaltyRate: draft.penaltyRate ?? 0.1,
    jurisdiction: draft.jurisdiction || 'Арбитражный суд г. Москвы',
  }
}
