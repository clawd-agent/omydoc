import type { Metadata } from 'next'
import { ActForm } from '@/components/forms/act-form'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { FAQSchema, HowToSchema } from '@/components/seo/json-ld'
import { FileText, ClipboardCheck, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
      <FAQSchema items={faqItems} />
      <HowToSchema name="Как создать акт выполненных работ онлайн" steps={howToSteps} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ name: 'Акт выполненных работ', href: '/akt' }]} />

        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Создать акт выполненных работ онлайн
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Заполните данные — скачайте готовый акт в PDF. Автозаполнение реквизитов по ИНН,
            расчёт итогов, сумма прописью. Бесплатно.
          </p>
        </header>

        {/* Как это работает */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">1. Укажите стороны</h3>
            <p className="text-sm text-gray-500">ИНН → реквизиты из ЕГРЮЛ автоматически</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">2. Опишите работы</h3>
            <p className="text-sm text-gray-500">Перечень услуг, объём, стоимость</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">3. Скачайте PDF</h3>
            <p className="text-sm text-gray-500">Готовый акт с подписями сторон</p>
          </div>
        </section>

        {/* Форма */}
        <section id="generator">
          <ActForm />
        </section>

        {/* Связанные документы */}
        <section className="mt-12 bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Связанные документы:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/schet" className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium">Счёт на оплату</div>
                <div className="text-sm text-gray-500">Выставить счёт покупателю</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
            <Link href="/dogovor" className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">Договор оказания услуг</div>
                <div className="text-sm text-gray-500">Основание для акта</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </section>

        {/* SEO-контент */}
        <section className="mt-12 prose prose-gray max-w-none">
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
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Частые вопросы</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="group border rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-gray-50">
                  {item.question}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600">{item.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
