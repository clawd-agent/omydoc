import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Тарифы — OmyDoc',
  description: 'Тарифы генератора документов OmyDoc: бесплатный план до 5 документов, Pro за 650₽/мес — безлимит, Business за 1500₽/мес — для команд.',
}

const plans = [
  {
    name: 'Бесплатный',
    price: '0',
    period: '',
    description: 'Для разовых задач',
    features: [
      'До 5 документов в месяц',
      'Счета, акты, договоры',
      'Авто-заполнение по ИНН',
      'Скачивание в PDF',
      'Без регистрации для 1-го документа',
    ],
    cta: 'Начать бесплатно',
    href: '/schet',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '650',
    period: '/мес',
    description: 'Для ИП и фрилансеров',
    features: [
      'Безлимит документов',
      'Все типы документов',
      'Сохранение реквизитов',
      'История документов',
      'Свои шаблоны',
      'Приоритетная поддержка',
    ],
    cta: 'Выбрать Pro',
    href: '/schet',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '1 500',
    period: '/мес',
    description: 'Для компаний и бухгалтеров',
    features: [
      'Всё из Pro',
      'До 5 пользователей',
      'Мульти-юрлицо',
      'API доступ',
      'Экспорт в 1С',
      'ЭДО интеграция',
    ],
    cta: 'Выбрать Business',
    href: '/schet',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Тарифы', href: '/pricing' }]} />

      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Простые и понятные тарифы
        </h1>
        <p className="text-lg text-gray-600">
          Начните бесплатно — переходите на Pro, когда понадобится больше
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-xl p-6 flex flex-col ${
              plan.highlighted
                ? 'border-blue-500 ring-2 ring-blue-100 relative'
                : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-3 py-0.5 rounded-full">
                Популярный
              </div>
            )}

            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold">{plan.price} ₽</span>
              <span className="text-gray-500">{plan.period}</span>
            </div>

            <ul className="space-y-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.href} className="mt-6">
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                size="lg"
              >
                {plan.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Частые вопросы о тарифах</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <details className="group border rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-gray-50">
              Можно ли попробовать Pro бесплатно?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 text-gray-600">
              Да, первые 5 документов в месяц бесплатны для всех. Это позволяет полностью протестировать сервис.
              Pro нужен только если вам требуется больше документов или сохранение реквизитов.
            </div>
          </details>
          <details className="group border rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-gray-50">
              Как оплатить?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 text-gray-600">
              Картой Visa, Mastercard, МИР. Подписка продлевается автоматически. Отменить можно в любой момент.
            </div>
          </details>
          <details className="group border rounded-lg">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-gray-50">
              Можно ли получить закрывающие документы?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 text-gray-600">
              Да, мы предоставляем акт и счёт для юридических лиц на тарифах Pro и Business.
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
