'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Building2, Loader2 } from 'lucide-react'
import type { CompanyInfo } from '@/types'

interface CompanyFieldsProps {
  prefix: string // 'supplier' | 'buyer'
  label: string // 'Поставщик' | 'Покупатель'
  value: CompanyInfo
  onChange: (data: CompanyInfo) => void
  showBankDetails?: boolean
}

export function CompanyFields({ prefix, label, value, onChange, showBankDetails = false }: CompanyFieldsProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Partial<CompanyInfo>[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const updateField = useCallback((field: keyof CompanyInfo, val: string) => {
    onChange({ ...value, [field]: val })
  }, [value, onChange])

  // Поиск компании по ИНН
  const searchByInn = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/dadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'company', query }),
      })
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
    } catch {
      console.error('Failed to search company')
    } finally {
      setLoading(false)
    }
  }, [])

  // Поиск банка по БИК
  const searchByBik = useCallback(async (bik: string) => {
    if (bik.length !== 9) return

    setLoading(true)
    try {
      const res = await fetch('/api/dadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bank', query: bik }),
      })
      const data = await res.json()
      if (data.suggestions?.[0]) {
        const bank = data.suggestions[0]
        onChange({
          ...value,
          bik,
          bankName: bank.bankName,
          corrAccount: bank.corrAccount,
        })
      }
    } catch {
      console.error('Failed to search bank')
    } finally {
      setLoading(false)
    }
  }, [value, onChange])

  const selectSuggestion = useCallback((suggestion: Partial<CompanyInfo>) => {
    onChange({
      ...value,
      ...suggestion,
    })
    setShowSuggestions(false)
    setSuggestions([])
  }, [value, onChange])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        {label}
      </h3>

      {/* ИНН с автозаполнением */}
      <div className="relative">
        <Label htmlFor={`${prefix}-inn`}>ИНН *</Label>
        <div className="flex gap-2">
          <Input
            id={`${prefix}-inn`}
            placeholder="Введите ИНН"
            value={value.inn}
            onChange={(e) => {
              updateField('inn', e.target.value)
              searchByInn(e.target.value)
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => searchByInn(value.inn)}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Выпадающий список подсказок */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
                onClick={() => selectSuggestion(s)}
              >
                <div className="font-medium">{s.shortName || s.name}</div>
                <div className="text-gray-500 text-xs">ИНН: {s.inn} {s.address ? `• ${s.address}` : ''}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Наименование */}
      <div>
        <Label htmlFor={`${prefix}-name`}>Наименование *</Label>
        <Input
          id={`${prefix}-name`}
          placeholder="ООО «Компания» / ИП Иванов И.И."
          value={value.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>

      {/* КПП + ОГРН */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-kpp`}>КПП</Label>
          <Input
            id={`${prefix}-kpp`}
            placeholder="КПП"
            value={value.kpp || ''}
            onChange={(e) => updateField('kpp', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-ogrn`}>ОГРН</Label>
          <Input
            id={`${prefix}-ogrn`}
            placeholder="ОГРН / ОГРНИП"
            value={value.ogrn || ''}
            onChange={(e) => updateField('ogrn', e.target.value)}
          />
        </div>
      </div>

      {/* Адрес */}
      <div>
        <Label htmlFor={`${prefix}-address`}>Юридический адрес</Label>
        <Input
          id={`${prefix}-address`}
          placeholder="Адрес"
          value={value.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>

      {/* Руководитель */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-directorName`}>ФИО руководителя</Label>
          <Input
            id={`${prefix}-directorName`}
            placeholder="Иванов Иван Иванович"
            value={value.directorName || ''}
            onChange={(e) => updateField('directorName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-directorTitle`}>Должность</Label>
          <Input
            id={`${prefix}-directorTitle`}
            placeholder="Генеральный директор"
            value={value.directorTitle || ''}
            onChange={(e) => updateField('directorTitle', e.target.value)}
          />
        </div>
      </div>

      {/* Банковские реквизиты */}
      {showBankDetails && (
        <>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-sm text-gray-600 mb-3">Банковские реквизиты</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${prefix}-bik`}>БИК</Label>
              <Input
                id={`${prefix}-bik`}
                placeholder="БИК банка"
                value={value.bik || ''}
                onChange={(e) => {
                  updateField('bik', e.target.value)
                  if (e.target.value.length === 9) {
                    searchByBik(e.target.value)
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor={`${prefix}-bankName`}>Банк</Label>
              <Input
                id={`${prefix}-bankName`}
                placeholder="Название банка"
                value={value.bankName || ''}
                onChange={(e) => updateField('bankName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${prefix}-account`}>Расчётный счёт</Label>
              <Input
                id={`${prefix}-account`}
                placeholder="Расчётный счёт"
                value={value.accountNumber || ''}
                onChange={(e) => updateField('accountNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`${prefix}-corrAccount`}>Кор. счёт</Label>
              <Input
                id={`${prefix}-corrAccount`}
                placeholder="Корреспондентский счёт"
                value={value.corrAccount || ''}
                onChange={(e) => updateField('corrAccount', e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
