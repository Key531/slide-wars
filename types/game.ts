export type MetricKey =
  | 'executiveTrust'
  | 'kpiProgress'
  | 'teamMorale'
  | 'stress'
  | 'budget'
  | 'politicalCapital'

export interface Metrics {
  executiveTrust: number
  kpiProgress: number
  teamMorale: number
  stress: number
  budget: number
  politicalCapital: number
}

export type GamePhase = 'menu' | 'playing' | 'week_summary' | 'ending'
export type Urgency = 'low' | 'medium' | 'high' | 'critical'

export interface MetricEffect {
  metric: MetricKey
  delta: number
}

export interface HiddenEffect extends MetricEffect {
  delay: number
  description: string
}

export interface ChainEventRef {
  targetEventId: string
  delay: number
}

export interface Choice {
  index: number
  text: string
  hint: string
  effects: MetricEffect[]
  hiddenEffects?: HiddenEffect[]
  chainEvent?: ChainEventRef | null
}

export interface GameEvent {
  id: string
  category: string
  categoryKr: string
  title: string
  week?: number | null
  npcId: string
  npcName: string
  npcOrg: string
  urgency: Urgency
  description: string
  choices: Choice[]
  triggerCondition?: {
    metric: MetricKey
    operator: 'gte' | 'lte'
    value: number
  } | null
  tags?: string[]
}

export interface ChoiceRecord {
  week: number
  eventId: string
  choiceIndex: number
}

export interface ChainEvent {
  triggerEventId: string
  choiceIndex: number
  targetEventId: string
  triggerWeek: number
}

export interface EndingData {
  id: string
  title: string
  titleKr: string
  emoji: string
  type: 'positive' | 'neutral' | 'negative'
  text: string
  shareText: string
  priority: number
  conditions: Partial<Record<MetricKey, { min?: number; max?: number }>>
}
