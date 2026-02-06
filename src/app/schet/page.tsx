import type { Metadata } from 'next'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { FAQSchema, HowToSchema } from '@/components/seo/json-ld'
import { FileText, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { PricingBanner } from '@/components/layout/pricing-banner'

export const metadata: Metadata = {
  title: 'Создать счёт на оплату онлайн бесплатно — Генератор счетов',
  description: 'Бесплатный онлайн-генератор счетов на оплату. Заполните реквизиты — скачайте PDF за 2 минуты. Авто-заполнение по ИНН. Без регистрации.',
  keywords: 'счёт на оплату, выставить счёт, генератор счетов, счёт онлайн, счёт на оплату образец, создать счёт бесплатно',
  openGraph: {
    title: 'Создать счёт на оплату онлайн бесплатно',
    description: 'Заполните реквизиты — скачайте готовый счёт в PDF за 2 минуты. Бесплатно, без регистрации.',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Нужна ли печать на счёте на оплату?',
    answer: 'Нет, печать на счёте не является обязательным реквизитом. Счёт на оплату — это не первичный бухгалтерский документ, а приглашение к оплате. Он действителен и без печати, достаточно подписи руководителя.',
  },
  {
    question: 'Можно ли выставить счёт без НДС?',
    answer: 'Да. Если вы применяете УСН, АУСН или являетесь самозанятым, вы не являетесь плательщиком НДС. В счёте указывается «Без НДС». С 2025 года ИП на УСН с доходом свыше 60 млн ₽ обязаны платить НДС по ставке 5% или 7%.',
  },
  {
    question: 'Какие реквизиты обязательны в счёте?',
    answer: 'Обязательные реквизиты: номер и дата счёта, наименование и ИНН поставщика, наименование и ИНН покупателя, банковские реквизиты поставщика, перечень товаров/услуг с ценами, итоговая сумма.',
  },
  {
    question: 'Сколько действует счёт на оплату?',
    answer: 'Законодательно срок действия счёта не установлен. Обычно указывают 3-5 рабочих дней. Если срок не указан, счёт считается бессрочным, но поставщик может отозвать его в любой момент.',
  },
  {
    question: 'Можно ли выставить счёт от ИП?',
    answer: 'Да, ИП имеет полное право выставлять счета. В качестве поставщика указывается «ИП Фамилия И.О.», ИНН (12 цифр), ОГРНИП, банковские реквизиты. КПП у ИП нет.',
  },
  {
    question: 'Как выставить счёт самозанятому?',
    answer: 'Самозанятые могут выставлять счета как физлица. Укажите ФИО, ИНН (12 цифр), банковские реквизиты карты/счёта. Печать и ОГРН не нужны. После оплаты сформируйте чек в приложении «Мой налог».',
  },
]

const howToSteps = [
  { name: 'Введите реквизиты', text: 'Укажите ИНН поставщика и покупателя. Данные компании заполнятся автоматически из ЕГРЮЛ.' },
  { name: 'Добавьте товары/услуги', text: 'Заполните таблицу: наименование, количество, цена. НДС рассчитается автоматически.' },
  { name: 'Скачайте PDF', text: 'Нажмите кнопку — получите готовый счёт на оплату в формате PDF.' },
]

export default function InvoicePage() {
  return (
    <>
      <FAQSchema items={faqItems} />
      <HowToSchema name="Как создать счёт на оплату онлайн" steps={howToSteps} />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ name: 'Счёт на оплату', href: '/schet' }]} />

        {/* H1 + подзаголовок */}
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Создать счёт на оплату
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Заполните реквизиты — скачайте готовый PDF за 2 минуты.
            Авто-заполнение по ИНН, расчёт НДС, сумма прописью.
          </p>
        </header>

        {/* Как это работает */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">1. Введите реквизиты</h3>
            <p className="text-sm text-slate-500 font-medium">ИНН → данные заполнятся автоматически из ЕГРЮЛ</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">2. Добавьте позиции</h3>
            <p className="text-sm text-slate-500 font-medium">Товары/услуги, цены, НДС — всё рассчитается</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">3. Скачайте PDF</h3>
            <p className="text-sm text-slate-500 font-medium">Готовый счёт с подписями, печатью, QR-кодом</p>
          </div>
        </section>

        {/* Форма генерации */}
        <section id="generator">
          <InvoiceForm />
        </section>

        {/* Связанные документы */}
        <section className="mt-14 bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Создали счёт? Вам могут понадобиться:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/akt" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Акт выполненных работ</div>
                <div className="text-sm text-slate-500 font-medium">Закрывающий документ к счёту</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </Link>
            <Link href="/dogovor" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Договор оказания услуг</div>
                <div className="text-sm text-slate-500 font-medium">Оформите отношения с контрагентом</div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </Link>
          </div>
        </section>

        {/* Тарифы */}
        <PricingBanner />

        {/* SEO-текст */}
        <section className="mt-14 prose max-w-none">
          <h2>Что такое счёт на оплату и когда он нужен</h2>
          <p>
            Счёт на оплату — это документ, который продавец (поставщик) направляет покупателю с просьбой оплатить товары или услуги.
            Хотя счёт не является обязательным документом бухгалтерского учёта, он широко используется в деловой практике
            как основание для перечисления денежных средств.
          </p>
          <p>
            Счёт на оплату необходим в следующих случаях:
          </p>
          <ul>
            <li>Выставление счёта юридическому лицу — для корректного перечисления средств через банк</li>
            <li>Оплата услуг фрилансера — самозанятые и ИП выставляют счета корпоративным клиентам</li>
            <li>Предоплата по договору — счёт фиксирует сумму и реквизиты для перечисления</li>
            <li>Бухгалтерский документооборот — счёт помогает бухгалтерии отслеживать платежи</li>
          </ul>

          <h2>Какие реквизиты должен содержать счёт</h2>
          <p>
            Стандартный счёт на оплату включает:
          </p>
          <ul>
            <li><strong>Номер и дата</strong> — уникальный номер для учёта и дата выставления</li>
            <li><strong>Реквизиты поставщика</strong> — наименование, ИНН, КПП, адрес, банковские реквизиты (расчётный счёт, БИК, кор. счёт)</li>
            <li><strong>Реквизиты покупателя</strong> — наименование, ИНН, КПП, адрес</li>
            <li><strong>Таблица товаров/услуг</strong> — наименование, единица измерения, количество, цена, сумма</li>
            <li><strong>НДС</strong> — ставка и сумма налога или указание «Без НДС»</li>
            <li><strong>Итого</strong> — общая сумма к оплате, сумма прописью</li>
            <li><strong>Подпись руководителя</strong> — придаёт документу юридическую силу</li>
          </ul>

          <h2>НДС в счёте: ставки 2025-2026</h2>
          <p>
            С 2025 года действуют следующие ставки НДС для ИП и организаций:
          </p>
          <ul>
            <li><strong>Без НДС</strong> — УСН (доход до 60 млн ₽), самозанятые, АУСН</li>
            <li><strong>5%</strong> — ИП на УСН с доходом 60-250 млн ₽ (новая ставка с 2025)</li>
            <li><strong>7%</strong> — ИП на УСН с доходом 250-450 млн ₽ (новая ставка с 2025)</li>
            <li><strong>10%</strong> — продовольственные товары, детские товары, книги, медицина</li>
            <li><strong>20%</strong> — стандартная ставка (2025)</li>
            <li><strong>22%</strong> — стандартная ставка с 1 января 2026 года</li>
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
                <div className="px-5 pb-5 text-slate-500 font-medium leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
