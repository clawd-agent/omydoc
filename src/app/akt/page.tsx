import type { Metadata } from 'next'
import { ActGenerator } from './act-generator'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { FAQSchema, HowToSchema } from '@/components/seo/json-ld'
import { FileText, ClipboardCheck, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PricingBanner } from '@/components/layout/pricing-banner'
import { PageTracker } from '@/components/analytics/page-tracker'
import { ExitIntentNudge } from '@/components/analytics/exit-intent-nudge'

export const metadata: Metadata = {
  title: 'Создать акт выполненных работ онлайн бесплатно — Генератор актов',
  description: 'Бесплатный онлайн-генератор актов выполненных работ. Заполните данные — скачайте PDF. Авто-заполнение по ИНН. Без регистрации.',
  keywords: 'акт выполненных работ, акт оказания услуг, акт онлайн, генератор актов, акт выполненных работ образец 2026',
  openGraph: {
    title: 'Создать акт выполненных работ онлайн бесплатно',
    description: 'Заполните данные — скачайте готовый акт в PDF за 2 минуты. Бесплатно, без регистрации.',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Что такое акт выполненных работ?',
    answer: 'Акт выполненных работ (оказанных услуг) — это документ, подтверждающий, что исполнитель выполнил работы/оказал услуги, а заказчик их принял. Акт является первичным учётным документом и основанием для оплаты.',
  },
  {
    question: 'Обязательно ли составлять акт?',
    answer: 'Для бухгалтерского учёта — да. Акт является первичным документом, подтверждающим расходы заказчика. Без акта нельзя корректно учесть затраты и принять НДС к вычету.',
  },
  {
    question: 'Какие реквизиты обязательны в акте?',
    answer: 'Обязательные реквизиты: наименование документа, дата составления, наименования и реквизиты сторон, содержание операции (перечень работ/услуг), единицы измерения, стоимость, подписи ответственных лиц.',
  },
  {
    question: 'Нужна ли печать на акте?',
    answer: 'С 2015 года ООО и АО не обязаны иметь печать. Акт действителен с подписями уполномоченных лиц. Однако если в договоре указано, что документы заверяются печатью, её лучше поставить.',
  },
  {
    question: 'Может ли самозанятый подписывать акты?',
    answer: 'Да. Самозанятый выступает как исполнитель и подписывает акт от своего имени. Заказчику-юрлицу акт нужен для подтверждения расходов. Самозанятому — для фиксации оказанных услуг.',
  },
]

const howToSteps = [
  { name: 'Укажите стороны', text: 'Введите ИНН исполнителя и заказчика. Реквизиты подтянутся автоматически.' },
  { name: 'Заполните перечень работ', text: 'Опишите выполненные работы или оказанные услуги, укажите стоимость.' },
  { name: 'Скачайте акт', text: 'Получите готовый акт выполненных работ в формате PDF.' },
]

export default function ActPage() {
  return (
    <>
      <PageTracker page="akt" docType="act" />
      <ExitIntentNudge docType="act" />
      <FAQSchema items={faqItems} />
      <HowToSchema name="Как создать акт выполненных работ онлайн" steps={howToSteps} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ name: 'Акт выполненных работ', href: '/akt' }]} />

        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Создать акт выполненных работ
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Заполните данные — скачайте готовый акт в PDF. Автозаполнение реквизитов по ИНН,
            расчёт итогов, сумма прописью.
          </p>
        </header>

        {/* Как это работает */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">1. Укажите стороны</h3>
            <p className="text-sm text-slate-500 font-medium">ИНН → реквизиты из ЕГРЮЛ автоматически</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">2. Опишите работы</h3>
            <p className="text-sm text-slate-500 font-medium">Перечень услуг, объём, стоимость</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">3. Скачайте PDF</h3>
            <p className="text-sm text-slate-500 font-medium">Готовый акт с подписями сторон</p>
          </div>
        </section>

        {/* Форма */}
        <section id="generator">
          <ActGenerator />
        </section>

        {/* Связанные документы */}
        <section className="mt-14 bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Связанные документы:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/schet" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Счёт на оплату</div>
                <div className="text-sm text-slate-500 font-medium">Выставить счёт покупателю</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
            <Link href="/dogovor" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Договор оказания услуг</div>
                <div className="text-sm text-slate-500 font-medium">Основание для акта</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </Link>
          </div>
        </section>

        <PricingBanner />

        {/* SEO-контент */}
        <section className="mt-14 prose max-w-none">
          <h2>Акт выполненных работ: что это и зачем нужен</h2>
          <p>
            Акт выполненных работ (акт оказанных услуг) — двусторонний документ, который фиксирует факт
            исполнения обязательств по договору. Исполнитель подтверждает, что работы выполнены,
            а заказчик — что принял их без претензий.
          </p>
          <p>
            Акт выполняет несколько важных функций:
          </p>
          <ul>
            <li><strong>Бухгалтерский учёт</strong> — первичный документ для учёта расходов (п. 1 ст. 9 ФЗ «О бухгалтерском учёте»)</li>
            <li><strong>Налоговый учёт</strong> — подтверждение расходов для уменьшения налоговой базы</li>
            <li><strong>НДС</strong> — основание для принятия входящего НДС к вычету</li>
            <li><strong>Защита интересов</strong> — фиксирует объём и качество выполненных работ</li>
          </ul>

          <h2>Когда составляется акт</h2>
          <p>
            Акт составляется после выполнения всех работ (оказания услуг) или по итогам отчётного периода.
            Типичные ситуации:
          </p>
          <ul>
            <li>Завершение проекта — разработка сайта, дизайн, ремонт</li>
            <li>Ежемесячные услуги — бухгалтерское обслуживание, абонентская плата</li>
            <li>Разовые услуги — консультация, перевозка, монтаж</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Частые вопросы</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-slate-900 hover:bg-slate-50 transition-colors">
                  {item.question}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform ml-4">▼</span>
                </summary>
                <div className="px-5 pb-5 text-slate-500 font-medium leading-relaxed">{item.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
