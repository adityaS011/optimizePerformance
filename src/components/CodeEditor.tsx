import { useMemo, useState } from 'react'
import { Check, Lightbulb, RotateCcw, X } from 'lucide-react'
import type { FixSpec } from '@/data/types'
import { Highlight } from './Highlight'
import { Button, Badge } from './ui'
import { cn } from '@/lib/utils'

/** Whitespace-insensitive comparison so formatting differences are forgiven. */
function normalize(s: string) {
  return s.replace(/\s+/g, '').trim()
}

interface CodeEditorProps {
  brokenCode: string
  correctCode: string
  fix: FixSpec
  solved: boolean
  onSolved: () => void
}

export function CodeEditor({
  brokenCode,
  correctCode,
  fix,
  solved,
  onSolved,
}: CodeEditorProps) {
  const idx = brokenCode.indexOf(fix.editable)
  const before = idx >= 0 ? brokenCode.slice(0, idx) : brokenCode
  const after = idx >= 0 ? brokenCode.slice(idx + fix.editable.length) : ''

  const [value, setValue] = useState(fix.editable)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [showHint, setShowHint] = useState(false)

  const rows = useMemo(() => value.split('\n').length, [value])

  function check() {
    const ok = fix.solutions.some((sol) => normalize(sol) === normalize(value))
    if (ok) {
      setStatus('correct')
      onSolved()
    } else {
      setStatus('wrong')
    }
  }

  function reset() {
    setValue(fix.editable)
    setStatus('idle')
  }

  // Once solved, show the full corrected file.
  if (solved && status !== 'wrong') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-success">
          <Check className="h-4 w-4" />
          <span className="font-medium">Fixed</span>
          <span className="text-muted">— {fix.successNote}</span>
        </div>
        <div className="rounded-lg border border-success/30 bg-[#0b1220] p-4">
          <Highlight code={correctCode} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Edit the highlighted line to fix the performance issue, then run the check.
      </p>

      <div className="overflow-hidden rounded-lg border border-border bg-[#0b1220]">
        {before.trim() && (
          <div className="px-4 pt-4">
            <Highlight code={before.replace(/\n+$/, '')} />
          </div>
        )}

        <div className="px-4 py-2">
          <div
            className={cn(
              'rounded-md border-l-2 bg-surface2/40 transition-colors',
              status === 'correct'
                ? 'border-success'
                : status === 'wrong'
                  ? 'border-danger'
                  : 'border-amber-400',
            )}
          >
            <textarea
              value={value}
              spellCheck={false}
              onChange={(e) => {
                setValue(e.target.value)
                if (status !== 'idle') setStatus('idle')
              }}
              rows={rows}
              className={cn(
                'w-full resize-none bg-transparent px-3 py-2 font-mono text-[13px]',
                'leading-relaxed text-emerald-200 outline-none',
                'focus:ring-1 focus:ring-primary/40',
              )}
            />
          </div>
        </div>

        {after.trim() && (
          <div className="px-4 pb-4">
            <Highlight code={after.replace(/^\n+/, '')} />
          </div>
        )}
      </div>

      {status === 'wrong' && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200 animate-fade-in">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Not quite. Check your syntax, or reveal a hint below.</span>
        </div>
      )}

      {showHint && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 animate-fade-in">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{fix.hint}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={check} variant={status === 'correct' ? 'success' : 'primary'}>
          {status === 'correct' ? (
            <>
              <Check className="h-4 w-4" /> Correct!
            </>
          ) : (
            'Run check'
          )}
        </Button>
        <Button variant="secondary" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button variant="ghost" onClick={() => setShowHint((h) => !h)}>
          <Lightbulb className="h-4 w-4" /> {showHint ? 'Hide hint' : 'Hint'}
        </Button>
        {status === 'correct' && (
          <Badge tone="green" className="ml-auto">
            <Check className="h-3 w-3" /> Fix applied
          </Badge>
        )}
      </div>
    </div>
  )
}
