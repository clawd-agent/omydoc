import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Бренд */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              ДокГен
            </Link>
            <p className="text-sm text-gray-500">
              Бесплатный онлайн-генератор бизнес-документов для малого бизнеса
            </p>
          </div>

          {/* Документы */}
          <div>
            <h4 className="font-semibold mb-3">Документы</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schet" className="text-gray-600 hover:text-gray-900">Счёт на оплату</Link></li>
              <li><Link href="/akt" className="text-gray-600 hover:text-gray-900">Акт выполненных работ</Link></li>
              <li><Link href="/dogovor" className="text-gray-600 hover:text-gray-900">Договор оказания услуг</Link></li>
            </ul>
          </div>

          {/* Полезное */}
          <div>
            <h4 className="font-semibold mb-3">Полезное</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900">Тарифы</Link></li>
              <li><Link href="/schet" className="text-gray-600 hover:text-gray-900">Как выставить счёт</Link></li>
              <li><Link href="/akt" className="text-gray-600 hover:text-gray-900">Образец акта 2026</Link></li>
              <li><Link href="/dogovor" className="text-gray-600 hover:text-gray-900">Шаблон договора</Link></li>
            </ul>
          </div>

          {/* О сервисе */}
          <div>
            <h4 className="font-semibold mb-3">О сервисе</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contacts" className="text-gray-600 hover:text-gray-900">Контакты</Link></li>
              <li><Link href="/oferta" className="text-gray-600 hover:text-gray-900">Оферта</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Конфиденциальность</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-400">
          © {currentYear} ДокГен. Бесплатный генератор документов для бизнеса.
        </div>
      </div>
    </footer>
  )
}
