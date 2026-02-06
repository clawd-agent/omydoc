import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>OMyDoc</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/schet" className="text-gray-600 hover:text-gray-900 transition-colors">
            Счёт
          </Link>
          <Link href="/akt" className="text-gray-600 hover:text-gray-900 transition-colors">
            Акт
          </Link>
          <Link href="/dogovor" className="text-gray-600 hover:text-gray-900 transition-colors">
            Договор
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Тарифы
          </Link>
        </nav>

        {/* Мобильное меню — простое */}
        <nav className="sm:hidden flex items-center gap-4 text-sm">
          <Link href="/schet" className="text-gray-600">Счёт</Link>
          <Link href="/akt" className="text-gray-600">Акт</Link>
          <Link href="/dogovor" className="text-gray-600">Договор</Link>
          <Link href="/pricing" className="text-gray-600">Тарифы</Link>
        </nav>
      </div>
    </header>
  )
}
