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

  const nextStep = steps.find((step) => !doneMap[step.id])

  const percent = Math.round((progress.doneCount / progress.total) * 100)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="text-sm font-bold text-blue-900">Пакетный режим · {progress.doneCount}/{progress.total}</div>
      <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <a
            key={step.id}
            href={step.href}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${current === step.id ? 'bg-white border-blue-400 text-blue-700' : 'bg-blue-100/40 border-blue-200 text-blue-600 hover:bg-white'}`}
          >
            {step.label} {doneMap[step.id] ? '✓' : ''}
          </a>
        ))}
      </div>

      {progress.isComplete ? (
        <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          Комплект готов: договор, счёт и акт сформированы.
        </div>
      ) : nextStep ? (
        <a
          href={nextStep.href}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Продолжить: {nextStep.label}
        </a>
      ) : null}
    </div>
  )
}
