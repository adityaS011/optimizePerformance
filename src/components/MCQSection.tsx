import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Mcq } from '@/data/types'
import { Button } from './ui'
import { cn } from '@/lib/utils'

interface MCQSectionProps {
  mcq: Mcq
  answered: boolean
  onCorrect: () => void
}

export function MCQSection({ mcq, answered, onCorrect }: MCQSectionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<'none' | 'correct' | 'wrong'>(
    answered ? 'correct' : 'none',
  )

  const locked = result === 'correct'

  function submit() {
    if (selected === null) return
    if (selected === mcq.correctAnswer) {
      setResult('correct')
      onCorrect()
    } else {
      setResult('wrong')
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{mcq.question}</p>

      <div className="space-y-2">
        {mcq.options.map((option, i) => {
          const isSelected = selected === i
          const isAnswer = i === mcq.correctAnswer
          const showAsCorrect = locked && isAnswer
          const showAsWrong = result === 'wrong' && isSelected

          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => setSelected(i)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                'disabled:cursor-default',
                showAsCorrect
                  ? 'border-success/50 bg-success/10 text-emerald-100'
                  : showAsWrong
                    ? 'border-danger/50 bg-danger/10 text-red-100'
                    : isSelected
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-surface2/40 text-muted hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  showAsCorrect
                    ? 'border-success bg-success text-white'
                    : showAsWrong
                      ? 'border-danger bg-danger text-white'
                      : isSelected
                        ? 'border-primary text-primary'
                        : 'border-muted/50 text-muted',
                )}
              >
                {showAsCorrect ? (
                  <Check className="h-3 w-3" />
                ) : showAsWrong ? (
                  <X className="h-3 w-3" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>

      {result === 'wrong' && (
        <p className="text-sm text-red-300 animate-fade-in">
          Not quite — think about what actually changed between renders. Try again.
        </p>
      )}

      {locked ? (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 animate-fade-in">
          <p className="mb-1 flex items-center gap-2 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Correct
          </p>
          <p className="text-sm leading-relaxed text-muted">{mcq.explanation}</p>
        </div>
      ) : (
        <Button onClick={submit} disabled={selected === null}>
          Submit answer
        </Button>
      )}
    </div>
  )
}
