import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function PricingBanner() {
  return (
    <section className="mt-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-8 text-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-1">Нужно больше документов?</h3>
            <p className="text-blue-100 font-medium text-sm">
              <span className="text-white">Бесплатно</span> — до 5 документов/мес •
              <span className="text-white"> Pro 650 ₽/мес</span> — безлимит •
              <span className="text-white"> Business 1 500 ₽/мес</span> — для команд
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Все тарифы <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
