import type { GameEvent, Metrics, ChainEvent } from '@/types/game'
import eventsData from '@/data/events.json'

const ALL_EVENTS = eventsData as GameEvent[]

export function selectEvents(
  week: number,
  metrics: Metrics,
  completedIds: string[],
  pendingChains: ChainEvent[]
): GameEvent[] {
  const result: GameEvent[] = []

  // 1. 고정 이벤트 (해당 주차)
  const fixed = ALL_EVENTS.filter(
    e => e.week === week && !completedIds.includes(e.id)
  )
  result.push(...fixed)

  // 2. 연쇄 이벤트 (이번 주 발동)
  const chainIds = pendingChains
    .filter(c => c.triggerWeek === week)
    .map(c => c.targetEventId)
  const chains = ALL_EVENTS.filter(
    e => chainIds.includes(e.id) && !completedIds.includes(e.id)
  )
  result.push(...chains)

  // 3. 번아웃 트리거 이벤트
  if (metrics.stress >= 75) {
    const stressTrigger = ALL_EVENTS.find(
      e => e.id === 'STRESS-TRIGGER' && !completedIds.includes(e.id)
    )
    if (stressTrigger) result.push(stressTrigger)
  }

  if (result.length > 0) return result

  // 4. 조건 트리거 이벤트
  const conditional = ALL_EVENTS.filter(e => {
    if (completedIds.includes(e.id)) return false
    if (e.week !== null && e.week !== undefined) return false
    if (!e.triggerCondition) return false
    const { metric, operator, value } = e.triggerCondition
    if (operator === 'gte') return metrics[metric] >= value
    if (operator === 'lte') return metrics[metric] <= value
    return false
  })
  if (conditional.length > 0) {
    result.push(conditional[0])
    return result
  }

  // 5. 가중치 기반 랜덤 이벤트
  const pool = ALL_EVENTS.filter(e => {
    if (completedIds.includes(e.id)) return false
    if (e.week !== null && e.week !== undefined) return false
    if (e.triggerCondition) return false
    if (e.id === 'STRESS-TRIGGER') return false
    return true
  })

  if (pool.length === 0) return []

  // 가중치 계산
  const weighted = pool.map(e => {
    let weight = 1
    if (e.category === 'reporting' && metrics.executiveTrust < 40) weight += 1
    if (e.category === 'politics' && metrics.politicalCapital < 30) weight += 1
    if (e.category === 'human' && metrics.teamMorale < 30) weight += 2
    if (e.category === 'kpi' && week >= 8) weight += 1
    if (e.category === 'reorg' && week >= 9) weight += 2
    if (e.category === 'ai' && week <= 6) weight += 1
    return { event: e, weight }
  })

  // 가중치 기반 선택
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0)
  const rand = Math.random() * totalWeight
  let cumulative = 0
  for (const { event, weight } of weighted) {
    cumulative += weight
    if (rand <= cumulative) {
      result.push(event)
      break
    }
  }

  // 두 번째 이벤트 (30% 확률)
  if (result.length === 1 && week >= 5 && Math.random() < 0.3) {
    const remaining = pool.filter(e => e.id !== result[0].id)
    if (remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length)
      result.push(remaining[idx])
    }
  }

  return result
}
