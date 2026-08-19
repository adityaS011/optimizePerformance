import { memo, useLayoutEffect, useState } from 'react'
import type { DemoProps, MeasureResult, Tracker } from '@/lib/measure'
import { runMeasurement } from '@/lib/measure'

/* ------------------------------------------------------------------ */
/* 1.1 — Missing React.memo                                            */
/* ------------------------------------------------------------------ */

function ChildPlain({ tracker }: { label: string; tracker: Tracker }) {
  tracker.bump('renders')
  return null
}
const ChildMemo = memo(ChildPlain)

function Memo_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <ChildPlain label="static" tracker={tracker} />
}

function Memo_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <ChildMemo label="static" tracker={tracker} />
}

export function measureMissingMemo(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 20; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Memo_Broken, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Memo_Fixed, metric: 'renders', scenario: drive }),
  }
}

/* ------------------------------------------------------------------ */
/* 1.2 — Keys in lists (key={index} vs key={item.id})                 */
/* ------------------------------------------------------------------ */

interface Row {
  id: number
  value: string
}

const RowItem = memo(function RowItem({ tracker }: { row: Row; tracker: Tracker }) {
  tracker.bump('renders')
  return null
})

const START_ROWS: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  value: `Row ${i}`,
}))

function Keys_Index({ tracker, register }: DemoProps) {
  const [rows, setRows] = useState(START_ROWS)
  useLayoutEffect(
    () => register({ sort: () => setRows((r) => [...r].reverse()) }),
    [register],
  )
  return (
    <>
      {rows.map((row, index) => (
        <RowItem key={index} row={row} tracker={tracker} />
      ))}
    </>
  )
}

function Keys_Id({ tracker, register }: DemoProps) {
  const [rows, setRows] = useState(START_ROWS)
  useLayoutEffect(
    () => register({ sort: () => setRows((r) => [...r].reverse()) }),
    [register],
  )
  return (
    <>
      {rows.map((row) => (
        <RowItem key={row.id} row={row} tracker={tracker} />
      ))}
    </>
  )
}

export function measureListKeys(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 3; i++) step(api.sort)
  }
  return {
    before: runMeasurement({ Demo: Keys_Index, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Keys_Id, metric: 'renders', scenario: drive }),
  }
}

/* ------------------------------------------------------------------ */
/* 1.3 — Inline object as prop                                         */
/* ------------------------------------------------------------------ */

const OptChild = memo(function OptChild({
  tracker,
}: {
  options: { a: number; b: number }
  tracker: Tracker
}) {
  tracker.bump('renders')
  return null
})

const STABLE_OPTIONS = { a: 1, b: 2 }

function Inline_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  // New object literal on every render → memo can never bail out.
  return <OptChild options={{ a: 1, b: 2 }} tracker={tracker} />
}

function Inline_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <OptChild options={STABLE_OPTIONS} tracker={tracker} />
}

export function measureInlineObject(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 15; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Inline_Broken, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Inline_Fixed, metric: 'renders', scenario: drive }),
  }
}

/* ------------------------------------------------------------------ */
/* 1.4 — Component defined inside render → remounts                    */
/* ------------------------------------------------------------------ */

function Mounted({ tracker }: { tracker: Tracker }) {
  // Bumps once per *mount* — the exact cost of an unstable component type.
  useLayoutEffect(() => {
    tracker.bump('renders')
  }, [tracker])
  return null
}

function Nested_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  // A brand-new component *type* every render → React remounts the subtree.
  const Inner = () => <Mounted tracker={tracker} />
  return <Inner />
}

const StableInner = ({ tracker }: { tracker: Tracker }) => <Mounted tracker={tracker} />

function Nested_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <StableInner tracker={tracker} />
}

export function measureNestedComponent(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 30; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Nested_Broken, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Nested_Fixed, metric: 'renders', scenario: drive }),
  }
}
