import type { Metrics } from '@/types/game'
import endingsData from '@/data/endings.json'

interface EndingCondition {
  min?: number
  max?: number
}

interface Ending {
  id: string
  priority: number
  conditions: Partial<Record<keyof Metrics, EndingCondition>>
  [key: string]: unknown
}

const ENDINGS = (endingsData as Ending[]).sort((a, b) => b.priority - a.priority)

export function calculateEnding(metrics: Metrics): string {
  for (const ending of ENDINGS) {
    if (matchesConditions(metrics, ending.conditions)) {
      return ending.id
    }
  }
  return 'END-FULLCIRCLE'
}

function matchesConditions(
  metrics: Metrics,
  conditions: Partial<Record<keyof Metrics, EndingCondition>>
): boolean {
  const entries = Object.entries(conditions) as [keyof Metrics, EndingCondition][]
  if (entries.length === 0) return true
  return entries.every(([key, cond]) => {
    const val = metrics[key]
    if (cond.min !== undefined && val < cond.min) return false
    if (cond.max !== undefined && val > cond.max) return false
    return true
  })
}
