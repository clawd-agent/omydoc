// Яндекс.Метрика — отправка целей
// Документация: https://yandex.ru/support/metrica/objects/reachgoal.html

declare global {
  interface Window {
    ym?: (id: number, action: string, target: string, params?: Record<string, unknown>) => void
  }
}

const METRIKA_ID = 106680198

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
export function trackFormStart(docType: 'invoice' | 'act' | 'contract') {
  reachGoal('form_start', { docType })
}

/** Реквизиты компании заполнены */
export function trackCompanyFilled(docType: 'invoice' | 'act' | 'contract') {
  reachGoal('company_filled', { docType })
}

/** PDF успешно сгенерирован */
export function trackPdfGenerated(docType: 'invoice' | 'act' | 'contract') {
  reachGoal(`${docType}_generated`)
  reachGoal('pdf_generated', { docType })
}

/** PDF скачан */
export function trackPdfDownloaded(docType: 'invoice' | 'act' | 'contract') {
  reachGoal('pdf_downloaded', { docType })
}

/** Ошибка генерации */
export function trackGenerationError(docType: 'invoice' | 'act' | 'contract', error: string) {
  reachGoal('generation_error', { docType, error })
}
