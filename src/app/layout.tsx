import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WebApplicationSchema, OrganizationSchema } from "@/components/seo/json-ld"

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "ДокГен — Генератор документов для бизнеса",
    template: "%s | ДокГен",
  },
  description: "Бесплатный онлайн-генератор бизнес-документов: счета на оплату, акты выполненных работ, договоры. Авто-заполнение по ИНН. Скачайте PDF за 2 минуты.",
  keywords: "генератор документов, счёт на оплату онлайн, акт выполненных работ, договор оказания услуг, создать счёт бесплатно",
  authors: [{ name: "ДокГен" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://docgen.ru"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ДокГен",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // yandex: "ваш-код-верификации", // Добавить после подключения Вебмастера
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <WebApplicationSchema />
        <OrganizationSchema />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
