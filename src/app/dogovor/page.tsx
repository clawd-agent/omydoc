import type { Metadata } from 'next'
import { ContractForm } from '@/components/forms/contract-form'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { FAQSchema, HowToSchema } from '@/components/seo/json-ld'
import { FileText, Scale, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Создать договор оказания услуг онлайн бесплатно — Генератор договоров',
  description: 'Бесплатный онлайн-генератор договоров оказания услуг. Заполните данные — скачайте готовый договор в PDF и DOCX. Авто-заполнение реквизитов по ИНН.',
  keywords: 'договор оказания услуг, договор услуг шаблон, создать договор онлайн, генератор договоров, договор между ИП и ООО',
  openGraph: {
    title: 'Создать договор оказания услуг онлайн бесплатно',
    description: 'Заполните данные — скачайте готовый договор в PDF. Настраиваемые условия, авто-реквизиты по ИНН.',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Какие существенные условия должен содержать договор оказания услуг?',
    answer: 'Существенные условия по ГК РФ: предмет договора (какие именно услуги оказываются), сроки оказания услуг, стоимость. Без этих условий договор может быть признан незаключённым.',
  },
  {
    question: 'Чем договор оказания услуг отличается от договора подряда?',
    answer: 'Договор подряда предполагает конкретный результат работ (построенный дом, написанная программа). Договор оказания услуг — это процесс (консультирование, обучение, бухгалтерское обслуживание). На практике граница часто размыта.',
  },
  {
    question: 'Может ли самозанятый заключать договор оказания услуг?',
    answer: 'Да, самозанятый заключает договор как физическое лицо — плательщик налога на профессиональный доход. В договоре указывается, что исполнитель применяет НПД. Это важно для заказчика-юрлица, чтобы не начислять НДФЛ и страховые взносы.',
  },
  {
    question: 'Нужно ли заверять договор у нотариуса?',
    answer: 'Нет, договор оказания услуг не требует нотариального заверения. Достаточно подписей сторон. Договор может быть заключён даже в электронной форме с использованием ЭЦП.',
  },
  {
    question: 'Как расторгнуть договор оказания услуг?',
    answer: 'По ГК РФ (ст. 782) заказчик вправе отказаться от договора в одностороннем порядке при условии оплаты фактически понесённых исполнителем расходов. Исполнитель тоже может отказаться, возместив заказчику убытки.',
  },
]

const howToSteps = [
  { name: 'Укажите стороны', text: 'Введите ИНН исполнителя и заказчика. Реквизиты загрузятся автоматически.' },
  { name: 'Заполните условия', text: 'Предмет договора, сроки, стоимость, порядок оплаты, неустойка.' },
  { name: 'Скачайте договор', text: 'Получите готовый договор в PDF с полными реквизитами и подписями.' },
]

export default function ContractPage() {
  return (
    <>
      <FAQSchema items={faqItems} />
      <HowToSchema name="Как создать договор оказания услуг онлайн" steps={howToSteps} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ name: 'Договор оказания услуг', href: '/dogovor' }]} />

        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Создать договор оказания услуг онлайн
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Заполните данные — получите юридически грамотный договор в PDF.
            Настраиваемые условия, авто-заполнение реквизитов по ИНН. Бесплатно.
          </p>
        </header>

        {/* Как это работает */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">1. Укажите стороны</h3>
            <p className="text-sm text-gray-500">ИНН → все реквизиты из ЕГРЮЛ</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">2. Настройте условия</h3>
            <p className="text-sm text-gray-500">Предмет, сроки, оплата, ответственность</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">3. Скачайте PDF</h3>
            <p className="text-sm text-gray-500">Готовый договор с реквизитами</p>
          </div>
        </section>

        <section id="generator">
          <ContractForm />
        </section>

        {/* Связанные документы */}
        <section className="mt-12 bg-gray-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">К договору вам понадобятся:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/schet" className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium">Счёт на оплату</div>
                <div className="text-sm text-gray-500">Выставить счёт по договору</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
            <Link href="/akt" className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <div className="font-medium">Акт выполненных работ</div>
                <div className="text-sm text-gray-500">Закрыть работы по договору</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </section>

        {/* SEO-контент */}
        <section className="mt-12 prose prose-gray max-w-none">
          <h2>Договор оказания услуг: правовые основы</h2>
          <p>
            Договор возмездного оказания услуг регулируется главой 39 ГК РФ (статьи 779-783).
            По договору исполнитель обязуется по заданию заказчика оказать услуги (совершить определённые
            действия или осуществить определённую деятельность), а заказчик обязуется оплатить эти услуги.
          </p>

          <h2>Структура договора</h2>
          <p>Типовой договор оказания услуг включает следующие разделы:</p>
          <ul>
            <li><strong>Предмет договора</strong> — конкретное описание услуг, которые оказывает исполнитель</li>
            <li><strong>Стоимость и порядок расчётов</strong> — цена, сроки и способ оплаты (предоплата, постоплата, этапы)</li>
            <li><strong>Сроки оказания услуг</strong> — начало, окончание, промежуточные этапы</li>
            <li><strong>Обязанности сторон</strong> — что должен сделать исполнитель и заказчик</li>
            <li><strong>Порядок приёмки</strong> — как подписывается акт, сроки рассмотрения</li>
            <li><strong>Ответственность</strong> — неустойка за просрочку, порядок разрешения споров</li>
            <li><strong>Реквизиты и подписи</strong> — полные юридические реквизиты обеих сторон</li>
          </ul>

          <h2>Особенности для ИП и самозанятых</h2>
          <p>
            При заключении договора с ИП или самозанятым важно учитывать:
          </p>
          <ul>
            <li>ИП указывает ОГРНИП вместо ОГРН, КПП отсутствует</li>
            <li>Самозанятый действует как физлицо, указывается ИНН и паспортные данные</li>
            <li>В договоре с самозанятым рекомендуется указать, что исполнитель является плательщиком НПД</li>
            <li>Для заказчика-юрлица это важно для правильного налогообложения</li>
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
