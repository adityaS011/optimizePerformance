import { memo, useEffect, useLayoutEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import type { DemoProps, MeasureResult, Tracker } from '@/lib/measure'
import { runMeasurement } from '@/lib/measure'

/* ================================================================== */
/* Widget-specific live measurements for the dashboard.               */
/* Same detached-root harness as the core drills — numbers are real.  */
/* ================================================================== */

/* ---- 6 · Bar chart: memoize each bar ----------------------------- */

interface Bar {
  id: number
  value: number
}
const BARS: Bar[] = Array.from({ length: 40 }, (_, i) => ({ id: i, value: (i * 37) % 100 }))

function BarPlain({ tracker }: { bar: Bar; tracker: Tracker }) {
  tracker.bump('renders')
  return null
}
const BarMemo = memo(BarPlain)

function Chart_Broken({ tracker, register }: DemoProps) {
  const [bars, setBars] = useState(BARS)
  useLayoutEffect(
    () =>
      register({
        update: () =>
          setBars((b) => b.map((x, i) => (i === 3 ? { ...x, value: (x.value + 1) % 100 } : x))),
      }),
    [register],
  )
  return (
    <>
      {bars.map((bar) => (
        <BarPlain key={bar.id} bar={bar} tracker={tracker} />
      ))}
    </>
  )
}

function Chart_Fixed({ tracker, register }: DemoProps) {
  const [bars, setBars] = useState(BARS)
  useLayoutEffect(
    () =>
      register({
        update: () =>
          setBars((b) => b.map((x, i) => (i === 3 ? { ...x, value: (x.value + 1) % 100 } : x))),
      }),
    [register],
  )
  return (
    <>
      {bars.map((bar) => (
        <BarMemo key={bar.id} bar={bar} tracker={tracker} />
      ))}
    </>
  )
}

export function measureChartBars(): MeasureResult {
  const brokenRaw = runMeasurement({
    Demo: Chart_Broken,
    metric: 'renders',
    scenario: (api, step) => step(api.update),
  })
  const fixedRaw = runMeasurement({
    Demo: Chart_Fixed,
    metric: 'renders',
    scenario: (api, step) => step(api.update),
  })
  // Subtract the mount renders (one per bar) to report renders per data change.
  return { before: brokenRaw - BARS.length, after: fixedRaw - BARS.length }
}

/* ---- 9 · Clock: clear the interval on unmount -------------------- */

function makeMockTimers() {
  let count = 0
  return {
    live: () => count,
    set: () => {
      count++
    },
    clear: () => {
      count = Math.max(0, count - 1)
    },
  }
}
type MockTimers = ReturnType<typeof makeMockTimers>

function Clock_Broken({ timers }: { timers: MockTimers }) {
  useEffect(() => {
    timers.set() // setInterval(...) — but never cleared
  }, [timers])
  return null
}

function Clock_Fixed({ timers }: { timers: MockTimers }) {
  useEffect(() => {
    timers.set()
    return () => timers.clear() // clearInterval(...)
  }, [timers])
  return null
}

function mountUnmount(
  Component: (props: { timers: MockTimers }) => JSX.Element | null,
  timers: MockTimers,
  cycles: number,
) {
  for (let i = 0; i < cycles; i++) {
    const container = document.createElement('div')
    const root = createRoot(container)
    flushSync(() => root.render(<Component timers={timers} />))
    flushSync(() => {})
    flushSync(() => root.unmount())
  }
}

export function measureIntervalCleanup(): MeasureResult {
  const CYCLES = 5
  const broken = makeMockTimers()
  mountUnmount(Clock_Broken, broken, CYCLES)
  const fixed = makeMockTimers()
  mountUnmount(Clock_Fixed, fixed, CYCLES)
  return { before: broken.live(), after: fixed.live() }
}

/* ---- 12 · Spinner overlay: memoize the conditional child --------- */

function SpinnerPlain({ tracker }: { tracker: Tracker }) {
  tracker.bump('renders')
  return null
}
const SpinnerMemo = memo(SpinnerPlain)

function Spinner_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <SpinnerPlain tracker={tracker} />
}
function Spinner_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <SpinnerMemo tracker={tracker} />
}

export function measureConditionalMemo(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 30; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Spinner_Broken, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Spinner_Fixed, metric: 'renders', scenario: drive }),
  }
}

/* ---- 13 · Task list: memo + stable key --------------------------- */

interface Task {
  id: number
  done: boolean
}
const TASKS: Task[] = Array.from({ length: 50 }, (_, i) => ({ id: i, done: false }))

function TaskPlain({ tracker }: { task: Task; tracker: Tracker }) {
  tracker.bump('renders')
  return null
}
const TaskMemo = memo(TaskPlain)

function Tasks_Broken({ tracker, register }: DemoProps) {
  const [tasks, setTasks] = useState(TASKS)
  useLayoutEffect(
    () =>
      register({
        toggle: () =>
          setTasks((t) => t.map((x, i) => (i === 7 ? { ...x, done: !x.done } : x))),
      }),
    [register],
  )
  return (
    <>
      {tasks.map((task) => (
        <TaskPlain key={task.id} task={task} tracker={tracker} />
      ))}
    </>
  )
}
function Tasks_Fixed({ tracker, register }: DemoProps) {
  const [tasks, setTasks] = useState(TASKS)
  useLayoutEffect(
    () =>
      register({
        toggle: () =>
          setTasks((t) => t.map((x, i) => (i === 7 ? { ...x, done: !x.done } : x))),
      }),
    [register],
  )
  return (
    <>
      {tasks.map((task) => (
        <TaskMemo key={task.id} task={task} tracker={tracker} />
      ))}
    </>
  )
}

export function measureTaskList(): MeasureResult {
  const brokenRaw = runMeasurement({
    Demo: Tasks_Broken,
    metric: 'renders',
    scenario: (api, step) => step(api.toggle),
  })
  const fixedRaw = runMeasurement({
    Demo: Tasks_Fixed,
    metric: 'renders',
    scenario: (api, step) => step(api.toggle),
  })
  return { before: brokenRaw - TASKS.length, after: fixedRaw - TASKS.length }
}

/* ---- 14 · Revenue counter: keep animation state local ------------ */

function Sibling({ tracker }: { tracker: Tracker }) {
  // Represents the rest of the dashboard re-rendering during the animation.
  tracker.bump('renders')
  return null
}

function Revenue_Broken({ tracker, register }: DemoProps) {
  const [, setFrame] = useState(0)
  useLayoutEffect(() => register({ frame: () => setFrame((f) => f + 1) }), [register])
  // Animation state lives in the parent → every frame re-renders siblings.
  return <Sibling tracker={tracker} />
}

function AnimatedCounter({ register }: { register: DemoProps['register'] }) {
  const [, setFrame] = useState(0)
  useLayoutEffect(() => register({ frame: () => setFrame((f) => f + 1) }), [register])
  return null
}

function Revenue_Fixed({ tracker, register }: DemoProps) {
  // Animation state moved into the counter → siblings are untouched.
  return (
    <>
      <Sibling tracker={tracker} />
      <AnimatedCounter register={register} />
    </>
  )
}

export function measureStateLifting(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 60; i++) step(api.frame)
  }
  // Subtract the mount render → "background renders caused by the animation".
  const brokenRaw = runMeasurement({ Demo: Revenue_Broken, metric: 'renders', scenario: drive })
  const fixedRaw = runMeasurement({ Demo: Revenue_Fixed, metric: 'renders', scenario: drive })
  return { before: brokenRaw - 1, after: fixedRaw - 1 }
}

/* ---- 15 · Breadcrumb: stabilize the inline array ----------------- */

const Crumbs = memo(function Crumbs({
  tracker,
}: {
  items: string[]
  tracker: Tracker
}) {
  tracker.bump('renders')
  return null
})

const STABLE_CRUMBS = ['Home', 'Dashboard', 'Settings']

function Crumb_Broken({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  // New array literal every render → memo child never bails out.
  return <Crumbs items={['Home', 'Dashboard', 'Settings']} tracker={tracker} />
}
function Crumb_Fixed({ tracker, register }: DemoProps) {
  const [, setTick] = useState(0)
  useLayoutEffect(() => register({ update: () => setTick((t) => t + 1) }), [register])
  return <Crumbs items={STABLE_CRUMBS} tracker={tracker} />
}

export function measureInlineArray(): MeasureResult {
  const drive = (api: Record<string, () => void>, step: (fn: () => void) => void) => {
    for (let i = 0; i < 20; i++) step(api.update)
  }
  return {
    before: runMeasurement({ Demo: Crumb_Broken, metric: 'renders', scenario: drive }),
    after: runMeasurement({ Demo: Crumb_Fixed, metric: 'renders', scenario: drive }),
  }
}
