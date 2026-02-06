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
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-8">
        <Link href="/" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" />
          Главная
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {i === items.length - 1 ? (
              <span className="text-slate-900 font-bold">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-slate-900 transition-colors">{item.name}</Link>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
