// Типы документов
export type DocumentType = 'invoice' | 'act' | 'contract'

// Реквизиты компании
export interface CompanyInfo {
  name: string
  shortName?: string
  inn: string
  kpp?: string
  ogrn?: string
  address?: string
  bankName?: string
  bik?: string
  accountNumber?: string
  corrAccount?: string
  phone?: string
  directorName?: string
  directorTitle?: string // "Генеральный директор", "ИП", "Самозанятый"
}

// Ставки НДС
export type VatRate = 0 | 5 | 7 | 10 | 20

// Позиция в документе (товар/услуга)
export interface LineItem {
  id: string
  name: string
  unit: string // шт, ч, усл
  quantity: number
  price: number
  vatRate: VatRate
  amount: number // quantity * price
  vatAmount: number
  totalAmount: number // amount + vatAmount
}

// Данные счёта
export interface InvoiceData {
  number: string
  date: string // ISO date
  supplier: CompanyInfo
  buyer: CompanyInfo
  items: LineItem[]
  totalAmount: number
  totalVat: number
  grandTotal: number
  notes?: string
}

// Данные акта
export interface ActData {
  number: string
  date: string
  supplier: CompanyInfo
  buyer: CompanyInfo
  items: LineItem[]
  totalAmount: number
  totalVat: number
  grandTotal: number
  contractNumber?: string
  contractDate?: string
  periodFrom?: string
  periodTo?: string
}

// Данные договора
export interface ContractData {
  number: string
  date: string
  supplier: CompanyInfo
  buyer: CompanyInfo
  subject: string // Предмет договора
  items: LineItem[]
  totalAmount: number
  totalVat: number
  grandTotal: number
  startDate: string
  endDate: string
  paymentTerms: string // Порядок оплаты
  paymentDays: number // Срок оплаты в днях
  penaltyRate: number // Неустойка %
  jurisdiction: string // Подсудность
}

// DaData response types
export interface DaDataCompany {
  value: string
  data: {
    name: {
      full_with_opf: string
      short_with_opf: string
    }
    inn: string
    kpp: string | null
    ogrn: string | null
    address: {
      value: string
    }
    management?: {
      name: string
      post: string
    }
    type: 'LEGAL' | 'INDIVIDUAL' | 'LEGAL'
    opf?: {
      short: string // ООО, ИП, АО
    }
  }
}

export interface DaDataBank {
  value: string
  data: {
    bic: string
    name: {
      payment: string
      short: string
    }
    correspondent_account: string
  }
}
