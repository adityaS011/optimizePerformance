import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/* Button ------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/30',
  secondary: 'bg-surface2 text-foreground hover:bg-surface2/70 border border-border',
  ghost: 'text-muted hover:text-foreground hover:bg-surface2/60',
  success: 'bg-success text-white hover:bg-success/90',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

/* Badge ------------------------------------------------------------- */

type BadgeTone = 'neutral' | 'blue' | 'green' | 'red' | 'violet' | 'amber'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface2 text-muted border-border',
  blue: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  red: 'bg-red-500/10 text-red-300 border-red-500/30',
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

/* Card -------------------------------------------------------------- */

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface/70 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}

/* ProgressBar ------------------------------------------------------- */

export function ProgressBar({
  value,
  className,
  tone = 'primary',
}: {
  value: number // 0–100
  className?: string
  tone?: 'primary' | 'success'
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface2', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          tone === 'success' ? 'bg-success' : 'bg-primary',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
