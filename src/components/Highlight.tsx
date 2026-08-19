import { useMemo } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import { cn } from '@/lib/utils'

hljs.registerLanguage('javascript', javascript)

/** Renders read-only, syntax-highlighted JS/JSX. */
export function Highlight({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const html = useMemo(
    () => hljs.highlight(code, { language: 'javascript' }).value,
    [code],
  )
  return (
    <pre className={cn('hljs overflow-x-auto text-[13px] leading-relaxed', className)}>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}
