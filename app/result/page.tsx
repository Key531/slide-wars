'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import endingsData from '@/data/endings.json'
import type { Metrics } from '@/types/game'

interface Ending {
  id: string
  title: string
  titleKr: string
  emoji: string
  type: string
  text: string
  shareText: string
}

const METRIC_LABELS: Record<keyof Metrics, string> = {
  executiveTrust:   '임원 신뢰도',
  kpiProgress:      'KPI 달성률',
  teamMorale:       '팀 사기',
  stress:           '스트레스',
  budget:           '예산',
  politicalCapital: '조직 영향력',
}

function getStars(metrics: Metrics): number {
  const scores = [
    metrics.executiveTrust,
    metrics.kpiProgress,
    metrics.teamMorale,
    100 - metrics.stress,
    metrics.budget,
    metrics.politicalCapital,
  ]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 75) return 5
  if (avg >= 60) return 4
  if (avg >= 45) return 3
  if (avg >= 30) return 2
  return 1
}

export default function ResultPage() {
  const router = useRouter()
  const { endingId, metrics, week, initGame } = useGameStore()
  const [copied, setCopied] = useState(false)

  const ending = (endingsData as Ending[]).find(e => e.id === endingId)
  const stars = getStars(metrics)

  // 엔딩 없으면 메뉴로
  useEffect(() => {
    if (!endingId) router.replace('/')
  }, [endingId, router])

  if (!ending) return null

  const typeColor = {
    positive: 'text-emerald-400',
    neutral: 'text-amber-400',
    negative: 'text-red-400',
  }[ending.type] || 'text-gray-400'

  const handleShare = async () => {
    const text = `${ending.shareText}\n\n${Object.entries(metrics).map(([k, v]) => `${METRIC_LABELS[k as keyof Metrics]}: ${v}`).join(' | ')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleRestart = () => {
    initGame()
    router.push('/game')
  }

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
        {/* 엔딩 카드 */}
        <div className="rounded-2xl border border-white/10 bg-[#1a1f2e] overflow-hidden">
          {/* 헤더 */}
          <div className="bg-[#141824] px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-[10px] font-mono tracking-wider mb-1">ENDING · WEEK {week}</div>
              <div className={`font-bold text-sm ${typeColor}`}>{ending.title}</div>
            </div>
            <div className="text-4xl">{ending.emoji}</div>
          </div>

          {/* 엔딩 타이틀 */}
          <div className="px-5 py-4 border-b border-white/5">
            <h1 className="text-2xl font-black text-white">{ending.titleKr}</h1>
            <div className="flex gap-0.5 mt-2">
              {Array.from({length:5}).map((_,i) => (
                <span key={i} className={`text-lg ${i < stars ? 'text-amber-400' : 'text-gray-700'}`}>★</span>
              ))}
            </div>
          </div>

          {/* 엔딩 텍스트 */}
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ending.text}</p>
          </div>

          {/* 최종 지표 */}
          <div className="px-5 py-4">
            <div className="text-gray-500 text-[10px] font-mono mb-3 tracking-wider">FINAL STATS</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(metrics) as [keyof Metrics, number][]).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">{METRIC_LABELS[k]}</span>
                  <span className={`text-xs font-bold tabular-nums ${
                    k === 'stress' ? (v >= 80 ? 'text-red-400' : 'text-emerald-400')
                    : (v <= 20 ? 'text-red-400' : v >= 70 ? 'text-emerald-400' : 'text-gray-300')
                  }`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
        >
          {copied ? '✅ 복사됨!' : '📋 결과 공유하기'}
        </button>

        {/* 재시작 버튼 */}
        <button
          onClick={handleRestart}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all font-bold text-white text-base"
        >
          다시 플레이 →
        </button>

        <button
          onClick={() => router.push('/')}
          className="text-gray-600 text-xs text-center hover:text-gray-400 transition-colors"
        >
          메인으로 돌아가기
        </button>
      </div>
    </main>
  )
}
