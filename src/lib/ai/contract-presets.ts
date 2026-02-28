export type ContractPresetId = 'nda' | 'one_time_service' | 'monthly_retainer' | 'dev_contract' | 'marketing_contract'

export interface ContractPreset {
  id: ContractPresetId
  name: string
  description: string
  aiBrief: string
  defaults: {
    subject: string
    paymentTerms: string
    paymentDays: number
    penaltyRate: number
    jurisdiction: string
  }
}

export const CONTRACT_PRESETS: ContractPreset[] = [
  {
    id: 'nda',
    name: 'NDA + услуги',
    description: 'Для работ с коммерческой тайной и ограничением разглашения',
    aiBrief: 'Договор с NDA между ООО Заказчик и ИП Исполнитель на консультации 120000, запрет разглашения, срок до 2026-06-30',
    defaults: {
      subject: 'Оказание услуг с обязательством о неразглашении конфиденциальной информации',
      paymentTerms: 'Оплата в течение 5 рабочих дней после подписания акта. Нарушение NDA влечёт штраф, определённый договором.',
      paymentDays: 5,
      penaltyRate: 0.15,
      jurisdiction: 'Арбитражный суд г. Москвы',
    },
  },
  {
    id: 'one_time_service',
    name: 'Разовая услуга',
    description: 'Подходит для одноразового проекта с фиксированной оплатой',
    aiBrief: 'Разовый договор на дизайн презентации между ООО Альфа и ИП Петров за 45000, срок до 2026-03-15',
    defaults: {
      subject: 'Оказание разовых услуг по заданию Заказчика',
      paymentTerms: '100% оплата в течение 5 рабочих дней после подписания акта оказанных услуг.',
      paymentDays: 5,
      penaltyRate: 0.1,
      jurisdiction: 'Арбитражный суд по месту нахождения Исполнителя',
    },
  },
  {
    id: 'monthly_retainer',
    name: 'Ежемесячный ретейнер',
    description: 'Для регулярного обслуживания и абонентской модели',
    aiBrief: 'Ежемесячный договор на маркетинг между ООО Ромашка и ООО Перформанс, 95000 в месяц, оплата до 5 числа',
    defaults: {
      subject: 'Ежемесячное оказание услуг по абонентской модели',
      paymentTerms: 'Оплата производится ежемесячно авансом до 5-го числа расчётного месяца.',
      paymentDays: 5,
      penaltyRate: 0.1,
      jurisdiction: 'Арбитражный суд г. Москвы',
    },
  },
  {
    id: 'dev_contract',
    name: 'Разработка ПО',
    description: 'Для разработки сайта/приложения с этапами сдачи',
    aiBrief: 'Договор на разработку веб-приложения между ООО Тех и ИП Разработчик, 600000, 3 этапа, срок до 2026-08-01',
    defaults: {
      subject: 'Разработка программного обеспечения по техническому заданию Заказчика',
      paymentTerms: 'Оплата по этапам: 30% аванс, 40% после промежуточного этапа, 30% после финального акта.',
      paymentDays: 5,
      penaltyRate: 0.2,
      jurisdiction: 'Арбитражный суд по месту нахождения Заказчика',
    },
  },
  {
    id: 'marketing_contract',
    name: 'Маркетинговые услуги',
    description: 'Для перформанс-маркетинга, SMM, контента',
    aiBrief: 'Договор на маркетинговое сопровождение между ООО Бренд и ИП Маркетолог, 140000 в месяц, KPI и отчётность',
    defaults: {
      subject: 'Оказание маркетинговых услуг и предоставление отчётности по результатам',
      paymentTerms: 'Оплата ежемесячно в течение 5 рабочих дней с даты выставления счёта.',
      paymentDays: 5,
      penaltyRate: 0.1,
      jurisdiction: 'Арбитражный суд г. Москвы',
    },
  },
]

export function getContractPreset(id: string) {
  return CONTRACT_PRESETS.find((p) => p.id === id) || CONTRACT_PRESETS[0]
}
