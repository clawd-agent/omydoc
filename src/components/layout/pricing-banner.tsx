import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function PricingBanner() {
  return (
    <section className="mt-12 border rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Нужно больше документов?</h3>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-medium">Бесплатно</span> — до 5 документов/мес •
            <span className="font-medium"> Pro 650 ₽/мес</span> — безлимит •
            <span className="font-medium"> Business 1 500 ₽/мес</span> — для команд
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Все тарифы <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
