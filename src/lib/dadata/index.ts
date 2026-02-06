import type { DaDataCompany, DaDataBank, CompanyInfo } from '@/types'
import { writeFileSync } from 'fs'

const DADATA_BASE = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs'

async function dadataRequest<T>(endpoint: string, query: string): Promise<T[]> {
  const apiKey = process.env.DADATA_API_KEY
  if (!apiKey) {
    throw new Error('DADATA_API_KEY is not set')
  }

  const res = await fetch(`${DADATA_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({ query, count: 5 }),
  })

  if (!res.ok) {
    throw new Error(`DaData API error: ${res.status}`)
  }

  const data = await res.json()
  return data.suggestions || []
}

// Поиск компании по ИНН
export async function findCompanyByInn(inn: string): Promise<DaDataCompany[]> {
  return dadataRequest<DaDataCompany>('/findById/party', inn)
}

// Поиск банка по БИК
export async function findBankByBik(bik: string): Promise<DaDataBank[]> {
  return dadataRequest<DaDataBank>('/findById/bank', bik)
}

// Подсказки компаний (по названию или ИНН)
export async function suggestCompany(query: string): Promise<DaDataCompany[]> {
  return dadataRequest<DaDataCompany>('/suggest/party', query)
}

// Преобразование данных DaData в наш формат CompanyInfo
export function dadataToCompanyInfo(company: DaDataCompany): Partial<CompanyInfo> {
  const d = company.data
  const isIP = d.type === 'INDIVIDUAL'
  
  // DEBUG: Write to file
  const rawShort = d.name?.short_with_opf
  const rawFull = d.name?.full_with_opf
  try {
    writeFileSync('/tmp/dadata-debug.log', JSON.stringify({ rawShort, rawFull, nameObj: d.name }, null, 2))
  } catch (e) { /* ignore */ }
  
  // Priority: short_with_opf > full_with_opf > full > short
  // short_with_opf is most reliable (e.g. "ПАО СБЕРБАНК", "ООО РОМАШКА")
  const name = rawShort || rawFull || d.name?.full || d.name?.short || ''
  
  console.log('DaData name resolved:', name, 'rawShort was:', rawShort)

  return {
    name,
    shortName: d.name?.short_with_opf || d.name?.short || '',
    inn: d.inn,
    kpp: d.kpp || undefined,
    ogrn: d.ogrn || undefined,
    address: d.address?.value,
    directorName: isIP 
      ? (d.name?.full || d.name?.short || '').replace(/^ИП\s+/, '') 
      : d.management?.name,
    directorTitle: isIP 
      ? 'Индивидуальный предприниматель' 
      : d.management?.post || 'Генеральный директор',
  }
}

export function dadataToBankInfo(bank: DaDataBank) {
  return {
    bankName: bank.data.name.payment || bank.data.name.short,
    bik: bank.data.bic,
    corrAccount: bank.data.correspondent_account,
  }
}
