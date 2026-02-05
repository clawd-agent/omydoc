import Link from 'next/link'
import { FileText, Zap, Shield, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Бизнес-документы за 2 минуты
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Счета, акты, договоры — бесплатно и без регистрации.
            Введите ИНН — реквизиты заполнятся автоматически. Скачайте PDF.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schet">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Создать счёт
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/akt">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                Создать акт
              </Button>
            </Link>
            <Link href="/dogovor">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                Создать договор
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Типы документов */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Какой документ вам нужен?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/schet" className="group">
              <div className="border rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">Счёт на оплату</h3>
                <p className="text-gray-500 mb-4">
                  Выставите счёт покупателю. Банковские реквизиты, таблица товаров/услуг,
                  НДС, сумма прописью, QR-код.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Авто-заполнение по ИНН</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />НДС 0/5/7/10/20%</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Скачивание в PDF</li>
                </ul>
              </div>
            </Link>

            <Link href="/akt" className="group">
              <div className="border rounded-xl p-6 hover:border-green-300 hover:shadow-lg transition-all h-full">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600">Акт выполненных работ</h3>
                <p className="text-gray-500 mb-4">
                  Закройте сделку актом. Перечень работ/услуг, основание (договор),
                  подписи сторон.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Создание из счёта</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Привязка к договору</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Сумма прописью</li>
                </ul>
              </div>
            </Link>

            <Link href="/dogovor" className="group">
              <div className="border rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all h-full">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600">Договор оказания услуг</h3>
                <p className="text-gray-500 mb-4">
                  Оформите отношения с контрагентом. Настраиваемые условия, сроки,
                  порядок оплаты, ответственность.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Юридически грамотный</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Настраиваемые условия</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />PDF</li>
                </ul>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему ДокГен?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Быстро</h3>
              <p className="text-sm text-gray-500">Готовый документ за 2 минуты. Авто-заполнение по ИНН экономит время.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Бесплатно</h3>
              <p className="text-sm text-gray-500">Создавайте до 5 документов в месяц бесплатно. Без скрытых платежей.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Без регистрации</h3>
              <p className="text-sm text-gray-500">Первый документ — без регистрации. Просто заполните и скачайте.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">Корректные</h3>
              <p className="text-sm text-gray-500">Документы соответствуют законодательству РФ. НДС 2025, реквизиты из ЕГРЮЛ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Для кого */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Кому подходит</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">🧑‍💻 Самозанятые и фрилансеры</h3>
              <p className="text-gray-600">
                Заказчик просит «прислать счёт и акт для бухгалтерии»? Создайте за минуту —
                без знания бухгалтерии и шаблонов в Word.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">📋 ИП и малый бизнес</h3>
              <p className="text-gray-600">
                Пакет документов для нового клиента: договор + счёт + акт.
                Реквизиты подтянутся по ИНН, не нужно копировать вручную.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">📱 Те, кто «прямо сейчас»</h3>
              <p className="text-gray-600">
                Клиент просит счёт, а вы не за компьютером? Откройте на телефоне,
                заполните за 2 минуты, отправьте PDF.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">📊 Бухгалтеры на аутсорсе</h3>
              <p className="text-gray-600">
                Быстро создавайте документы для разных юрлиц. Сохраняйте реквизиты,
                переключайтесь между клиентами.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы создать первый документ?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Бесплатно, без регистрации, за 2 минуты
          </p>
          <Link href="/schet">
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6">
              Начать — создать счёт
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
