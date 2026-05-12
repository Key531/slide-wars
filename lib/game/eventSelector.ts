import type { GameEvent, Metrics, ChainEvent } from '@/types/game'
import eventsData from '@/data/events.json'

const ALL_EVENTS = eventsData as GameEvent[]

export function selectEvents(
  week: number,
  metrics: Metrics,
  completedOneTimeIds: string[],  // 1회성 이벤트만 영구 차단
  recentEventIds: string[],        // 랜덤 이벤트 단기 차단
  pendingChains: ChainEvent[]
): GameEvent[] {
  const result: GameEvent[] = []

  // 1. 고정 이벤트 (해당 주차) — 1회성
  const fixed = ALL_EVENTS.filter(
    e => e.week === week && !completedOneTimeIds.includes(e.id)
  )
  result.push(...fixed)

  // 2. 연쇄 이벤트 (이번 주 발동) — 1회성
  const chainIds = pendingChains
    .filter(c => c.triggerWeek === week)
    .map(c => c.targetEventId)
  const chains = ALL_EVENTS.filter(
    e => chainIds.includes(e.id) && !completedOneTimeIds.includes(e.id)
  )
  result.push(...chains)

  // 3. 번아웃 트리거 — stress 기반 1회성
  if (metrics.stress >= 75 && !completedOneTimeIds.includes('STRESS-TRIGGER')) {
    const stressTrigger = ALL_EVENTS.find(e => e.id === 'STRESS-TRIGGER')
    if (stressTrigger) result.push(stressTrigger)
  }

  if (result.length > 0) return result

  // 4. 랜덤 이벤트 풀 (recent만 제외, 완료 여부 무관 → 재등장 가능)
  const randomPool = ALL_EVENTS.filter(e => {
    if (completedOneTimeIds.includes(e.id)) return false  // 1회성 차단
    if (e.week !== null && e.week !== undefined) return false  // 고정 주차 이벤트 제외
    if (e.triggerCondition) return false  // 조건 이벤트 제외
    if (e.id === 'STRESS-TRIGGER') return false
    if (recentEventIds.includes(e.id)) return false  // 최근 본 이벤트 단기 차단
    return true
  })

  // pool이 비면 recent 제한 해제 (freeze 방지)
  const pool = randomPool.length > 0
    ? randomPool
    : ALL_EVENTS.filter(e => {
        if (completedOneTimeIds.includes(e.id)) return false
        if (e.week !== null && e.week !== undefined) return false
        if (e.triggerCondition) return false
        if (e.id === 'STRESS-TRIGGER') return false
        return true
      })

  if (pool.length === 0) return []

  // 가중치 계산 (지표 상태 반영)
  const weighted = pool.map(e => {
    let weight = 2  // 기본 가중치
    if (e.category === 'reporting' && metrics.executiveTrust < 40) weight += 2
    if (e.category === 'politics' && metrics.politicalCapital < 30) weight += 2
    if (e.category === 'human' && metrics.teamMorale < 35) weight += 3
    if (e.category === 'conflict' && metrics.budget < 40) weight += 2
    if (e.category === 'kpi' && week >= 7) weight += 2
    if (e.category === 'reorg' && week >= 9) weight += 3
    if (e.category === 'ai' && week <= 8) weight += 1
    if (e.category === 'meeting' && metrics.stress > 60) weight += 1
    // 최근에 같은 카테고리를 봤으면 가중치 낮춤 (다양성)
    const recentCategories = recentEventIds
      .slice(-3)
      .map(id => ALL_EVENTS.find(ev => ev.id === id)?.category)
    if (recentCategories.includes(e.category)) weight = Math.max(1, weight - 2)
    return { event: e, weight }
  })

  // 가중치 기반 랜덤 선택
  const pick = weightedPick(weighted)
  if (pick) result.push(pick)

  // 두 번째 이벤트 (week 5+ 에서 40% 확률, 단 다른 카테고리)
  if (result.length === 1 && week >= 5 && Math.random() < 0.4) {
    const firstCategory = result[0].category
    const secondPool = pool.filter(e => e.id !== result[0].id && e.category !== firstCategory)
    if (secondPool.length > 0) {
      const idx = Math.floor(Math.random() * secondPool.length)
      result.push(secondPool[idx])
    }
  }

  return result
}

function weightedPick(items: { event: GameEvent; weight: number }[]): GameEvent | null {
  if (items.length === 0) return null
  const total = items.reduce((s, i) => s + i.weight, 0)
  let rand = Math.random() * total
  for (const { event, weight } of items) {
    rand -= weight
    if (rand <= 0) return event
  }
  return items[items.length - 1].event
}
