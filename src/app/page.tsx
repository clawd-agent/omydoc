import Link from 'next/link'
import { FileText, Zap, Shield, Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      {/* Hero - Premium SaaS feel */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-400/20 to-violet-400/20 blur-3xl rounded-full" />
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-8">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium text-slate-600">Авто-заполнение по ИНН</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Бизнес-документы
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              за 2 минуты
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Счета, акты, договоры — бесплатно и без регистрации.
            Введите ИНН — реквизиты заполнятся автоматически.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schet">
              <Button size="xl" className="w-full sm:w-auto">
                Создать счёт
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/akt">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Создать акт
              </Button>
            </Link>
            <Link href="/dogovor">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Договор
              </Button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Бесплатно
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Без регистрации
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              PDF
            </span>
          </div>
        </div>
      </section>

      {/* Типы документов - Bento cards */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Какой документ вам нужен?
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Выберите тип документа и создайте его за пару минут
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/schet" className="group">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Счёт на оплату
                </h3>
                <p className="text-slate-500 font-medium mb-5 leading-relaxed">
                  Выставите счёт покупателю. Банковские реквизиты, таблица товаров, НДС, сумма прописью.
                </p>
                <ul className="space-y-2">
                  {['Авто-заполнение по ИНН', 'НДС 0/5/7/10/20%', 'Скачивание в PDF'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>

            <Link href="/akt" className="group">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  Акт выполненных работ
                </h3>
                <p className="text-slate-500 font-medium mb-5 leading-relaxed">
                  Закройте сделку актом. Перечень работ/услуг, основание, подписи сторон.
                </p>
                <ul className="space-y-2">
                  {['Создание из счёта', 'Привязка к договору', 'Сумма прописью'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>

            <Link href="/dogovor" className="group">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-600/5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">
                  Договор оказания услуг
                </h3>
                <p className="text-slate-500 font-medium mb-5 leading-relaxed">
                  Оформите отношения с контрагентом. Настраиваемые условия, сроки, порядок оплаты.
                </p>
                <ul className="space-y-2">
                  {['Юридически грамотный', 'Настраиваемые условия', 'PDF'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center mb-14">
            Почему OMyDoc?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, color: 'blue', title: 'Быстро', desc: 'Готовый документ за 2 минуты. Авто-заполнение по ИНН экономит время.' },
              { icon: Shield, color: 'emerald', title: 'Бесплатно', desc: 'Создавайте до 5 документов в месяц бесплатно. Без скрытых платежей.' },
              { icon: Clock, color: 'violet', title: 'Без регистрации', desc: 'Первый документ — без регистрации. Просто заполните и скачайте.' },
              { icon: FileText, color: 'amber', title: 'Корректные', desc: 'Документы соответствуют законодательству РФ. НДС 2025, реквизиты из ЕГРЮЛ.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center">
                <div className={`w-14 h-14 bg-${color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-7 w-7 text-${color}-600`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Для кого */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center mb-14">
            Кому подходит
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { emoji: '🧑‍💻', title: 'Самозанятые и фрилансеры', desc: 'Заказчик просит «прислать счёт и акт для бухгалтерии»? Создайте за минуту — без знания бухгалтерии.' },
              { emoji: '📋', title: 'ИП и малый бизнес', desc: 'Пакет документов для нового клиента: договор + счёт + акт. Реквизиты подтянутся по ИНН автоматически.' },
              { emoji: '📱', title: 'Те, кто «прямо сейчас»', desc: 'Клиент просит счёт, а вы не за компьютером? Откройте на телефоне, заполните за 2 минуты.' },
              { emoji: '📊', title: 'Бухгалтеры на аутсорсе', desc: 'Быстро создавайте документы для разных юрлиц. Сохраняйте реквизиты, переключайтесь между клиентами.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{emoji} {title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Готовы создать первый документ?
          </h2>
          <p className="text-xl text-blue-100 font-medium mb-10">
            Бесплатно, без регистрации, за 2 минуты
          </p>
          <Link href="/schet">
            <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20">
              Начать — создать счёт
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
