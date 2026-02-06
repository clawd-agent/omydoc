import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumbs items={[{ name: 'Тарифы', href: '/pricing' }]} />

      <header className="text-center mb-14">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5">
          Простые и понятные тарифы
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium">
          Начните бесплатно — переходите на Pro, когда понадобится больше
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white border rounded-3xl p-8 flex flex-col transition-all ${
              plan.highlighted
                ? 'border-blue-500 shadow-xl shadow-blue-600/10 relative scale-105'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Популярный
              </div>
            )}

            <h2 className="text-xl font-black text-slate-900">{plan.name}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">{plan.description}</p>

            <div className="mt-5 mb-7">
              <span className="text-5xl font-black text-slate-900">{plan.price}</span>
              <span className="text-xl font-bold text-slate-900"> ₽</span>
              <span className="text-slate-500 font-medium">{plan.period}</span>
            </div>

            <ul className="space-y-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.href} className="mt-8">
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

      <section className="mt-20 text-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Частые вопросы о тарифах</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-slate-900 hover:bg-slate-50 transition-colors">
              Можно ли попробовать Pro бесплатно?
              <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4">▼</span>
            </summary>
            <div className="px-5 pb-5 text-slate-500 font-medium leading-relaxed">
              Да, первые 5 документов в месяц бесплатны для всех. Это позволяет полностью протестировать сервис.
              Pro нужен только если вам требуется больше документов или сохранение реквизитов.
            </div>
          </details>
          <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-slate-900 hover:bg-slate-50 transition-colors">
              Как оплатить?
              <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4">▼</span>
            </summary>
            <div className="px-5 pb-5 text-slate-500 font-medium leading-relaxed">
              Картой Visa, Mastercard, МИР. Подписка продлевается автоматически. Отменить можно в любой момент.
            </div>
          </details>
          <details className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-slate-900 hover:bg-slate-50 transition-colors">
              Можно ли получить закрывающие документы?
              <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4">▼</span>
            </summary>
            <div className="px-5 pb-5 text-slate-500 font-medium leading-relaxed">
              Да, мы предоставляем акт и счёт для юридических лиц на тарифах Pro и Business.
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
