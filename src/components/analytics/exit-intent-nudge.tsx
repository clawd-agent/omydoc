'use client'

import { useEffect, useState } from 'react'
import { getFunnelSnapshot, trackExitIntentNudge } from '@/lib/analytics/metrika'

interface ExitIntentNudgeProps {
  docType: 'invoice' | 'act' | 'contract'
}

export function ExitIntentNudge({ docType }: ExitIntentNudgeProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY > 0) return

      const snapshot = getFunnelSnapshot(docType)
      if (!snapshot.started || snapshot.completed || snapshot.nudgeShown) return

      const shown = trackExitIntentNudge(docType)
      if (shown) setVisible(true)
    }

    window.addEventListener('mouseout', onMouseOut)
    return () => window.removeEventListener('mouseout', onMouseOut)
  }, [docType])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-blue-200 shadow-xl rounded-2xl p-4 z-50">
      <p className="text-sm font-semibold text-slate-900">Перед уходом: можно закончить документ за 1-2 минуты</p>
      <p className="text-xs text-slate-500 mt-1">Проверьте только ИНН и название сторон — остальное уже заполнено.</p>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-blue-600"
        onClick={() => setVisible(false)}
      >
        Продолжить заполнение
      </button>
    </div>
  )
}
