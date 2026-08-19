import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

/**
 * The measurement harness.
 *
 * Every drill ships a *real* React component pair (broken + fixed). To produce
 * honest before/after numbers we mount that component in a throwaway React root
 * that is detached from the visible app, drive a deterministic scenario against
 * it, and read a counter the component bumps as it renders / runs effects.
 *
 * Using `flushSync` makes each scripted interaction commit synchronously, so the
 * counts are exact and reproducible rather than dependent on scheduler timing.
 */

/** A count of "bad things" — always framed so that lower is better. */
export type Metric =
  | 'renders'
  | 'effects'
  | 'listeners'
  | 'staleReads'
  | 'identityChanges'

/** Handed to a demo so it can report activity as it happens. */
export interface Tracker {
  bump(metric: Metric, by?: number): void
  set(metric: Metric, value: number): void
  get(metric: Metric): number
}

/** Named interactions a demo exposes for a scenario to drive. */
export type DemoApi = Record<string, () => void>

export interface DemoProps {
  tracker: Tracker
  /** A demo calls this once (in an effect) to expose its interactions. */
  register: (api: DemoApi) => void
}

export type DemoComponent = ComponentType<DemoProps>

/** Runs an action inside a synchronous React commit. */
export type Step = (fn: () => void) => void

export interface RunOptions {
  Demo: DemoComponent
  metric: Metric
  /** Drives the demo. `step` wraps an interaction in a synchronous flush. */
  scenario: (api: DemoApi, step: Step) => void
}

function createTracker(): Tracker {
  const values: Partial<Record<Metric, number>> = {}
  return {
    bump: (m, by = 1) => {
      values[m] = (values[m] ?? 0) + by
    },
    set: (m, v) => {
      values[m] = v
    },
    get: (m) => values[m] ?? 0,
  }
}

/**
 * Mount `Demo` in a detached root, run `scenario`, and return the final value of
 * `metric`. The root is always unmounted, even if the scenario throws.
 */
export function runMeasurement({ Demo, metric, scenario }: RunOptions): number {
  const tracker = createTracker()
  let api: DemoApi = {}
  const register = (a: DemoApi) => {
    api = a
  }

  const container = document.createElement('div')
  const root = createRoot(container)

  const step: Step = (fn) => flushSync(fn)

  try {
    flushSync(() => {
      root.render(<Demo tracker={tracker} register={register} />)
    })
    scenario(api, step)
    // Flush any passive effects scheduled by the final interaction so their
    // work is included in the counts.
    flushSync(() => {})
  } finally {
    flushSync(() => root.unmount())
  }

  return tracker.get(metric)
}

export interface MeasureResult {
  before: number
  after: number
}
