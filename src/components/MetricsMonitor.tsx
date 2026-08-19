import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, Activity, Lock, RefreshCw, TrendingDown } from 'lucide-react'
import type { Drill } from '@/data/types'
import { improvementPct } from '@/lib/utils'
import { Badge, Button } from './ui'
import { cn } from '@/lib/utils'

interface MetricsMonitorProps {
  drill: Drill
  solved: boolean
}

export function MetricsMonitor({ drill, solved }: MetricsMonitorProps) {
  const [result, setResult] = useState<{ before: number; after: number } | null>(null)
  const [running, setRunning] = useState(false)

  const run = useCallback(() => {
    setRunning(true)
    // Defer so the detached-root measurement never runs inside React's own flush.
    setTimeout(() => {
      try {
        setResult(drill.measure())
      } finally {
        setRunning(false)
      }
    }, 0)
  }, [drill])

  useEffect(() => {
    run()
  }, [run])

  const pct = result ? improvementPct(result.before, result.after) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Live metrics</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={run} disabled={running}>
          <RefreshCw className={cn('h-3.5 w-3.5', running && 'animate-spin')} />
          Re-run
        </Button>
      </div>

      <p className="text-xs text-muted">
        {drill.metric.label} — measured by running the real components in a sandbox.
      </p>

      {/* Before */}
      <MetricCard
        tone="before"
        label="Before"
        value={result?.before}
        unit={drill.metric.unit}
      />

      <div className="flex justify-center">
        <ArrowDown className="h-5 w-5 text-muted" />
      </div>

      {/* After (revealed once the fix is applied) */}
      {solved ? (
        <div className="animate-pop">
          <MetricCard
            tone="after"
            label="After"
            value={result?.after}
            unit={drill.metric.unit}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface2/30 p-5 text-center">
          <Lock className="mx-auto mb-2 h-5 w-5 text-muted" />
          <p className="text-sm text-muted">
            Fix the code to reveal the improved measurement.
          </p>
        </div>
      )}

      {/* Improvement */}
      {solved && result && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 py-3 animate-fade-in">
          <TrendingDown className="h-5 w-5 text-success" />
          <span className="text-lg font-bold text-success">{pct}% fewer</span>
          <span className="text-sm text-emerald-200/80">{drill.metric.unit}</span>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  tone,
  label,
  value,
  unit,
}: {
  tone: 'before' | 'after'
  label: string
  value: number | undefined
  unit: string
}) {
  const isBefore = tone === 'before'
  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        isBefore
          ? 'border-danger/30 bg-danger/5'
          : 'border-success/30 bg-success/5',
      )}
    >
      <div className="flex items-center justify-between">
        <Badge tone={isBefore ? 'red' : 'green'}>{label}</Badge>
        {isBefore && (
          <span className="text-xs text-red-300/70">the problem</span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            'font-mono text-4xl font-bold tabular-nums',
            isBefore ? 'text-danger' : 'text-success',
          )}
        >
          {value ?? '—'}
        </span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
    </div>
  )
}
