import type { CompanyInfo } from '@/types'

function filled(value?: string) {
  return Boolean(value?.trim())
}

function normalizeInn(inn?: string) {
  return (inn || '').replace(/\D/g, '')
}

export function hasValidInn(inn?: string) {
  const normalized = normalizeInn(inn)
  return normalized.length === 10 || normalized.length === 12
}

export function hasCompanyIdentity(company: Pick<CompanyInfo, 'inn' | 'name'>) {
  return hasValidInn(company.inn) && filled(company.name)
}

export function canTrackCompanyFilled(params: {
  supplier: Pick<CompanyInfo, 'inn' | 'name'>
  buyer: Pick<CompanyInfo, 'inn' | 'name'>
  alreadyTracked: boolean
}) {
  const { supplier, buyer, alreadyTracked } = params
  if (alreadyTracked) return false
  return hasCompanyIdentity(supplier) && hasCompanyIdentity(buyer)
}
