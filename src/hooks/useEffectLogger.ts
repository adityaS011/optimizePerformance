import { useEffect, useRef } from 'react'

/**
 * Counts (and optionally logs) how many times an effect has run for the calling
 * component. Useful for demonstrating runaway or missing-dependency effects.
 */
export function useEffectLogger(name: string, deps?: unknown[]) {
  const callCount = useRef(0)
  useEffect(() => {
    callCount.current++
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[effect] ${name} ran ${callCount.current}x`)
    }
    // The deps are intentionally forwarded from the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return callCount.current
}
