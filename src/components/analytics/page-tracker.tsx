'use client'

import { useEffect } from 'react'
import { trackLandingView, trackFormAbandonIfNeeded } from '@/lib/analytics/metrika'

interface PageTrackerProps {
  page: 'schet' | 'akt' | 'dogovor'
  docType?: 'invoice' | 'act' | 'contract'
}

export function PageTracker({ page, docType }: PageTrackerProps) {
  useEffect(() => {
    trackLandingView(page)
  }, [page])

  useEffect(() => {
    if (!docType) return

    const handlePageHide = () => {
      trackFormAbandonIfNeeded(docType)
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [docType])

  return null
}
