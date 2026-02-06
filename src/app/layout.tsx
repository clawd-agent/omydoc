import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WebApplicationSchema, OrganizationSchema } from "@/components/seo/json-ld"
import { YandexMetrika } from "@/components/seo/yandex-metrika"

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: {
    default: "OmyDoc — Генератор документов для бизнеса",
    template: "%s | OmyDoc",
  },
  description: "Бесплатный онлайн-генератор бизнес-документов: счета на оплату, акты выполненных работ, договоры. Авто-заполнение по ИНН. Скачайте PDF за 2 минуты.",
  keywords: "генератор документов, счёт на оплату онлайн, акт выполненных работ, договор оказания услуг, создать счёт бесплатно",
  authors: [{ name: "OmyDoc" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://omydoc.ru"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "OmyDoc",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  verification: {
    yandex: "f88499d8beaf7ecd",
    google: "J8neJsfPcowZw886NdR_eV6GRNRAmb2hiAKG_gu85KQ",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50`}>
        <YandexMetrika />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
