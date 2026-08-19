import type { Drill, Topic } from './types'
import {
  measureInlineObject,
  measureListKeys,
  measureMissingMemo,
  measureNestedComponent,
} from './demos/rerenders'
import { measureInfiniteLoop, measureMissingDeps } from './demos/useeffect'
import {
  measureStaleClosure,
  measureStateSplits,
  measureUseCallback,
} from './demos/state'
import {
  measureChartBars,
  measureConditionalMemo,
  measureInlineArray,
  measureIntervalCleanup,
  measureStateLifting,
  measureTaskList,
} from './demos/dashboard'

export const TOPICS: Topic[] = [
  {
    id: 'rerenders',
    title: 'Unnecessary Re-renders',
    blurb: 'Understand when and why components re-render — and stop the churn.',
    accent: 'text-sky-400',
  },
  {
    id: 'useeffect',
    title: 'useEffect Issues',
    blurb: 'Master dependency arrays, cleanup, and effect timing.',
    accent: 'text-violet-400',
  },
  {
    id: 'state',
    title: 'State Update Efficiency',
    blurb: 'Tame closures, stale state, and redundant renders.',
    accent: 'text-emerald-400',
  },
]

export const DRILLS: Drill[] = [
  /* ---------------------------------------------------------------- 1 */
  {
    id: 'stats-card',
    topicId: 'rerenders',
    title: 'Missing React.memo',
    description:
      'A stats card re-renders on every dashboard update even though its props never change.',
    difficulty: 'Beginner',
    widget: {
      name: 'Active Users',
      category: 'Unnecessary re-render',
      kind: 'stat',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'The dashboard updates its state and this card re-renders too. Why?',
      options: [
        'It is not wrapped in React.memo, so it re-renders with its parent',
        'It is missing a key prop',
        'A useEffect inside it is firing',
        'React is not batching the state updates',
      ],
      correctAnswer: 0,
      explanation:
        'By default a child re-renders whenever its parent renders, regardless of whether its props changed. Wrapping it in React.memo tells React to skip the re-render when props are shallow-equal.',
    },
    brokenCode: `import { useState } from 'react'

const StatsCard = ({ label, value }) => (
  <div className="card">{label}: {value}</div>
)

function Dashboard() {
  const [tab, setTab] = useState('overview')

  return (
    <>
      <Tabs value={tab} onChange={setTab} />
      <StatsCard label="Active Users" value={1284} />
    </>
  )
}`,
    correctCode: `import { useState, memo } from 'react'

const StatsCard = memo(({ label, value }) => (
  <div className="card">{label}: {value}</div>
))

function Dashboard() {
  const [tab, setTab] = useState('overview')

  return (
    <>
      <Tabs value={tab} onChange={setTab} />
      <StatsCard label="Active Users" value={1284} />
    </>
  )
}`,
    fix: {
      editable: `const StatsCard = ({ label, value }) => (
  <div className="card">{label}: {value}</div>
)`,
      solutions: [
        `const StatsCard = memo(({ label, value }) => (
  <div className="card">{label}: {value}</div>
))`,
        `const StatsCard = React.memo(({ label, value }) => (
  <div className="card">{label}: {value}</div>
))`,
      ],
      hint: 'Wrap the component in memo(...) so React can skip re-rendering it when props are unchanged.',
      successNote: 'The card now bails out of every render where its props are shallow-equal.',
    },
    metric: { type: 'renders', label: 'Card renders', unit: 'renders' },
    keyTakeaway:
      'A parent render always re-renders its children unless you memoize them. React.memo skips the re-render when props are shallow-equal — ideal for pure presentational children.',
    relatedConcepts: ['React.memo', 'referential equality', 'reconciliation'],
    measure: measureMissingMemo,
  },

  /* ---------------------------------------------------------------- 2 */
  {
    id: 'notifications',
    topicId: 'useeffect',
    title: 'Infinite Effect Loop',
    description:
      'A notifications feed updates state inside an effect that depends on that state, looping forever.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Live Notifications',
      category: 'useEffect loop',
      kind: 'list',
      severity: 'high',
      span: 1,
    },
    mcq: {
      question: 'What causes the notifications effect to run endlessly?',
      options: [
        'The effect updates `count`, which is in its own dependency array',
        'There is no dependency array',
        'It is missing a cleanup function',
        'The list is missing React.memo',
      ],
      correctAnswer: 0,
      explanation:
        'Setting a state value that also sits in the dependency array creates a cycle: run → setState → re-render → deps changed → run again. Remove the self-dependency or restructure so the effect does not write the state it watches.',
    },
    brokenCode: `function Notifications() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(count + 1)
  }, [count])

  return <Feed unread={count} />
}`,
    correctCode: `function Notifications() {
  const [count, setCount] = useState(0)

  // Run once on mount; no self-dependency, no loop.
  useEffect(() => {
    setCount(count + 1)
  }, [])

  return <Feed unread={count} />
}`,
    fix: {
      editable: `  }, [count])`,
      solutions: [`}, [])`],
      hint: 'Remove count from the dependency array so updating it no longer re-triggers the effect: `}, [])`.',
      successNote: 'Without count in the deps, the effect runs once and never re-triggers itself.',
    },
    metric: { type: 'effects', label: 'Effect runs (capped)', unit: 'runs' },
    keyTakeaway:
      'If an effect writes state that is also in its dependency array, it will loop. Break the cycle: drop the dependency, use a functional updater with the right deps, or move the write out of the effect.',
    relatedConcepts: ['dependency array', 'setState in effect', 'render loop'],
    measure: measureInfiniteLoop,
  },

  /* ---------------------------------------------------------------- 3 */
  {
    id: 'search',
    topicId: 'state',
    title: 'Unstable Callback Prop',
    description:
      'A memoized suggestions dropdown re-renders on every keystroke because the handler is a new function each render.',
    difficulty: 'Advanced',
    widget: {
      name: 'Search',
      category: 'Unstable prop',
      kind: 'search',
      severity: 'high',
      span: 2,
    },
    mcq: {
      question: 'Suggestions is memoized but re-renders on every keystroke. Why?',
      options: [
        'onSearch is a new function reference each render, breaking memo',
        'Suggestions is missing a key',
        'There is no cleanup function',
        'A dependency is missing from a useEffect',
      ],
      correctAnswer: 0,
      explanation:
        'Defining handleSearch in render creates a new function every time, so the memoized Suggestions always sees a changed prop. Wrap it in useCallback with the values it uses ([query]) to keep the reference stable between renders.',
    },
    brokenCode: `function Search() {
  const [query, setQuery] = useState('')

  const handleSearch = () => search(query)

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suggestions onSearch={handleSearch} />
    </>
  )
}`,
    correctCode: `function Search() {
  const [query, setQuery] = useState('')

  const handleSearch = useCallback(() => search(query), [query])

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suggestions onSearch={handleSearch} />
    </>
  )
}`,
    fix: {
      editable: `const handleSearch = () => search(query)`,
      solutions: [`const handleSearch = useCallback(() => search(query), [query])`],
      hint: 'Wrap the handler in useCallback(() => search(query), [query]) to keep its reference stable.',
      successNote:
        'handleSearch keeps the same reference while query is unchanged, so Suggestions stops re-rendering.',
    },
    metric: { type: 'identityChanges', label: 'Dropdown renders', unit: 'renders' },
    keyTakeaway:
      'useCallback stabilizes a function’s identity so memoized children can bail out. Reach for it when the function is passed to a memoized child or used in another hook’s deps — and always list the correct dependencies.',
    relatedConcepts: ['useCallback', 'referential equality', 'React.memo'],
    measure: measureUseCallback,
  },

  /* ---------------------------------------------------------------- 4 */
  {
    id: 'filters',
    topicId: 'state',
    title: 'Related State Split Apart',
    description:
      'Three filter values live in three states and update separately, causing extra renders per action.',
    difficulty: 'Beginner',
    widget: {
      name: 'Filters',
      category: 'State efficiency',
      kind: 'filter',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'These filter values always change together. What is the cleanest fix?',
      options: [
        'Combine them into one state object updated in a single call',
        'Wrap the handler in useCallback',
        'Wrap each value in useMemo',
        'Add React.memo to the component',
      ],
      correctAnswer: 0,
      explanation:
        'Values that always update together belong in one state unit. A single setState is one update; when the updates arrive in separate ticks (async callbacks, subscriptions), three setStates mean three renders. React batches synchronous handlers, but combining state is clearer and robust everywhere.',
    },
    brokenCode: `function Filters() {
  const [status, setStatus] = useState('all')
  const [region, setRegion] = useState('all')
  const [plan, setPlan] = useState('all')

  function applyPreset(preset) {
    setStatus(preset.status)
    setRegion(preset.region)
    setPlan(preset.plan)
  }
}`,
    correctCode: `function Filters() {
  const [filters, setFilters] = useState({ status: 'all', region: 'all', plan: 'all' })

  function applyPreset(preset) {
    setFilters({ status: preset.status, region: preset.region, plan: preset.plan })
  }
}`,
    fix: {
      editable: `    setStatus(preset.status)
    setRegion(preset.region)
    setPlan(preset.plan)`,
      solutions: [
        `setFilters({ status: preset.status, region: preset.region, plan: preset.plan })`,
      ],
      hint: 'Replace the three setters with a single setFilters({ ... }) call (state is combined in the fixed code).',
      successNote: 'One combined update means one render, no matter where the update comes from.',
    },
    metric: { type: 'renders', label: 'Renders per action', unit: 'renders' },
    keyTakeaway:
      'Group state that changes together. It reduces renders in async/un-batched contexts and keeps updates atomic and readable. Reach for useReducer when the transitions get complex.',
    relatedConcepts: ['state modeling', 'automatic batching', 'useReducer'],
    measure: measureStateSplits,
  },

  /* ---------------------------------------------------------------- 5 */
  {
    id: 'theme-toggle',
    topicId: 'state',
    title: 'Stale Closure in useEffect',
    description:
      'A keyboard shortcut set up once captures the initial state and keeps reading the stale value.',
    difficulty: 'Advanced',
    widget: {
      name: 'Theme Toggle',
      category: 'Stale closure',
      kind: 'toggle',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'The shortcut handler always logs the original value. Why?',
      options: [
        'The effect ran once with empty deps, capturing the value from the first render',
        'The component is missing React.memo',
        'There is no cleanup function',
        'React is not batching updates',
      ],
      correctAnswer: 0,
      explanation:
        'With [] the effect runs once and the onKey closure captures the value from that first render. It never sees later values. Add the value to the deps so the effect re-subscribes with a fresh closure whenever it changes.',
    },
    brokenCode: `function ThemeToggle({ theme }) {
  useEffect(() => {
    const onKey = () => console.log('theme is', theme)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}`,
    correctCode: `function ThemeToggle({ theme }) {
  useEffect(() => {
    const onKey = () => console.log('theme is', theme)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theme])

  return null
}`,
    fix: {
      editable: `  }, [])`,
      solutions: [`}, [theme])`],
      hint: 'Add theme to the dependency array so the effect re-subscribes with the latest value: `}, [theme])`.',
      successNote:
        'The effect now re-runs on each change, so the handler always reads the current value.',
    },
    metric: { type: 'staleReads', label: 'Stale reads', unit: 'stale reads' },
    keyTakeaway:
      'Closures capture values from the render that created them. An effect with missing deps keeps stale variables. List every value the effect reads (or use a ref for values you deliberately want to read live).',
    relatedConcepts: ['closures', 'dependency array', 'useRef'],
    measure: measureStaleClosure,
  },

  /* ---------------------------------------------------------------- 6 */
  {
    id: 'chart',
    topicId: 'rerenders',
    title: 'Whole Chart Re-renders',
    description:
      'Changing one data point re-renders every bar because the bars are not memoized.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Traffic by Source',
      category: 'Composition',
      kind: 'chart',
      severity: 'high',
      span: 2,
    },
    mcq: {
      question: 'One data point changes, yet all 40 bars re-render. What is the fix?',
      options: [
        'Memoize each Bar so only the bar whose data changed re-renders',
        'Give the chart a key',
        'Wrap the chart in a useEffect',
        'Combine the bars into one state',
      ],
      correctAnswer: 0,
      explanation:
        'The parent re-renders on any data change and, without memo, recreates every Bar. Wrapping Bar in React.memo lets React skip the bars whose data prop is unchanged, so only the single changed bar re-renders.',
    },
    brokenCode: `const Bar = ({ bar }) => (
  <rect height={bar.value} />
)

function Chart({ bars }) {
  return bars.map((bar) => <Bar key={bar.id} bar={bar} />)
}`,
    correctCode: `const Bar = memo(({ bar }) => (
  <rect height={bar.value} />
))

function Chart({ bars }) {
  return bars.map((bar) => <Bar key={bar.id} bar={bar} />)
}`,
    fix: {
      editable: `const Bar = ({ bar }) => (
  <rect height={bar.value} />
)`,
      solutions: [
        `const Bar = memo(({ bar }) => (
  <rect height={bar.value} />
))`,
        `const Bar = React.memo(({ bar }) => (
  <rect height={bar.value} />
))`,
      ],
      hint: 'Wrap Bar in memo(...) so bars whose data object is unchanged skip the re-render.',
      successNote:
        'Only the bar whose data object changed re-renders; the other 39 bail out of the update.',
    },
    metric: { type: 'renders', label: 'Bar renders per update', unit: 'renders' },
    keyTakeaway:
      'Break big views into memoized leaf components. When one item changes, memo lets React re-render only that item instead of the entire collection — the core of scalable list/chart performance.',
    relatedConcepts: ['React.memo', 'component composition', 'list rendering'],
    measure: measureChartBars,
  },

  /* ---------------------------------------------------------------- 7 */
  {
    id: 'user-table',
    topicId: 'rerenders',
    title: 'Index as List Key',
    description:
      'Sorting the user table re-renders every row because rows are keyed by array index.',
    difficulty: 'Beginner',
    widget: {
      name: 'Users',
      category: 'List anti-pattern',
      kind: 'table',
      severity: 'high',
      span: 2,
    },
    mcq: {
      question: 'Rows are memoized, yet they all re-render when the table is sorted. Why?',
      options: [
        'key={index} ties identity to position, so reordering swaps every row’s data',
        'The rows are missing React.memo',
        'A useEffect is looping',
        'The state shape is wrong',
      ],
      correctAnswer: 0,
      explanation:
        'With key={index}, the row at position 0 is always “key 0.” Reordering keeps the keys fixed but hands each position a different item, so every memoized row sees new props. A stable key={user.id} lets React move rows instead of rebuilding them.',
    },
    brokenCode: `function UserTable({ users }) {
  return (
    <tbody>
      {users.map((user, index) => (
        <UserRow key={index} user={user} />
      ))}
    </tbody>
  )
}`,
    correctCode: `function UserTable({ users }) {
  return (
    <tbody>
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </tbody>
  )
}`,
    fix: {
      editable: `      {users.map((user, index) => (
        <UserRow key={index} user={user} />
      ))}`,
      solutions: [
        `{users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}`,
        `{users.map((user, index) => (
        <UserRow key={user.id} user={user} />
      ))}`,
      ],
      hint: 'Key each row by its stable identity (user.id) instead of its array index.',
      successNote:
        'Rows keyed by id keep their identity across reorders, so React moves them instead of re-rendering.',
    },
    metric: { type: 'renders', label: 'Row renders on sort', unit: 'renders' },
    keyTakeaway:
      'Keys are identity, not just a warning silencer. Index keys make reordering, insertion, and deletion re-render (and remount) rows. Use a stable, data-derived id.',
    relatedConcepts: ['list keys', 'reconciliation', 'React.memo'],
    measure: measureListKeys,
  },

  /* ---------------------------------------------------------------- 8 */
  {
    id: 'settings',
    topicId: 'rerenders',
    title: 'Component Defined in Render',
    description:
      'Toggling the settings panel remounts its whole subtree because a component is defined inside render.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Settings',
      category: 'Composition',
      kind: 'settings',
      severity: 'high',
      span: 1,
    },
    mcq: {
      question: 'Field is defined inside Settings. What is the anti-pattern?',
      options: [
        'A component defined in render is a new type each render, so React remounts it',
        'Field is missing React.memo',
        'A useEffect is looping',
        'Field needs a key',
      ],
      correctAnswer: 0,
      explanation:
        'Each render creates a brand-new Field function. React compares component types by reference, sees a different type, and unmounts the old subtree and mounts a new one — throwing away DOM and state. Define components at module scope.',
    },
    brokenCode: `function Settings() {
  const [open, setOpen] = useState(true)

  const Field = ({ label }) => <label>{label}</label>

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      <Field label="Email" />
    </div>
  )
}`,
    correctCode: `const Field = ({ label }) => <label>{label}</label>

function Settings() {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      <Field label="Email" />
    </div>
  )
}`,
    fix: {
      editable: `const Field = ({ label }) => <label>{label}</label>`,
      solutions: [`const Field = HoistedField`],
      hint: 'Move the definition to module scope (see the fixed code) and reference it here: `const Field = HoistedField`.',
      successNote: 'With a stable component type, React keeps the subtree mounted across renders.',
    },
    metric: { type: 'renders', label: 'Subtree mounts', unit: 'mounts' },
    keyTakeaway:
      'Never declare a component inside another component’s render. The identity changes every render, forcing a full unmount/remount that discards DOM, state, and effects. Hoist it to module scope.',
    relatedConcepts: ['component identity', 'remounting', 'reconciliation'],
    measure: measureNestedComponent,
  },

  /* ---------------------------------------------------------------- 9 */
  {
    id: 'clock',
    topicId: 'useeffect',
    title: 'Missing Interval Cleanup',
    description:
      'The clock starts a new interval on every mount but never clears it, leaking timers.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Server Time',
      category: 'Memory leak',
      kind: 'clock',
      severity: 'high',
      span: 1,
    },
    mcq: {
      question: 'After mounting the clock a few times, timers pile up. What is the leak?',
      options: [
        'The effect starts an interval but never returns a cleanup to clear it',
        'A dependency is missing',
        'The component needs React.memo',
        'React is not batching updates',
      ],
      correctAnswer: 0,
      explanation:
        'Without a cleanup, every mount calls setInterval again and the old interval keeps running. After N mounts you have N intervals firing. Return a function that calls clearInterval so each mount is balanced by its unmount.',
    },
    brokenCode: `function Clock() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
  }, [])

  return <time>{format(now)}</time>
}`,
    correctCode: `function Clock() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return <time>{format(now)}</time>
}`,
    fix: {
      editable: `    const id = setInterval(() => setNow(Date.now()), 1000)`,
      solutions: [
        `const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)`,
      ],
      hint: 'Return a cleanup that calls clearInterval(id) so the timer stops when the component unmounts.',
      successNote: 'Each mount now clears its interval on unmount, so timers never accumulate.',
    },
    metric: { type: 'listeners', label: 'Leaked intervals', unit: 'intervals' },
    keyTakeaway:
      'Anything an effect starts — intervals, timeouts, listeners, subscriptions — it must stop in a returned cleanup. React runs cleanup before re-running the effect and on unmount, keeping resources balanced.',
    relatedConcepts: ['cleanup function', 'memory leak', 'setInterval'],
    measure: measureIntervalCleanup,
  },

  /* ---------------------------------------------------------------- 10 */
  {
    id: 'status-badge',
    topicId: 'rerenders',
    title: 'Inline Object Prop',
    description:
      'A memoized status badge still re-renders because it receives a new object literal every render.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Status',
      category: 'Unstable prop',
      kind: 'badge',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'Badge is wrapped in React.memo but still re-renders. Why doesn’t memo help?',
      options: [
        'A new style object is created every render, so the prop is never equal',
        'Badge is missing a key',
        'React is not batching updates',
        'A useEffect is firing',
      ],
      correctAnswer: 0,
      explanation:
        'React.memo does a shallow (reference) comparison. `{ color: "green" }` is a new object on every render, so prevProps.style !== nextProps.style and memo can never bail out. Memoize the object with useMemo (or hoist it) to keep the reference stable.',
    },
    brokenCode: `function ServerStatus() {
  const [tick, setTick] = useState(0)

  const style = { color: 'green' }

  return (
    <>
      <button onClick={() => setTick(tick + 1)}>Refresh</button>
      <Badge style={style} label="Online" />
    </>
  )
}`,
    correctCode: `function ServerStatus() {
  const [tick, setTick] = useState(0)

  const style = useMemo(() => ({ color: 'green' }), [])

  return (
    <>
      <button onClick={() => setTick(tick + 1)}>Refresh</button>
      <Badge style={style} label="Online" />
    </>
  )
}`,
    fix: {
      editable: `const style = { color: 'green' }`,
      solutions: [
        `const style = useMemo(() => ({ color: 'green' }), [])`,
        `const style = useMemo(() => ({ color: 'green' }))`,
      ],
      hint: 'Wrap the object in useMemo(() => ({ ... }), []) so its reference stays stable across renders.',
      successNote: 'style now keeps the same reference each render, so Badge’s memo comparison passes.',
    },
    metric: { type: 'renders', label: 'Badge renders', unit: 'renders' },
    keyTakeaway:
      'Objects, arrays, and functions created in render are new references each time. Passing them to a memoized child defeats the memo. Stabilize them with useMemo/useCallback or hoist constants out.',
    relatedConcepts: ['useMemo', 'referential equality', 'React.memo'],
    measure: measureInlineObject,
  },

  /* ---------------------------------------------------------------- 11 */
  {
    id: 'region-menu',
    topicId: 'useeffect',
    title: 'Missing Dependency Array',
    description:
      'A dropdown re-syncs on every render — even unrelated ones — because its effect has no dependency array.',
    difficulty: 'Beginner',
    widget: {
      name: 'Region',
      category: 'useEffect timing',
      kind: 'menu',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'Why does this effect re-fetch options on every single render?',
      options: [
        'It has no dependency array, so it runs after every render',
        'It is missing a cleanup function',
        'The menu is missing React.memo',
        'React is not batching updates',
      ],
      correctAnswer: 0,
      explanation:
        'With no dependency array, an effect runs after every render. Passing [region] tells React to re-run it only when region changes, so unrelated re-renders no longer trigger a re-fetch.',
    },
    brokenCode: `function RegionMenu({ region }) {
  const [options, setOptions] = useState([])

  useEffect(() => {
    fetchOptions(region).then(setOptions)
  })

  return <Dropdown options={options} />
}`,
    correctCode: `function RegionMenu({ region }) {
  const [options, setOptions] = useState([])

  useEffect(() => {
    fetchOptions(region).then(setOptions)
  }, [region])

  return <Dropdown options={options} />
}`,
    fix: {
      editable: `  useEffect(() => {
    fetchOptions(region).then(setOptions)
  })`,
      solutions: [
        `useEffect(() => {
    fetchOptions(region).then(setOptions)
  }, [region])`,
      ],
      hint: 'Add a dependency array so the effect only re-runs when region changes: `}, [region])`.',
      successNote: 'The effect now fires only when region changes — not on every unrelated render.',
    },
    metric: { type: 'effects', label: 'Effect runs', unit: 'runs' },
    keyTakeaway:
      'No dependency array means “run after every render.” Add the array and list every value the effect reads. Let the exhaustive-deps lint rule guide you.',
    relatedConcepts: ['dependency array', 'effect timing', 'exhaustive-deps'],
    measure: measureMissingDeps,
  },

  /* ---------------------------------------------------------------- 12 */
  {
    id: 'sync-spinner',
    topicId: 'rerenders',
    title: 'Unmemoized Conditional Child',
    description:
      'A loading spinner re-renders on every parent update during a sync, making it flicker.',
    difficulty: 'Beginner',
    widget: {
      name: 'Sync Status',
      category: 'Unnecessary re-render',
      kind: 'spinner',
      severity: 'medium',
      span: 1,
    },
    mcq: {
      question: 'The spinner flickers because it re-renders repeatedly during the sync. Why?',
      options: [
        'It is not memoized, so it re-renders on every parent update',
        'It is missing a key',
        'A useEffect is looping',
        'React is not batching updates',
      ],
      correctAnswer: 0,
      explanation:
        'While the sync progresses the parent re-renders many times, and an unmemoized spinner re-renders with it every time. Wrapping the spinner in React.memo keeps it stable since its props never change.',
    },
    brokenCode: `const Spinner = () => <div className="spinner" />

function SyncPanel() {
  const [progress, setProgress] = useState(0)

  return (
    <>
      <ProgressBar value={progress} />
      {progress < 100 && <Spinner />}
    </>
  )
}`,
    correctCode: `const Spinner = memo(() => <div className="spinner" />)

function SyncPanel() {
  const [progress, setProgress] = useState(0)

  return (
    <>
      <ProgressBar value={progress} />
      {progress < 100 && <Spinner />}
    </>
  )
}`,
    fix: {
      editable: `const Spinner = () => <div className="spinner" />`,
      solutions: [
        `const Spinner = memo(() => <div className="spinner" />)`,
        `const Spinner = React.memo(() => <div className="spinner" />)`,
      ],
      hint: 'Wrap the spinner in memo(...) so it stays stable while the parent re-renders.',
      successNote: 'The spinner renders once and stops flickering during the sync.',
    },
    metric: { type: 'renders', label: 'Spinner renders', unit: 'renders' },
    keyTakeaway:
      'Even tiny presentational components re-render with their parent unless memoized. If a component’s props never change, React.memo keeps it perfectly stable.',
    relatedConcepts: ['React.memo', 'conditional rendering', 'reconciliation'],
    measure: measureConditionalMemo,
  },

  /* ---------------------------------------------------------------- 13 */
  {
    id: 'tasks',
    topicId: 'rerenders',
    title: 'Whole List Re-renders',
    description:
      'Toggling one task re-renders all 50 task cards because the items are not memoized.',
    difficulty: 'Intermediate',
    widget: {
      name: 'Tasks',
      category: 'List performance',
      kind: 'tasks',
      severity: 'high',
      span: 2,
    },
    mcq: {
      question: 'Toggling one task re-renders all 50 items. What fixes it?',
      options: [
        'Memoize the item so only the toggled task re-renders',
        'Remove the key prop',
        'Wrap the list in a useEffect',
        'Combine all tasks into one state field',
      ],
      correctAnswer: 0,
      explanation:
        'The list re-renders on any change and recreates every item. Wrapping the item in React.memo (with a stable key) lets React skip items whose task object is unchanged, so only the toggled task re-renders.',
    },
    brokenCode: `const TaskItem = ({ task }) => (
  <li>{task.title}</li>
)

function TaskList({ tasks }) {
  return tasks.map((task) => <TaskItem key={task.id} task={task} />)
}`,
    correctCode: `const TaskItem = memo(({ task }) => (
  <li>{task.title}</li>
))

function TaskList({ tasks }) {
  return tasks.map((task) => <TaskItem key={task.id} task={task} />)
}`,
    fix: {
      editable: `const TaskItem = ({ task }) => (
  <li>{task.title}</li>
)`,
      solutions: [
        `const TaskItem = memo(({ task }) => (
  <li>{task.title}</li>
))`,
        `const TaskItem = React.memo(({ task }) => (
  <li>{task.title}</li>
))`,
      ],
      hint: 'Wrap TaskItem in memo(...) so items whose task object is unchanged skip the re-render.',
      successNote: 'Only the toggled task re-renders; the other 49 items bail out of the update.',
    },
    metric: { type: 'renders', label: 'Item renders per toggle', unit: 'renders' },
    keyTakeaway:
      'For long lists, memoize the row component and pass stable keys and props. React then re-renders only the rows that actually changed instead of the whole list.',
    relatedConcepts: ['React.memo', 'list keys', 'list performance'],
    measure: measureTaskList,
  },

  /* ---------------------------------------------------------------- 14 */
  {
    id: 'revenue',
    topicId: 'state',
    title: 'Animation State Lifted Too High',
    description:
      'A revenue counter animates in the parent, re-rendering the whole dashboard 60 times per animation.',
    difficulty: 'Advanced',
    widget: {
      name: 'Revenue',
      category: 'State placement',
      kind: 'revenue',
      severity: 'high',
      span: 1,
    },
    mcq: {
      question: 'The animation re-renders the entire dashboard. What is the fix?',
      options: [
        'Move the animation state into the counter component that uses it',
        'Wrap the counter in useCallback',
        'Add a key to the counter',
        'Add a cleanup function',
      ],
      correctAnswer: 0,
      explanation:
        'The animation frame state lives in the parent, so every frame re-renders the parent and all its siblings. Moving that state down into the counter component confines the frequent re-renders to the counter alone.',
    },
    brokenCode: `function Dashboard() {
  const [frame, setFrame] = useState(0) // animation lives here

  useAnimationFrame(() => setFrame((f) => f + 1))

  return (
    <>
      <RevenueCounter frame={frame} />
      <RestOfDashboard />
    </>
  )
}`,
    correctCode: `function Dashboard() {
  return (
    <>
      <RevenueCounter /> {/* owns its own frame state */}
      <RestOfDashboard />
    </>
  )
}

function RevenueCounter() {
  const [frame, setFrame] = useState(0)
  useAnimationFrame(() => setFrame((f) => f + 1))
  return <span>{frame}</span>
}`,
    fix: {
      editable: `  const [frame, setFrame] = useState(0) // animation lives here

  useAnimationFrame(() => setFrame((f) => f + 1))

  return (
    <>
      <RevenueCounter frame={frame} />
      <RestOfDashboard />
    </>
  )`,
      solutions: [
        `return (
    <>
      <RevenueCounter />
      <RestOfDashboard />
    </>
  )`,
      ],
      hint: 'Delete the parent’s frame state and let RevenueCounter own it (shown in the fixed code), so only the counter re-renders.',
      successNote:
        'The animation is confined to the counter — the rest of the dashboard renders zero extra times.',
    },
    metric: { type: 'renders', label: 'Background renders', unit: 'renders' },
    keyTakeaway:
      'Keep frequently-changing state as low as it can go. State high in the tree re-renders everything below it; colocating it with the component that uses it contains the churn.',
    relatedConcepts: ['state colocation', 'lifting state', 'render scope'],
    measure: measureStateLifting,
  },

  /* ---------------------------------------------------------------- 15 */
  {
    id: 'breadcrumb',
    topicId: 'rerenders',
    title: 'Inline Array Prop',
    description:
      'A memoized breadcrumb re-renders every time because it receives a new array literal each render.',
    difficulty: 'Beginner',
    widget: {
      name: 'Navigation',
      category: 'Unstable prop',
      kind: 'breadcrumb',
      severity: 'medium',
      span: 2,
    },
    mcq: {
      question: 'Breadcrumb is memoized but re-renders on every parent update. Why?',
      options: [
        'A new array is created inline every render, so the prop is never equal',
        'Breadcrumb is missing a key',
        'A useEffect is looping',
        'React is not batching updates',
      ],
      correctAnswer: 0,
      explanation:
        'React.memo compares props by reference. `["Home", "Dashboard", "Settings"]` is a new array on every render, so the memoized Breadcrumb always sees a changed prop. Hoist the array or wrap it in useMemo to keep the reference stable.',
    },
    brokenCode: `function Header() {
  const [tick, setTick] = useState(0)

  return (
    <Breadcrumb items={['Home', 'Dashboard', 'Settings']} />
  )
}`,
    correctCode: `const CRUMBS = ['Home', 'Dashboard', 'Settings']

function Header() {
  const [tick, setTick] = useState(0)

  return <Breadcrumb items={CRUMBS} />
}`,
    fix: {
      editable: `<Breadcrumb items={['Home', 'Dashboard', 'Settings']} />`,
      solutions: [
        `<Breadcrumb items={CRUMBS} />`,
        `<Breadcrumb items={useMemo(() => ['Home', 'Dashboard', 'Settings'], [])} />`,
      ],
      hint: 'Hoist the array to a module constant (CRUMBS in the fixed code) and pass it: `<Breadcrumb items={CRUMBS} />`.',
      successNote: 'items now keeps the same reference each render, so Breadcrumb’s memo passes.',
    },
    metric: { type: 'renders', label: 'Breadcrumb renders', unit: 'renders' },
    keyTakeaway:
      'Array literals in JSX are new references each render, just like objects. Hoist static arrays to module scope, or memoize dynamic ones, before passing them to memoized children.',
    relatedConcepts: ['useMemo', 'referential equality', 'React.memo'],
    measure: measureInlineArray,
  },
]

export function getDrill(id: string) {
  return DRILLS.find((d) => d.id === id)
}

export function drillsByTopic(topicId: string) {
  return DRILLS.filter((d) => d.topicId === topicId)
}
