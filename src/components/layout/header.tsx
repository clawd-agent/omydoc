import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-slate-900">OMyDoc</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link 
            href="/schet" 
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Счёт
          </Link>
          <Link 
            href="/akt" 
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Акт
          </Link>
          <Link 
            href="/dogovor" 
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Договор
          </Link>
          <Link 
            href="/pricing" 
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Тарифы
          </Link>
        </nav>

        {/* Мобильное меню */}
        <nav className="sm:hidden flex items-center gap-1">
          <Link href="/schet" className="px-3 py-1.5 text-sm font-medium text-slate-600">Счёт</Link>
          <Link href="/akt" className="px-3 py-1.5 text-sm font-medium text-slate-600">Акт</Link>
          <Link href="/dogovor" className="px-3 py-1.5 text-sm font-medium text-slate-600">Договор</Link>
        </nav>
      </div>
    </header>
  )
}
