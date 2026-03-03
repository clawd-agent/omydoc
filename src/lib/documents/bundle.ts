import type { CompanyInfo, LineItem } from '@/types'

interface InvoiceLikeDraft {
  number: string
  date: string
  supplier: CompanyInfo
  buyer: CompanyInfo
  items: LineItem[]
}

export function buildActDraftFromInvoice(invoice: InvoiceLikeDraft) {
  return {
    supplier: invoice.supplier,
    buyer: invoice.buyer,
    items: invoice.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      vatRate: item.vatRate,
    })),
    contractNumber: invoice.number,
    contractDate: invoice.date,
  }
}

export function buildInvoiceDraftFromAct(act: InvoiceLikeDraft) {
  return {
    supplier: act.supplier,
    buyer: act.buyer,
    items: act.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      vatRate: item.vatRate,
    })),
    notes: `Основание: акт №${act.number} от ${act.date}`,
  }
}

interface ContractLikeDraft {
  number: string
  date: string
  supplier: CompanyInfo
  buyer: CompanyInfo
  items: LineItem[]
}

export function buildInvoiceDraftFromContract(contract: ContractLikeDraft) {
  return {
    supplier: contract.supplier,
    buyer: contract.buyer,
    items: contract.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      vatRate: item.vatRate,
    })),
    notes: `Основание: договор №${contract.number} от ${contract.date}`,
  }
}

export function buildActDraftFromContract(contract: ContractLikeDraft) {
  return {
    supplier: contract.supplier,
    buyer: contract.buyer,
    items: contract.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      vatRate: item.vatRate,
    })),
    contractNumber: contract.number,
    contractDate: contract.date,
  }
}

interface ParsedInvoiceLikeData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
}

export function buildDraftPackageFromInvoiceAI(data: ParsedInvoiceLikeData) {
  const items = (data.items || []).map((item) => ({
    name: String(item.name || ''),
    quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
    unit: String(item.unit || 'усл'),
    price: Number(item.price || 0) || 0,
    vatRate: Number(item.vatRate ?? item.vat ?? 0) || 0,
  }))

  return {
    act: {
      supplier: data.supplier,
      buyer: data.buyer,
      items,
    },
    contract: {
      supplier: data.supplier,
      buyer: data.buyer,
      items,
      subject: items[0]?.name ? `Оказание услуг: ${items[0].name}` : 'Оказание услуг по заданию Заказчика',
      paymentTerms: 'Оплата в течение 5 рабочих дней после подписания акта.',
      paymentDays: 5,
      penaltyRate: 0.1,
      jurisdiction: 'Арбитражный суд г. Москвы',
    },
  }
}
