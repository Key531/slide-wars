'use client'

import { useEffect, useState } from 'react'
import type { MetricKey } from '@/types/game'

const METRIC_LABELS: Record<MetricKey, string> = {
  executiveTrust: 'ET',
  kpiProgress: 'KPI',
  teamMorale: 'TM',
  stress: 'ST',
  budget: 'BG',
  politicalCapital: 'PC',
}

interface Props {
  effects: { metric: MetricKey; delta: number }[]
  onDone: () => void
}

export function FeedbackToast({ effects, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {effects.map((e, i) => (
        <div key={i} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-bold ${e.delta > 0 ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-300' : 'bg-red-900/80 border-red-500/50 text-red-300'}`}>
          <span className="text-xs text-gray-400">{METRIC_LABELS[e.metric]}</span>
          <span>{e.delta > 0 ? '+' : ''}{e.delta}</span>
        </div>
      ))}
    </div>
  )
}
