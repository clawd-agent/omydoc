import type { AIDocumentType } from '@/lib/ai/prompts'

interface ParsedLike {
  supplier?: Record<string, unknown>
  buyer?: Record<string, unknown>
  items?: Array<Record<string, unknown>>
  subject?: unknown
  endDate?: unknown
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasPartyCore(party?: Record<string, unknown>) {
  if (!party) return false
  return hasText(party.name) || hasText(party.inn)
}

export function calculateParseConfidence(docType: AIDocumentType, parsed: ParsedLike) {
  let score = 0

  if (hasPartyCore(parsed.supplier)) score += 0.25
  if (hasPartyCore(parsed.buyer)) score += 0.25

  const firstItem = parsed.items?.[0]
  if (firstItem && hasText(firstItem.name)) score += 0.25

  if (docType === 'contract') {
    if (hasText(parsed.subject)) score += 0.15
    if (hasText(parsed.endDate)) score += 0.1
  } else {
    if (parsed.items && parsed.items.length > 0) score += 0.25
  }

  return Number(Math.min(1, score).toFixed(2))
}

export function shouldRetryWithStrongModel(docType: AIDocumentType, confidence: number, inputLength: number) {
  const baseThresholdByType: Record<AIDocumentType, number> = {
    invoice: 0.5,
    act: 0.55,
    contract: 0.62,
  }

  const longInputBonus = inputLength > 1800 ? 0.05 : 0
  const threshold = Math.min(0.8, baseThresholdByType[docType] + longInputBonus)

  return confidence < threshold
}

export function buildParseWarnings(docType: AIDocumentType, parsed: ParsedLike, confidence: number) {
  const warnings: string[] = []

  if (!hasPartyCore(parsed.supplier)) warnings.push('Не определён исполнитель/поставщик')
  if (!hasPartyCore(parsed.buyer)) warnings.push('Не определён заказчик/покупатель')

  const firstItem = parsed.items?.[0]
  if (!firstItem || !hasText(firstItem.name)) warnings.push('Нет понятной позиции услуги/товара')

  if (docType === 'contract') {
    if (!hasText(parsed.subject)) warnings.push('Не найден предмет договора')
    if (!hasText(parsed.endDate)) warnings.push('Не найдена дата окончания договора')
  }

  if (confidence < 0.6) {
    warnings.push('Низкая уверенность AI — обязательно проверьте реквизиты и суммы')
  }

  return warnings.slice(0, 4)
}
