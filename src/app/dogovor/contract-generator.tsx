'use client'

import { useState } from 'react'
import { AIFillInput } from '@/components/ai/ai-fill-input'
import { ContractForm } from '@/components/forms/contract-form'
import { CheckCircle2 } from 'lucide-react'
import { CONTRACT_TEMPLATES, getContractTemplate } from '@/lib/ai/contract-templates'
import { CONTRACT_PRESETS, getContractPreset } from '@/lib/ai/contract-presets'
import { PackageStepper } from '@/components/layout/package-stepper'

interface ParsedData {
  supplier?: Record<string, string>
  buyer?: Record<string, string>
  items?: Array<Record<string, string | number>>
  subject?: string
  startDate?: string
  endDate?: string
  paymentTerms?: string
  paymentDays?: number
  penaltyRate?: number
  jurisdiction?: string
}

export function ContractGenerator() {
  const [initialState] = useState<{ draft: ParsedData | null; fromBundle: boolean }>(() => {
    if (typeof window === 'undefined') return { draft: null, fromBundle: false }
    const raw = window.sessionStorage.getItem('omydoc:bundle_contract_draft')
    if (!raw) return { draft: null, fromBundle: false }

    try {
      const parsed = JSON.parse(raw) as ParsedData
      return { draft: parsed, fromBundle: true }
    } catch {
      window.sessionStorage.removeItem('omydoc:bundle_contract_draft')
      return { draft: null, fromBundle: false }
    }
  })

  const [parsedData, setParsedData] = useState<ParsedData | null>(initialState.draft)
  const [selectedTemplate, setSelectedTemplate] = useState<'simple' | 'expert'>('simple')
  const [selectedPreset, setSelectedPreset] = useState<'nda' | 'one_time_service' | 'monthly_retainer' | 'dev_contract' | 'marketing_contract'>('one_time_service')

  const applyTemplate = (id: 'simple' | 'expert') => {
    setSelectedTemplate(id)
    const template = getContractTemplate(id)
    setParsedData((prev) => ({
      ...prev,
      ...template.draft,
    }))
  }

  const applyPreset = (id: 'nda' | 'one_time_service' | 'monthly_retainer' | 'dev_contract' | 'marketing_contract') => {
    setSelectedPreset(id)
    const preset = getContractPreset(id)
    setParsedData((prev) => ({
      ...prev,
      ...preset.defaults,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="text-sm font-bold text-slate-900 mb-3">Выберите пресет сценария</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {CONTRACT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`text-left p-3 rounded-xl border transition ${selectedPreset === preset.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
            >
              <div className="text-sm font-semibold text-slate-900">{preset.name}</div>
              <div className="text-xs text-slate-500 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>

        <div className="text-sm font-bold text-slate-900 mb-3">Выберите шаблон договора</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTRACT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className={`text-left p-3 rounded-xl border transition ${selectedTemplate === template.id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 bg-white'}`}
            >
              <div className="text-sm font-semibold text-slate-900">{template.name}</div>
              <div className="text-xs text-slate-500 mt-1">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      <AIFillInput
        documentType="contract"
        placeholder="Например: Договор между ООО Альфа и ИП Петров на разработку сайта за 180000 руб, срок до 30.04.2026, оплата 5 дней, неустойка 0.1%, суд Москвы"
        examples={CONTRACT_PRESETS.map((p) => p.aiBrief)}
        onFill={(data) => setParsedData((prev) => ({ ...prev, ...data }))}
      />

      {initialState.fromBundle && <PackageStepper current="contract" />}

      {initialState.fromBundle && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-xl font-medium space-y-3">
          <div>Пакетный режим: данные подтянуты. Шаг 1/3 — договор.</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/schet?package=1&step=invoice' }} className="px-3 py-2 rounded-lg border border-blue-300 bg-white text-sm font-semibold">
              Далее: счёт
            </button>
            <button type="button" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/akt?package=1&step=act' }} className="px-3 py-2 rounded-lg border border-blue-300 bg-white text-sm font-semibold">
              Перейти к акту
            </button>
          </div>
        </div>
      )}

      {parsedData && !initialState.fromBundle && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl font-medium flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-bold">AI заполнил черновик договора</div>
            <div className="text-sm">Проверьте условия и скачайте PDF</div>
          </div>
        </div>
      )}

      <ContractForm initialData={parsedData || undefined} />
    </div>
  )
}
