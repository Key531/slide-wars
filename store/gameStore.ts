'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Metrics, GamePhase, ChoiceRecord, ChainEvent, GameEvent } from '@/types/game'

interface PendingHiddenEffect {
  metric: keyof Metrics
  delta: number
  triggerWeek: number
  description: string
}

interface GameStore {
  // 상태
  week: number
  phase: GamePhase
  metrics: Metrics
  // 고정/1회성 이벤트만 영구 차단 (fixed, chain, trigger)
  completedOneTimeIds: string[]
  // 최근 보여준 랜덤 이벤트 (최대 RECENT_MAX개) — 이것만 단기 차단
  recentEventIds: string[]
  pendingChainEvents: ChainEvent[]
  pendingHiddenEffects: PendingHiddenEffect[]
  choiceHistory: ChoiceRecord[]
  endingId: string | null
  lastFeedback: { text: string; effects: { metric: keyof Metrics; delta: number }[] } | null

  // 액션
  initGame: () => void
  processChoice: (event: GameEvent, choiceIndex: number) => void
  advanceWeek: () => void
  applyHiddenEffects: (week: number) => string[]
  setEnding: (id: string) => void
  resetFeedback: () => void
}

const INITIAL_METRICS: Metrics = {
  executiveTrust: 40,
  kpiProgress: 50,
  teamMorale: 60,
  stress: 30,
  budget: 70,
  politicalCapital: 35,
}

function clamp(v: number) { return Math.max(0, Math.min(100, v)) }

// 1회성 이벤트 ID 패턴 (week 지정 or FIXED/STRESS/chain)
function isOneTime(eventId: string): boolean {
  return eventId.startsWith('FIXED') || eventId.startsWith('STRESS') || eventId.startsWith('E-001')
}

const RECENT_MAX = 7 // 최근 7개 이벤트는 다시 안 나옴 (7개 이후 재등장 가능)

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      week: 1,
      phase: 'menu',
      metrics: { ...INITIAL_METRICS },
      completedOneTimeIds: [],
      recentEventIds: [],
      pendingChainEvents: [],
      pendingHiddenEffects: [],
      choiceHistory: [],
      endingId: null,
      lastFeedback: null,

      initGame: () => set({
        week: 1,
        phase: 'playing',
        metrics: { ...INITIAL_METRICS },
        completedOneTimeIds: [],
        recentEventIds: [],
        pendingChainEvents: [],
        pendingHiddenEffects: [],
        choiceHistory: [],
        endingId: null,
        lastFeedback: null,
      }),

      processChoice: (event, choiceIndex) => {
        const state = get()
        const choice = event.choices[choiceIndex]
        const newMetrics = { ...state.metrics }

        // 즉각 효과 적용
        choice.effects.forEach(e => {
          newMetrics[e.metric] = clamp(newMetrics[e.metric] + e.delta)
        })

        // 숨겨진 효과 등록
        const newHidden = [...state.pendingHiddenEffects]
        choice.hiddenEffects?.forEach(h => {
          newHidden.push({
            metric: h.metric,
            delta: h.delta,
            triggerWeek: state.week + h.delay,
            description: h.description,
          })
        })

        // 연쇄 이벤트 등록
        const newChains = [...state.pendingChainEvents]
        if (choice.chainEvent) {
          newChains.push({
            triggerEventId: event.id,
            choiceIndex,
            targetEventId: choice.chainEvent.targetEventId,
            triggerWeek: state.week + choice.chainEvent.delay,
          })
        }

        // 1회성 이벤트는 영구 차단, 랜덤 이벤트는 recentEventIds에 추가
        const newOneTime = isOneTime(event.id)
          ? [...state.completedOneTimeIds, event.id]
          : state.completedOneTimeIds

        const newRecent = isOneTime(event.id)
          ? state.recentEventIds
          : [...state.recentEventIds, event.id].slice(-RECENT_MAX)

        set({
          metrics: newMetrics,
          completedOneTimeIds: newOneTime,
          recentEventIds: newRecent,
          pendingChainEvents: newChains,
          pendingHiddenEffects: newHidden,
          choiceHistory: [...state.choiceHistory, { week: state.week, eventId: event.id, choiceIndex }],
          lastFeedback: {
            text: choice.text,
            effects: choice.effects,
          },
        })
      },

      advanceWeek: () => {
        const state = get()
        const nextWeek = state.week + 1
        if (nextWeek > 12) {
          set({ phase: 'ending' })
          return
        }
        set({ week: nextWeek, lastFeedback: null })
      },

      applyHiddenEffects: (week) => {
        const state = get()
        const due = state.pendingHiddenEffects.filter(h => h.triggerWeek === week)
        if (due.length === 0) return []

        const newMetrics = { ...state.metrics }
        const messages: string[] = []
        due.forEach(h => {
          newMetrics[h.metric] = clamp(newMetrics[h.metric] + h.delta)
          messages.push(h.description)
        })

        set({
          metrics: newMetrics,
          pendingHiddenEffects: state.pendingHiddenEffects.filter(h => h.triggerWeek !== week),
        })
        return messages
      },

      setEnding: (id) => set({ endingId: id, phase: 'ending' }),
      resetFeedback: () => set({ lastFeedback: null }),
    }),
    { name: 'slide-wars-v1' }
  )
)
