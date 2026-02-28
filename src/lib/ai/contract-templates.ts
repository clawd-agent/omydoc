export type ContractTemplateId = 'simple' | 'expert'

export interface ContractTemplate {
  id: ContractTemplateId
  name: string
  description: string
  draft: {
    subject: string
    paymentTerms: string
    paymentDays: number
    penaltyRate: number
    jurisdiction: string
  }
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'simple',
    name: 'Простой шаблон',
    description: 'Быстрый договор с базовыми условиями для типовых услуг',
    draft: {
      subject: 'Оказание консультационных услуг',
      paymentTerms: 'Заказчик оплачивает услуги на основании счёта в полном объёме.',
      paymentDays: 5,
      penaltyRate: 0.1,
      jurisdiction: 'Арбитражный суд г. Москвы',
    },
  },
  {
    id: 'expert',
    name: 'Экспертный шаблон',
    description: 'Более строгие формулировки для B2B и долгих проектов',
    draft: {
      subject: 'Оказание профессиональных услуг по техническому заданию Заказчика',
      paymentTerms: 'Оплата производится поэтапно: 50% аванс в течение 3 рабочих дней после подписания, 50% — в течение 5 рабочих дней после подписания акта.',
      paymentDays: 5,
      penaltyRate: 0.15,
      jurisdiction: 'Арбитражный суд по месту нахождения Исполнителя',
    },
  },
]

export function getContractTemplate(id: string): ContractTemplate {
  return CONTRACT_TEMPLATES.find((t) => t.id === id) || CONTRACT_TEMPLATES[0]
}
