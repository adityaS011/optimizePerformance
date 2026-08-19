import { useRef } from 'react'

/**
 * Returns how many times the calling component has rendered, counting the
 * current render. Handy for surfacing render churn in the UI.
 */
export function useRenderCount() {
  const renderCount = useRef(0)
  renderCount.current++
  return renderCount.current
}
