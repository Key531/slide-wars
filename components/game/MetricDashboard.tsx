'use client'

import { useGameStore } from '@/store/gameStore'
import type { MetricKey } from '@/types/game'

const METRICS: { key: MetricKey; label: string; short: string; inverted?: boolean }[] = [
  { key: 'executiveTrust',   label: '임원 신뢰도',  short: 'ET' },
  { key: 'kpiProgress',      label: 'KPI 달성률',   short: 'KPI' },
  { key: 'teamMorale',       label: '팀 사기',       short: 'TM' },
  { key: 'stress',           label: '스트레스',      short: 'ST', inverted: true },
  { key: 'budget',           label: '예산',          short: 'BG' },
  { key: 'politicalCapital', label: '조직 영향력',   short: 'PC' },
]

function getColor(value: number, inverted: boolean): string {
  const eff = inverted ? 100 - value : value
  if (eff >= 70) return 'bg-emerald-500'
  if (eff >= 45) return 'bg-blue-400'
  if (eff >= 25) return 'bg-amber-400'
  return 'bg-red-500'
}

function isDanger(value: number, inverted?: boolean): boolean {
  return inverted ? value >= 80 : value <= 20
}

export function MetricDashboard() {
  const metrics = useGameStore(s => s.metrics)
  const week = useGameStore(s => s.week)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 주차 표시 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs font-mono">WEEK</span>
          <span className="text-white font-bold text-lg">{String(week).padStart(2,'0')}</span>
          <span className="text-gray-600 text-xs">/ 12</span>
        </div>
        <div className="flex gap-1">
          {Array.from({length:12}).map((_,i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < week ? 'bg-blue-500' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>

      {/* 지표 그리드 */}
      <div className="grid grid-cols-2 gap-2">
        {METRICS.map(m => {
          const val = metrics[m.key]
          const danger = isDanger(val, m.inverted)
          return (
            <div key={m.key} className={`rounded-xl p-3 border transition-colors ${danger ? 'border-red-500/60 bg-red-900/20' : 'border-white/5 bg-white/5'}`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-gray-400 text-[10px] font-mono uppercase tracking-wider">{m.short}</span>
                <span className={`text-sm font-bold tabular-nums ${danger ? 'text-red-400' : 'text-white'}`}>
                  {val}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getColor(val, !!m.inverted)}`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
