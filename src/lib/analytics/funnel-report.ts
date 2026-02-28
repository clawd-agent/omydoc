export type DocType = 'invoice' | 'act' | 'contract'

export interface FunnelCounts {
  form_start: number
  company_filled: number
  pdf_generated: number
  pdf_downloaded: number
  form_abandon: number
  validation_error?: number
}

export interface ValidationErrorBreakdown {
  supplier: number
  buyer: number
  items: number
  subject: number
  endDate: number
}

export interface FunnelStageMetric {
  from: keyof FunnelCounts
  to: keyof FunnelCounts
  conversion: number
  dropoff: number
}

export interface FunnelReportItem {
  docType: DocType
  counts: FunnelCounts
  stages: FunnelStageMetric[]
  validationErrors?: ValidationErrorBreakdown
}

function safeRate(numerator: number, denominator: number) {
  if (!denominator || denominator <= 0) return 0
  return Number(((numerator / denominator) * 100).toFixed(2))
}

export function buildFunnelReport(
  data: Record<DocType, FunnelCounts>,
  validationByDocType?: Partial<Record<DocType, ValidationErrorBreakdown>>,
): FunnelReportItem[] {
  return (Object.entries(data) as Array<[DocType, FunnelCounts]>).map(([docType, counts]) => {
    const stages: FunnelStageMetric[] = [
      {
        from: 'form_start',
        to: 'company_filled',
        conversion: safeRate(counts.company_filled, counts.form_start),
        dropoff: Number((100 - safeRate(counts.company_filled, counts.form_start)).toFixed(2)),
      },
      {
        from: 'company_filled',
        to: 'pdf_generated',
        conversion: safeRate(counts.pdf_generated, counts.company_filled),
        dropoff: Number((100 - safeRate(counts.pdf_generated, counts.company_filled)).toFixed(2)),
      },
      {
        from: 'pdf_generated',
        to: 'pdf_downloaded',
        conversion: safeRate(counts.pdf_downloaded, counts.pdf_generated),
        dropoff: Number((100 - safeRate(counts.pdf_downloaded, counts.pdf_generated)).toFixed(2)),
      },
    ]

    return {
      docType,
      counts,
      stages,
      validationErrors: validationByDocType?.[docType],
    }
  })
}
