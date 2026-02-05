import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Контакты — ДокГен',
  description: 'Свяжитесь с нами: email, Telegram. Генератор бизнес-документов ДокГен.',
}

export default function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Контакты', href: '/contacts' }]} />

      <h1 className="text-3xl font-bold mb-8">Контакты</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Обратная связь</h2>
          <p className="text-gray-600 mb-6">
            Если у вас есть вопросы, предложения или вы нашли ошибку — напишите нам.
            Мы отвечаем в течение 24 часов.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <a href="mailto:support@docgen.ru" className="text-blue-600 hover:underline font-medium">
                  support@docgen.ru
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Telegram</div>
                <a href="https://t.me/docgen_support" className="text-blue-600 hover:underline font-medium">
                  @docgen_support
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">О сервисе</h2>
          <p className="text-gray-600">
            ДокГен — бесплатный онлайн-генератор бизнес-документов для малого бизнеса.
            Счета, акты, договоры — за 2 минуты, без регистрации.
          </p>
        </div>
      </div>
    </div>
  )
}
