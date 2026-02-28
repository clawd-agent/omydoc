// Яндекс.Метрика — отправка целей
// Документация: https://yandex.ru/support/metrica/objects/reachgoal.html

declare global {
  interface Window {
    ym?: (id: number, action: string, target: string, params?: Record<string, unknown>) => void
  }
}

const METRIKA_ID = 106680198

type DocType = 'invoice' | 'act' | 'contract'

type FunnelField = 'started' | 'completed' | 'abandonSent' | 'companyFilled' | 'startedAt' | 'nudgeShown'

function getFunnelKey(docType: DocType, field: FunnelField) {
  return `omydoc:funnel:${docType}:${field}`
}

function setFunnelValue(docType: DocType, field: FunnelField, value: string) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(getFunnelKey(docType, field), value)
}

function getFunnelValue(docType: DocType, field: FunnelField, fallback = '0') {
  if (typeof window === 'undefined') return fallback
  return window.sessionStorage.getItem(getFunnelKey(docType, field)) || fallback
}

/**
 * Отправить цель в Яндекс.Метрику
 */
export function reachGoal(target: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'reachGoal', target, params)
  }
}

// Готовые функции для типовых событий

/** Просмотр лендинга */
export function trackLandingView(page: 'schet' | 'akt' | 'dogovor') {
  reachGoal('landing_view', { page })
}

/** Начало заполнения формы */
export function trackFormStart(docType: DocType) {
  setFunnelValue(docType, 'started', '1')
  setFunnelValue(docType, 'completed', '0')
  setFunnelValue(docType, 'abandonSent', '0')
  setFunnelValue(docType, 'companyFilled', '0')
  setFunnelValue(docType, 'nudgeShown', '0')
  setFunnelValue(docType, 'startedAt', String(Date.now()))
  reachGoal('form_start', { docType })
}

/** Реквизиты компании заполнены */
export function trackCompanyFilled(docType: DocType) {
  setFunnelValue(docType, 'companyFilled', '1')
  reachGoal('company_filled', { docType })
}

/** PDF успешно сгенерирован */
export function trackPdfGenerated(docType: DocType) {
  setFunnelValue(docType, 'completed', '1')
  reachGoal(`${docType}_generated`)
  reachGoal('pdf_generated', { docType })
}

/** PDF скачан */
export function trackPdfDownloaded(docType: DocType) {
  reachGoal('pdf_downloaded', { docType })
}

/** Ошибка валидации формы до генерации */
export function trackValidationError(
  docType: DocType,
  field: 'supplier' | 'buyer' | 'items' | 'subject' | 'endDate',
) {
  reachGoal('validation_error', { docType, field })
}

/** Брошенная форма: старт был, генерации PDF не было */
export function trackFormAbandonIfNeeded(docType: DocType) {
  const started = getFunnelValue(docType, 'started') === '1'
  const completed = getFunnelValue(docType, 'completed') === '1'
  const abandonSent = getFunnelValue(docType, 'abandonSent') === '1'
  const companyFilled = getFunnelValue(docType, 'companyFilled') === '1'
  const startedAt = Number(getFunnelValue(docType, 'startedAt', '0'))
  const longEnough = startedAt > 0 && Date.now() - startedAt >= 10_000

  if (!started || completed || abandonSent) return false
  if (!companyFilled && !longEnough) return false

  setFunnelValue(docType, 'abandonSent', '1')
  reachGoal('form_abandon', { docType })
  return true
}

/** Ошибка генерации */
export function getFunnelSnapshot(docType: DocType) {
  return {
    started: getFunnelValue(docType, 'started') === '1',
    completed: getFunnelValue(docType, 'completed') === '1',
    companyFilled: getFunnelValue(docType, 'companyFilled') === '1',
    nudgeShown: getFunnelValue(docType, 'nudgeShown') === '1',
  }
}

export function trackExitIntentNudge(docType: DocType) {
  const snapshot = getFunnelSnapshot(docType)
  if (!snapshot.started || snapshot.completed || snapshot.nudgeShown) return false

  setFunnelValue(docType, 'nudgeShown', '1')
  reachGoal('exit_intent_nudge_shown', { docType })
  return true
}

export function trackGenerationError(docType: DocType, error: string) {
  reachGoal('generation_error', { docType, error: error.slice(0, 120) })
}
