import {
  Bell,
  Check,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type { TileKind } from '@/data/types'
import { cn } from '@/lib/utils'

/** Lightweight mock content so each tile reads like a real dashboard widget. */
export function TileContent({ kind, tick }: { kind: TileKind; tick: number }) {
  switch (kind) {
    case 'stat':
      return (
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">1,284</p>
          <p className="text-xs text-emerald-400">▲ 4.2% vs last week</p>
        </div>
      )

    case 'list':
      return (
        <ul className="space-y-1.5">
          {['Deploy finished', 'New signup', 'Payment received'].map((t) => (
            <li key={t} className="flex items-center gap-2 text-xs text-muted">
              <Bell className="h-3 w-3 text-violet-400" /> {t}
            </li>
          ))}
        </ul>
      )

    case 'search':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted" />
            <span className="text-xs text-muted">Search customers…</span>
          </div>
          <div className="space-y-1 rounded-md border border-border bg-background/40 p-1.5">
            {['Acme Inc.', 'Globex', 'Initech'].map((s) => (
              <div key={s} className="rounded px-2 py-1 text-xs text-muted hover:bg-surface2/60">
                {s}
              </div>
            ))}
          </div>
        </div>
      )

    case 'filter':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" /> 3 filters active
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Active', 'EU', 'Pro'].map((f) => (
              <span
                key={f}
                className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )

    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Dark mode</span>
          <span className="flex h-5 w-9 items-center rounded-full bg-primary px-0.5">
            <span className="ml-auto h-4 w-4 rounded-full bg-white" />
          </span>
        </div>
      )

    case 'chart':
      return (
        <div className="flex h-16 items-end gap-1">
          {[40, 65, 30, 80, 55, 70, 45, 90, 60, 35, 75, 50].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )

    case 'table':
      return (
        <div className="space-y-1">
          {[
            ['Jane Cooper', 'Admin'],
            ['Cody Fisher', 'Editor'],
            ['Esther Howard', 'Viewer'],
          ].map(([name, role]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{name}</span>
              <span className="text-muted">{role}</span>
            </div>
          ))}
        </div>
      )

    case 'settings':
      return (
        <div className="space-y-2">
          {['Email', 'Timezone'].map((label) => (
            <div key={label}>
              <p className="text-[11px] text-muted">{label}</p>
              <div className="h-6 rounded-md border border-border bg-background/60" />
            </div>
          ))}
        </div>
      )

    case 'clock': {
      const d = new Date()
      // Advances with the heartbeat so an un-optimized clock visibly ticks.
      const secs = (d.getSeconds() + tick) % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      return (
        <div>
          <p className="font-mono text-2xl font-bold text-foreground">
            {pad(d.getHours())}:{pad(d.getMinutes())}:{pad(secs)}
          </p>
          <p className="text-xs text-muted">UTC · server time</p>
        </div>
      )
    }

    case 'badge':
      return (
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">Online</span>
        </div>
      )

    case 'menu':
      return (
        <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-2.5 py-1.5">
          <span className="text-xs text-muted">Region: EU-West</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </div>
      )

    case 'spinner':
      return (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs">Syncing… 64%</span>
        </div>
      )

    case 'tasks':
      return (
        <ul className="space-y-1.5">
          {[
            ['Review PR #482', true],
            ['Ship release notes', false],
            ['Update dashboard', false],
          ].map(([t, done]) => (
            <li key={t as string} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'flex h-3.5 w-3.5 items-center justify-center rounded border',
                  done ? 'border-emerald-400 bg-emerald-400/20' : 'border-muted/50',
                )}
              >
                {done ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : null}
              </span>
              <span className={cn(done ? 'text-muted line-through' : 'text-foreground')}>
                {t as string}
              </span>
            </li>
          ))}
        </ul>
      )

    case 'revenue':
      return (
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">$48,920</p>
          <p className="text-xs text-emerald-400">▲ animating…</p>
        </div>
      )

    case 'breadcrumb':
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {['Home', 'Dashboard', 'Settings'].map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted/40">/</span>}
              <span className={i === 2 ? 'text-foreground' : ''}>{c}</span>
            </span>
          ))}
        </div>
      )

    default:
      return null
  }
}
