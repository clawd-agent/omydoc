import Link from 'next/link'
import { FileText } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Бренд */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-black text-lg tracking-tight mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-slate-900">OMyDoc</span>
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Бесплатный онлайн-генератор бизнес-документов для малого бизнеса
            </p>
          </div>

          {/* Документы */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Документы</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/schet" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Счёт на оплату</Link></li>
              <li><Link href="/akt" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Акт выполненных работ</Link></li>
              <li><Link href="/dogovor" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Договор оказания услуг</Link></li>
            </ul>
          </div>

          {/* Полезное */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Полезное</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/pricing" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Тарифы</Link></li>
              <li><Link href="/schet" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Как выставить счёт</Link></li>
              <li><Link href="/akt" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Образец акта 2026</Link></li>
              <li><Link href="/dogovor" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Шаблон договора</Link></li>
            </ul>
          </div>

          {/* О сервисе */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">О сервисе</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contacts" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Контакты</Link></li>
              <li><Link href="/oferta" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Оферта</Link></li>
              <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Конфиденциальность</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-8 text-center text-sm text-slate-400 font-medium">
          © {currentYear} OMyDoc. Бесплатный генератор документов для бизнеса.
        </div>
      </div>
    </footer>
  )
}
