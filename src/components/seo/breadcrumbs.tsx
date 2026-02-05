import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbSchema } from './json-ld'

interface BreadcrumbItem {
  name: string
  href: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const schemaItems = [
    { name: 'Главная', url: `${siteUrl}/` },
    ...items.map(item => ({ name: item.name, url: `${siteUrl}${item.href}` })),
  ]

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Главная
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {i === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-gray-700">{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
