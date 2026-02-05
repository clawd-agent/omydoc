import { z } from 'zod'

// Реквизиты компании
export const companySchema = z.object({
  name: z.string().min(1, 'Укажите наименование'),
  shortName: z.string().optional(),
  inn: z.string()
    .min(10, 'ИНН должен содержать 10 или 12 цифр')
    .max(12, 'ИНН должен содержать 10 или 12 цифр')
    .regex(/^\d+$/, 'ИНН должен содержать только цифры'),
  kpp: z.string().optional(),
  ogrn: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bik: z.string().optional(),
  accountNumber: z.string().optional(),
  corrAccount: z.string().optional(),
  phone: z.string().optional(),
  directorName: z.string().optional(),
  directorTitle: z.string().optional(),
})

// Позиция в документе
export const lineItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Укажите наименование'),
  unit: z.string().default('шт'),
  quantity: z.number().positive('Количество должно быть больше 0'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  vatRate: z.union([z.literal(0), z.literal(5), z.literal(7), z.literal(10), z.literal(20)]).default(0),
  amount: z.number(),
  vatAmount: z.number(),
  totalAmount: z.number(),
})

// Счёт
export const invoiceSchema = z.object({
  number: z.string().min(1, 'Укажите номер счёта'),
  date: z.string().min(1, 'Укажите дату'),
  supplier: companySchema,
  buyer: companySchema,
  items: z.array(lineItemSchema).min(1, 'Добавьте хотя бы одну позицию'),
  totalAmount: z.number(),
  totalVat: z.number(),
  grandTotal: z.number(),
  notes: z.string().optional(),
})

// Акт
export const actSchema = z.object({
  number: z.string().min(1, 'Укажите номер акта'),
  date: z.string().min(1, 'Укажите дату'),
  supplier: companySchema,
  buyer: companySchema,
  items: z.array(lineItemSchema).min(1, 'Добавьте хотя бы одну позицию'),
  totalAmount: z.number(),
  totalVat: z.number(),
  grandTotal: z.number(),
  contractNumber: z.string().optional(),
  contractDate: z.string().optional(),
  periodFrom: z.string().optional(),
  periodTo: z.string().optional(),
})

// Договор
export const contractSchema = z.object({
  number: z.string().min(1, 'Укажите номер договора'),
  date: z.string().min(1, 'Укажите дату'),
  supplier: companySchema,
  buyer: companySchema,
  subject: z.string().min(1, 'Укажите предмет договора'),
  items: z.array(lineItemSchema).min(1, 'Добавьте хотя бы одну позицию'),
  totalAmount: z.number(),
  totalVat: z.number(),
  grandTotal: z.number(),
  startDate: z.string().min(1, 'Укажите дату начала'),
  endDate: z.string().min(1, 'Укажите дату окончания'),
  paymentTerms: z.string().optional().default(''),
  paymentDays: z.number().default(5),
  penaltyRate: z.number().default(0.1),
  jurisdiction: z.string().default('Арбитражный суд г. Москвы'),
})

export type CompanyFormData = z.infer<typeof companySchema>
export type LineItemFormData = z.infer<typeof lineItemSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type ActFormData = z.infer<typeof actSchema>
export type ContractFormData = z.infer<typeof contractSchema>
