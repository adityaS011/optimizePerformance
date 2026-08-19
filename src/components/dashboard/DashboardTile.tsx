import { AlertTriangle, Check, Zap } from 'lucide-react'
import type { Drill } from '@/data/types'
import { useProgressStore } from '@/store/useProgressStore'
import { useUIStore } from '@/store/useUIStore'
import { useHeartbeat } from '@/hooks/useHeartbeat'
import { useRenderCount } from '@/hooks/useRenderCount'
import { cn } from '@/lib/utils'
import { TileContent } from './TileContent'

export function DashboardTile({ drill }: { drill: Drill }) {
  const fixed = useProgressStore(
    (s) => Boolean(s.progress[drill.id]?.mcqCorrect && s.progress[drill.id]?.fixed),
  )
  const selectedId = useUIStore((s) => s.selectedId)
  const select = useUIStore((s) => s.select)

  // Un-optimized widgets subscribe to the heartbeat → they actually re-render
  // (and flicker) on the dashboard. Fixed ones stop and go still.
  const tick = useHeartbeat(!fixed)
  const renders = useRenderCount()

  const selected = selectedId === drill.id

  return (
    <button
      onClick={() => select(drill.id)}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border bg-surface/70 p-4 text-left transition-all',
        'hover:border-primary/50 hover:bg-surface',
        drill.widget.span === 2 && 'sm:col-span-2',
        selected
          ? 'border-primary ring-2 ring-primary/40'
          : fixed
            ? 'border-success/40'
            : 'border-border',
        !fixed && 'animate-flicker',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{drill.widget.name}</p>
          <p className="text-[11px] text-muted">{drill.widget.category}</p>
        </div>
        {fixed ? (
          <span className="flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            <Check className="h-3 w-3" /> Optimized
          </span>
        ) : (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
              drill.widget.severity === 'high'
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300',
            )}
          >
            <AlertTriangle className="h-3 w-3" /> Slow
          </span>
        )}
      </div>

      {/* Mock content */}
      <div className="min-h-[3.5rem]">
        <TileContent kind={drill.widget.kind} tick={tick} />
      </div>

      {/* Footer: live render meter */}
      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2">
        {fixed ? (
          <span className="flex items-center gap-1 text-[11px] text-success">
            <Zap className="h-3 w-3" /> stable · no wasted renders
          </span>
        ) : (
          <span className="flex items-center gap-1 font-mono text-[11px] text-red-300">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-400" />
            {renders} renders
          </span>
        )}
        <span className="text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
          Optimize →
        </span>
      </div>
    </button>
  )
}
