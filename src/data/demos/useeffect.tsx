import { useEffect, useLayoutEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import type { DemoProps, MeasureResult } from '@/lib/measure'
import { runMeasurement } from '@/lib/measure'

/* ------------------------------------------------------------------ */
/* 2.1 — Missing dependency → effect over-fires                        */
/* ------------------------------------------------------------------ */

function Deps_Broken({ tracker, register }: DemoProps) {
  const [id, setId] = useState(0)
  const [noise, setNoise] = useState(0)
  useLayoutEffect(
    () =>
      register({
        changeId: () => setId((v) => v + 1),
        poke: () => setNoise((v) => v + 1),
      }),
    [register],
  )
  // No dependency array → runs after *every* render, even unrelated ones.
  useEffect(() => {
    tracker.bump('effects')
  })
  void id
  void noise
  return null
}

function Deps_Fixed({ tracker, register }: DemoProps) {
  const [id, setId] = useState(0)
  const [, setNoise] = useState(0)
  useLayoutEffect(
    () =>
      register({
        changeId: () => setId((v) => v + 1),
        poke: () => setNoise((v) => v + 1),
      }),
    [register],
  )
  // Runs only when `id` actually changes.
  useEffect(() => {
    tracker.bump('effects')
  }, [id, tracker])
  return null
}

export function measureMissingDeps(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    // 3 real id changes interleaved with 6 unrelated re-renders.
    const plan = ['changeId', 'poke', 'poke', 'changeId', 'poke', 'poke', 'changeId', 'poke', 'poke']
    plan.forEach((action) => step(api[action]))
  }
  return {
    before: runMeasurement({ Demo: Deps_Broken, metric: 'effects', scenario: drive }),
    after: runMeasurement({ Demo: Deps_Fixed, metric: 'effects', scenario: drive }),
  }
}

/* ------------------------------------------------------------------ */
/* 2.2 — Infinite loop (modelled, capped for browser safety)          */
/* ------------------------------------------------------------------ */

const LOOP_CAP = 50

export function measureInfiniteLoop(): MeasureResult {
  // The broken effect sets state it also depends on, so each run schedules the
  // next — forever. We model that divergence and cap it so nothing freezes.
  let runs = 0
  let n = 0
  while (n < LOOP_CAP) {
    runs++
    n++ // setState(prev => prev + 1) → dependency changes → effect re-runs
  }
  // The fix removes the self-dependency, so the effect settles after one run.
  return { before: runs, after: 1 }
}

/* ------------------------------------------------------------------ */
/* 2.3 — Missing cleanup → leaked listeners                           */
/* ------------------------------------------------------------------ */

function makeMockTarget() {
  let count = 0
  return {
    live: () => count,
    addEventListener: (_type: string, _handler: () => void) => {
      count++
    },
    removeEventListener: (_type: string, _handler: () => void) => {
      count = Math.max(0, count - 1)
    },
  }
}

type MockTarget = ReturnType<typeof makeMockTarget>

function Cleanup_Broken({ target }: { target: MockTarget }) {
  useEffect(() => {
    const handler = () => {}
    target.addEventListener('resize', handler)
    // No cleanup → this listener outlives the component.
  }, [target])
  return null
}

function Cleanup_Fixed({ target }: { target: MockTarget }) {
  useEffect(() => {
    const handler = () => {}
    target.addEventListener('resize', handler)
    return () => target.removeEventListener('resize', handler)
  }, [target])
  return null
}

function mountUnmountCycles(
  Component: (props: { target: MockTarget }) => JSX.Element | null,
  target: MockTarget,
  cycles: number,
) {
  for (let i = 0; i < cycles; i++) {
    const container = document.createElement('div')
    const root = createRoot(container)
    flushSync(() => root.render(<Component target={target} />))
    flushSync(() => {}) // flush the mount effect
    flushSync(() => root.unmount()) // flush cleanup (if any)
  }
}

export function measureMissingCleanup(): MeasureResult {
  const CYCLES = 5

  const brokenTarget = makeMockTarget()
  mountUnmountCycles(Cleanup_Broken, brokenTarget, CYCLES)

  const fixedTarget = makeMockTarget()
  mountUnmountCycles(Cleanup_Fixed, fixedTarget, CYCLES)

  return { before: brokenTarget.live(), after: fixedTarget.live() }
}
