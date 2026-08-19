import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DemoProps, MeasureResult, Tracker } from '@/lib/measure'
import { runMeasurement } from '@/lib/measure'

/* ------------------------------------------------------------------ */
/* 3.1 — Stale closure in useEffect                                    */
/* ------------------------------------------------------------------ */

function Stale_Broken({ tracker, register }: DemoProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  countRef.current = count
  const handlerRef = useRef<() => number>(() => 0)

  // Empty deps → the handler closes over `count` from the first render forever.
  useEffect(() => {
    handlerRef.current = () => count
  }, [])

  useLayoutEffect(
    () =>
      register({
        inc: () => setCount((c) => c + 1),
        fire: () => {
          const seen = handlerRef.current()
          if (seen !== countRef.current) tracker.bump('staleReads')
        },
      }),
    [register, tracker],
  )
  return null
}

function Stale_Fixed({ tracker, register }: DemoProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  countRef.current = count
  const handlerRef = useRef<() => number>(() => 0)

  // `count` in deps → the handler is refreshed whenever count changes.
  useEffect(() => {
    handlerRef.current = () => count
  }, [count])

  useLayoutEffect(
    () =>
      register({
        inc: () => setCount((c) => c + 1),
        fire: () => {
          const seen = handlerRef.current()
          if (seen !== countRef.current) tracker.bump('staleReads')
        },
      }),
    [register, tracker],
  )
  return null
}

export function measureStaleClosure(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 8; i++) {
      step(api.inc)
      step(api.fire)
    }
  }
  return {
    before: runMeasurement({ Demo: Stale_Broken, metric: 'staleReads', scenario: drive }),
    after: runMeasurement({ Demo: Stale_Fixed, metric: 'staleReads', scenario: drive }),
  }
}

/* ------------------------------------------------------------------ */
/* 3.2 — Multiple state updates → multiple renders                     */
/* ------------------------------------------------------------------ */

function Split_Broken({ tracker, register }: DemoProps) {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  tracker.bump('renders')
  useLayoutEffect(
    () =>
      register({
        a: () => setA(1),
        b: () => setB(2),
        c: () => setC(3),
      }),
    [register],
  )
  void a
  void b
  void c
  return null
}

function Split_Fixed({ tracker, register }: DemoProps) {
  const [state, setState] = useState({ a: 0, b: 0, c: 0 })
  tracker.bump('renders')
  useLayoutEffect(
    () => register({ apply: () => setState({ a: 1, b: 2, c: 3 }) }),
    [register],
  )
  void state
  return null
}

export function measureStateSplits(): MeasureResult {
  // Three independent updates land in three separate commits.
  const brokenRaw = runMeasurement({
    Demo: Split_Broken,
    metric: 'renders',
    scenario: (api, step) => {
      step(api.a)
      step(api.b)
      step(api.c)
    },
  })
  // One combined update → one commit.
  const fixedRaw = runMeasurement({
    Demo: Split_Fixed,
    metric: 'renders',
    scenario: (api, step) => step(api.apply),
  })
  // Subtract the initial mount render to report renders caused by the update.
  return { before: brokenRaw - 1, after: fixedRaw - 1 }
}

/* ------------------------------------------------------------------ */
/* 3.3 — useCallback stability                                         */
/* ------------------------------------------------------------------ */

const CbChild = memo(function CbChild({
  tracker,
}: {
  onAct: () => number
  tracker: Tracker
}) {
  tracker.bump('identityChanges')
  return null
})

function Cb_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  const [value] = useState(42)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  // A fresh function reference every render → memo child re-renders each time.
  const handler = () => value
  return <CbChild onAct={handler} tracker={tracker} />
}

function Cb_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  const [value] = useState(42)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  // Stable reference while `value` is unchanged → memo child stays put.
  const handler = useCallback(() => value, [value])
  return <CbChild onAct={handler} tracker={tracker} />
}

export function measureUseCallback(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 10; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Cb_Broken, metric: 'identityChanges', scenario: drive }),
    after: runMeasurement({ Demo: Cb_Fixed, metric: 'identityChanges', scenario: drive }),
  }
}
