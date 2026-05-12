'use client'

import { useGameStore } from '@/store/gameStore'

const METRIC_LABELS = {
  executiveTrust: '임원 신뢰도',
  kpiProgress: 'KPI 달성률',
  teamMorale: '팀 사기',
  stress: '스트레스',
  budget: '예산',
  politicalCapital: '조직 영향력',
}

interface Props {
  hiddenMessages: string[]
  onNext: () => void
}

export function WeekSummary({ hiddenMessages, onNext }: Props) {
  const week = useGameStore(s => s.week)
  const metrics = useGameStore(s => s.metrics)

  const isLast = week >= 12

  // 지표 상태 요약
  const dangerMetrics = Object.entries(metrics).filter(([k, v]) => {
    if (k === 'stress') return v >= 80
    return v <= 20
  })

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="rounded-2xl border border-white/10 bg-[#1a1f2e] overflow-hidden">
        <div className="px-4 py-3 bg-[#141824] flex items-center gap-2">
          <span className="text-gray-400 text-xs font-mono">WEEK {String(week).padStart(2,'0')} SUMMARY</span>
        </div>

        <div className="p-4 space-y-3">
          {/* 숨겨진 효과 알림 */}
          {hiddenMessages.length > 0 && (
            <div className="space-y-2">
              {hiddenMessages.map((msg, i) => (
                <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-amber-900/30 border border-amber-500/30">
                  <span className="text-amber-400 text-sm">⚠️</span>
                  <p className="text-amber-200 text-xs leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
          )}

          {/* 위험 지표 경고 */}
          {dangerMetrics.length > 0 && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-red-900/30 border border-red-500/30">
              <span className="text-red-400 text-sm">🔴</span>
              <p className="text-red-200 text-xs">
                <span className="font-bold">위험 지표: </span>
                {dangerMetrics.map(([k]) => METRIC_LABELS[k as keyof typeof METRIC_LABELS]).join(', ')}
              </p>
            </div>
          )}

          {!isLast ? (
            <p className="text-gray-400 text-xs">남은 주차: {12 - week}주</p>
          ) : (
            <p className="text-yellow-400 text-sm font-bold">⭐ 12주 완료! 결과를 확인합니다.</p>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-bold text-sm transition-colors bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isLast ? '🏁 최종 결과 보기' : `${week + 1}주차로 →`}
          </button>
        </div>
      </div>
    </div>
  )
}
