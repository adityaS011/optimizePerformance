import { useEffect } from 'react'
import { ArrowRight, BookOpen, Code2, HelpCircle, Lightbulb, Lock, X } from 'lucide-react'
import { DRILLS, getDrill } from '@/data/drills'
import { useProgressStore } from '@/store/useProgressStore'
import { useUIStore } from '@/store/useUIStore'
import { MCQSection } from '@/components/MCQSection'
import { CodeEditor } from '@/components/CodeEditor'
import { MetricsMonitor } from '@/components/MetricsMonitor'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function OptimizationSidebar() {
  const selectedId = useUIStore((s) => s.selectedId)
  const close = useUIStore((s) => s.close)
  const select = useUIStore((s) => s.select)

  const progress = useProgressStore((s) => (selectedId ? s.progress[selectedId] : undefined))
  const markMcqCorrect = useProgressStore((s) => s.markMcqCorrect)
  const markFixed = useProgressStore((s) => s.markFixed)

  // Close on Escape.
  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, close])

  if (!selectedId) return null
  const drill = getDrill(selectedId)
  if (!drill) return null

  const mcqCorrect = Boolean(progress?.mcqCorrect)
  const fixed = Boolean(progress?.fixed)

  const index = DRILLS.findIndex((d) => d.id === selectedId)
  const next = DRILLS.slice(index + 1).find(
    (d) => !useProgressStore.getState().isComplete(d.id),
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[440px] flex-col border-l border-border bg-background shadow-2xl animate-slide-in"
        role="dialog"
        aria-label={`Optimize ${drill.widget.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge tone="blue">{drill.widget.category}</Badge>
              {mcqCorrect && fixed && <Badge tone="green">Done</Badge>}
            </div>
            <h2 className="text-lg font-bold text-foreground">{drill.widget.name}</h2>
            <p className="mt-0.5 text-sm text-muted">{drill.description}</p>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface2 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Metrics up top so the impact is always visible */}
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <MetricsMonitor drill={drill} solved={fixed} />
          </div>

          {/* Step 1 — MCQ */}
          <section>
            <StepHeader
              icon={<HelpCircle className="h-4 w-4" />}
              step={1}
              title="Diagnose the problem"
              done={mcqCorrect}
            />
            <div className="mt-3">
              <MCQSection
                mcq={drill.mcq}
                answered={mcqCorrect}
                onCorrect={() => markMcqCorrect(drill.id)}
              />
            </div>
          </section>

          {/* Step 2 — Fix */}
          <section className={cn(!mcqCorrect && 'opacity-60')}>
            <StepHeader
              icon={<Code2 className="h-4 w-4" />}
              step={2}
              title="Fix the code"
              done={fixed}
            />
            <div className="mt-3">
              {mcqCorrect ? (
                <CodeEditor
                  brokenCode={drill.brokenCode}
                  correctCode={drill.correctCode}
                  fix={drill.fix}
                  solved={fixed}
                  onSolved={() => markFixed(drill.id)}
                />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface2/30 px-4 py-6 text-sm text-muted">
                  <Lock className="h-4 w-4" />
                  Answer the diagnosis correctly to unlock the code fix.
                </div>
              )}
            </div>
          </section>

          {/* Step 3 — Takeaway */}
          {fixed && (
            <section className="rounded-xl border border-success/30 bg-success/5 p-4 animate-fade-in">
              <StepHeader
                icon={<BookOpen className="h-4 w-4" />}
                step={3}
                title="Key takeaway"
                done
              />
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {drill.keyTakeaway}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Lightbulb className="h-3 w-3" /> Related:
                </span>
                {drill.relatedConcepts.map((c) => (
                  <Badge key={c} tone="violet">
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                {next ? (
                  <Button onClick={() => select(next.id)} className="w-full">
                    Optimize next: {next.widget.name} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="success" onClick={close} className="w-full">
                    🎉 Dashboard fully optimized — close
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  )
}

function StepHeader({
  icon,
  step,
  title,
  done,
}: {
  icon: React.ReactNode
  step: number
  title: string
  done: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          done ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary',
        )}
      >
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted">Step {step}</p>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
    </div>
  )
}
