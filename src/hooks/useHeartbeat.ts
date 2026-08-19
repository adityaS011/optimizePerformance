import { useEffect, useReducer } from 'react'

/**
 * A single shared "dashboard heartbeat." Components that subscribe re-render on
 * each tick — which is exactly how an un-optimized widget behaves on a live
 * dashboard. Fixed widgets simply stop subscribing, so they go still. This makes
 * the before/after difference visible on the dashboard itself, for real.
 */

const subscribers = new Set<() => void>()
let tick = 0
let timer: ReturnType<typeof setInterval> | null = null

function ensureTimer() {
  if (timer) return
  timer = setInterval(() => {
    tick++
    subscribers.forEach((notify) => notify())
  }, 900)
}

function maybeStopTimer() {
  if (subscribers.size === 0 && timer) {
    clearInterval(timer)
    timer = null
  }
}

/** Re-renders the caller on every heartbeat while `active` is true. */
export function useHeartbeat(active: boolean) {
  const [, force] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    if (!active) return
    ensureTimer()
    subscribers.add(force)
    return () => {
      subscribers.delete(force)
      maybeStopTimer()
    }
  }, [active])

  return tick
}
