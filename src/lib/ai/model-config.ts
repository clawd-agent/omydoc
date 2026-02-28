import type { AIDocumentType } from '@/lib/ai/prompts'

export function getModelConfigByType(documentType: AIDocumentType) {
  const maxTokensByType: Record<AIDocumentType, number> = {
    invoice: 900,
    act: 1200,
    contract: 1500,
  }

  const maxInputCharsByType: Record<AIDocumentType, number> = {
    invoice: 1600,
    act: 2200,
    contract: 2800,
  }

  return {
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: maxTokensByType[documentType],
    max_input_chars: maxInputCharsByType[documentType],
  }
}
