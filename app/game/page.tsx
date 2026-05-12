'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { MetricDashboard } from '@/components/game/MetricDashboard'
import { EventCard } from '@/components/game/EventCard'
import { FeedbackToast } from '@/components/game/FeedbackToast'
import { WeekSummary } from '@/components/game/WeekSummary'
import { selectEvents } from '@/lib/game/eventSelector'
import { calculateEnding } from '@/lib/game/endingCalculator'
import type { GameEvent, MetricKey } from '@/types/game'

type UIPhase = 'events' | 'feedback' | 'summary'

export default function GamePage() {
  const router = useRouter()
  const {
    week, phase, metrics,
    completedOneTimeIds, recentEventIds, pendingChainEvents,
    processChoice, advanceWeek,
    applyHiddenEffects, setEnding, lastFeedback, resetFeedback,
  } = useGameStore()

  const [uiPhase, setUiPhase] = useState<UIPhase>('events')
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [hiddenMessages, setHiddenMessages] = useState<string[]>([])
  const [disabled, setDisabled] = useState(false)

  // 게임 미시작 시 메뉴로
  useEffect(() => {
    if (phase === 'menu') router.replace('/')
  }, [phase, router])

  // 주차 시작 시 이벤트 로드
  useEffect(() => {
    if (uiPhase !== 'events') return
    const events = selectEvents(week, metrics, completedOneTimeIds, recentEventIds, pendingChainEvents)
    if (events.length === 0) {
      // 이벤트 없으면 바로 요약 (freeze 방지)
      goToSummary()
      return
    }
    setCurrentEvents(events)
    setCurrentEventIndex(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, uiPhase])

  const goToSummary = useCallback(() => {
    const msgs = applyHiddenEffects(week)
    setHiddenMessages(msgs)
    setUiPhase('summary')
  }, [applyHiddenEffects, week])

  const handleChoice = useCallback((idx: number) => {
    const event = currentEvents[currentEventIndex]
    if (!event) return
    setDisabled(true)
    processChoice(event, idx)

    // 피드백 보여주고 다음 이벤트 또는 요약으로
    setTimeout(() => {
      resetFeedback()
      setDisabled(false)
      const nextIndex = currentEventIndex + 1
      if (nextIndex < currentEvents.length) {
        setCurrentEventIndex(nextIndex)
      } else {
        goToSummary()
      }
    }, 1600)
  }, [currentEvents, currentEventIndex, processChoice, resetFeedback, goToSummary])

  const handleNextWeek = useCallback(() => {
    // 엔딩 판정
    if (week >= 12) {
      const endingId = calculateEnding(metrics)
      setEnding(endingId)
      router.push('/result')
      return
    }
    advanceWeek()
    setUiPhase('events')
    setHiddenMessages([])
  }, [week, metrics, setEnding, advanceWeek, router])

  if (phase === 'menu') return null

  const currentEvent = currentEvents[currentEventIndex]

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center py-6 px-4 gap-4 pb-20">
      {/* 대시보드 */}
      <MetricDashboard />

      {/* 이벤트 영역 */}
      {uiPhase === 'events' && currentEvent && (
        <div className="w-full max-w-md">
          {currentEvents.length > 1 && (
            <div className="text-center text-gray-600 text-xs mb-3">
              이벤트 {currentEventIndex + 1} / {currentEvents.length}
            </div>
          )}
          <EventCard
            event={currentEvent}
            onChoice={handleChoice}
            disabled={disabled}
          />
        </div>
      )}

      {/* 주간 요약 */}
      {uiPhase === 'summary' && (
        <WeekSummary
          hiddenMessages={hiddenMessages}
          onNext={handleNextWeek}
        />
      )}

      {/* 피드백 토스트 */}
      {lastFeedback && lastFeedback.effects.length > 0 && (
        <FeedbackToast
          effects={lastFeedback.effects as { metric: MetricKey; delta: number }[]}
          onDone={resetFeedback}
        />
      )}
    </main>
  )
}
