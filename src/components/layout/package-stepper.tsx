'use client'

import { calcPackageProgress } from '@/lib/documents/package-progress'

interface PackageStepperProps {
  current: 'contract' | 'invoice' | 'act'
}

const steps = [
  { id: 'contract', label: '1. Договор', href: '/dogovor?package=1&step=contract', doneKey: 'omydoc:package:done:contract' },
  { id: 'invoice', label: '2. Счёт', href: '/schet?package=1&step=invoice', doneKey: 'omydoc:package:done:invoice' },
  { id: 'act', label: '3. Акт', href: '/akt?package=1&step=act', doneKey: 'omydoc:package:done:act' },
] as const

export function PackageStepper({ current }: PackageStepperProps) {
  const doneMap: Record<string, boolean> = {}
  if (typeof window !== 'undefined') {
    for (const step of steps) {
      doneMap[step.id] = window.sessionStorage.getItem(step.doneKey) === '1'
    }
  }

  const progress = calcPackageProgress({
    contractDone: Boolean(doneMap.contract),
    invoiceDone: Boolean(doneMap.invoice),
    actDone: Boolean(doneMap.act),
  })

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div className="text-sm font-bold text-blue-900 mb-2">Пакетный режим · {progress.doneCount}/{progress.total}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {steps.map((step) => (
          <a
            key={step.id}
            href={step.href}
            className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${current === step.id ? 'bg-white border-blue-400 text-blue-700' : 'bg-blue-100/40 border-blue-200 text-blue-600 hover:bg-white'}`}
          >
            {step.label} {doneMap[step.id] ? '✓' : ''}
          </a>
        ))}
      </div>
    </div>
  )
}
