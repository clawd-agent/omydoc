export type AIDocumentType = 'invoice' | 'act' | 'contract'

export function getSystemPrompt(documentType: AIDocumentType) {
  const base = `Извлеки данные из текста в JSON.

РОЛИ (не путай!):
- supplier = кто оказывает услугу / продаёт / выставляет документ
- buyer = клиент / заказчик / покупатель

"Документ для X" → X это BUYER.

ОБЩИЙ ФОРМАТ:
{
  "supplier": {"s_name", "s_inn", "s_kpp", "s_address"},
  "buyer": {"b_name", "b_inn", "b_kpp", "b_address"},
  "items": [{"name", "qty", "unit", "price", "vat"}]
}

unit: шт/ч/усл. vat: 0/5/7/10/20/22.
Только JSON без пояснений.`

  if (documentType === 'act') {
    return `${base}\n\nДля АКТА дополнительно извлекай при наличии:\n{"contractNumber","contractDate","periodFrom","periodTo"}`
  }

  if (documentType === 'contract') {
    return `${base}\n\nДля ДОГОВОРА дополнительно извлекай при наличии:\n{"subject","startDate","endDate","paymentTerms","paymentDays","penaltyRate","jurisdiction"}`
  }

  return base
}
