import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl font-bold text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Страница не найдена</h1>
      <p className="text-gray-600 mb-8">
        Такой страницы нет. Возможно, она была перемещена или удалена.
      </p>

      <div className="space-y-3">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            На главную
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <div className="text-sm text-gray-500 mt-6">Или создайте документ:</div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Link href="/schet" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
            <FileText className="h-4 w-4" /> Счёт
          </Link>
          <Link href="/akt" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
            <FileText className="h-4 w-4" /> Акт
          </Link>
          <Link href="/dogovor" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
            <FileText className="h-4 w-4" /> Договор
          </Link>
        </div>
      </div>
    </div>
  )
}
