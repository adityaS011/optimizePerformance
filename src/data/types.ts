import type { MeasureResult, Metric } from '@/lib/measure'

export type TopicId = 'rerenders' | 'useeffect' | 'state'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Topic {
  id: TopicId
  title: string
  blurb: string
  accent: string // tailwind text color class for the topic accent
}

export interface Mcq {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface FixSpec {
  /** The exact substring of `brokenCode` the learner edits. */
  editable: string
  /** Accepted answers. Compared after whitespace-insensitive normalization. */
  solutions: string[]
  hint: string
  /** Shown once the fix is accepted. */
  successNote: string
}

export interface MetricSpec {
  type: Metric
  /** e.g. "Child renders", "Effect runs", "Leaked listeners". */
  label: string
  /** Short unit shown under each number, e.g. "renders". */
  unit: string
}

/** The mock content shown on a dashboard tile. */
export type TileKind =
  | 'stat'
  | 'list'
  | 'search'
  | 'filter'
  | 'toggle'
  | 'chart'
  | 'table'
  | 'settings'
  | 'clock'
  | 'badge'
  | 'menu'
  | 'spinner'
  | 'tasks'
  | 'revenue'
  | 'breadcrumb'

export interface WidgetSpec {
  /** Product-facing name shown on the dashboard, e.g. "Active Users". */
  name: string
  /** Human category of the issue, e.g. "Unnecessary re-render". */
  category: string
  kind: TileKind
  severity: 'high' | 'medium'
  /** Grid column span on desktop. */
  span: 1 | 2
}

export interface Drill {
  id: string
  topicId: TopicId
  title: string
  description: string
  difficulty: Difficulty
  widget: WidgetSpec
  mcq: Mcq
  brokenCode: string
  correctCode: string
  fix: FixSpec
  metric: MetricSpec
  keyTakeaway: string
  relatedConcepts: string[]
  /** Runs the live before/after measurement for this drill. */
  measure: () => MeasureResult
}
