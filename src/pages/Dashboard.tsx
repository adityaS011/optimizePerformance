import { useMemo } from 'react'
import { Gauge, RotateCcw, Sparkles } from 'lucide-react'
import { DRILLS } from '@/data/drills'
import { useProgressStore } from '@/store/useProgressStore'
import { DashboardTile } from '@/components/dashboard/DashboardTile'
import { OptimizationSidebar } from '@/components/dashboard/OptimizationSidebar'
import { ProgressBar } from '@/components/ui'

export function Dashboard() {
  const progress = useProgressStore((s) => s.progress)
  const reset = useProgressStore((s) => s.reset)

  const done = useMemo(
    () => DRILLS.filter((d) => progress[d.id]?.mcqCorrect && progress[d.id]?.fixed).length,
    [progress],
  )
  const pct = Math.round((done / DRILLS.length) * 100)
  const allDone = done === DRILLS.length

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Gauge className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Acme Analytics</p>
              <p className="text-[11px] text-muted">Performance console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden w-48 sm:block">
              <div className="mb-1 flex justify-between text-[11px] text-muted">
                <span>Optimized</span>
                <span className="font-medium text-foreground">
                  {done}/{DRILLS.length}
                </span>
              </div>
              <ProgressBar value={pct} tone={allDone ? 'success' : 'primary'} />
            </div>
            {done > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Intro strip */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {allDone ? 'Dashboard fully optimized 🎉' : 'This dashboard is running slow.'}
            </h1>
            <p className="mt-1 max-w-2xl text-muted">
              {allDone
                ? 'Every widget is memoized and leak-free. Reset to run the drills again.'
                : 'Each widget below has a real React performance bug — the flickering ones are wasting renders. Click any widget to diagnose it, fix the code, and watch its metrics improve live.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {DRILLS.length} widgets · real metrics
          </div>
        </div>
      </div>

      {/* Widget grid */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DRILLS.map((drill) => (
            <DashboardTile key={drill.id} drill={drill} />
          ))}
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
          Built with React 18, TypeScript, Vite, Tailwind & Zustand · Before/after numbers
          are measured live by running the real components — nothing is faked.
        </footer>
      </main>

      <OptimizationSidebar />
    </div>
  )
}
