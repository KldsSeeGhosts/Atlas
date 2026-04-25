import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cx } from '../lib/cx'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <article
      className={cx('rounded-2xl border border-text-primary/10 bg-surface-1 p-4 shadow-soft', className)}
      {...props}
    >
      {children}
    </article>
  )
}

export function SectionHeader({
  title,
  subtitle,
  rightSlot,
}: {
  title: string
  subtitle: string
  rightSlot?: ReactNode
}) {
  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary md:text-2xl">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">{subtitle}</p>
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}

export function Pill({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border border-text-primary/10 bg-surface-1 px-3 py-1 text-xs font-semibold text-text-secondary shadow-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-text-secondary">{children}</label>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'quiet' | 'success'
  icon?: LucideIcon
}

export function Button({ className, variant = 'ghost', icon: Icon, children, ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'border border-accent-secondary/20 bg-accent-secondary text-white shadow-sm hover:bg-accent-secondary/90'
      : variant === 'danger'
        ? 'border border-error/20 bg-error/10 text-error hover:bg-error/15'
        : variant === 'quiet'
          ? 'border border-text-primary/10 bg-surface-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary'
          : variant === 'success'
            ? 'border border-success/20 bg-success/10 text-success hover:bg-success/15'
            : 'border border-text-primary/10 bg-surface-2 text-text-primary hover:bg-text-primary/5'

  return (
    <button
      className={cx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50',
        variantClass,
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export function IconButton({
  icon: Icon,
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string }) {
  return (
    <button
      className={cx(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-text-primary/10 bg-surface-1 text-text-secondary shadow-sm transition hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'w-full rounded-xl border border-text-primary/10 bg-surface-2 px-3 py-2.5 text-base font-medium text-text-primary outline-none transition placeholder:text-text-secondary/65 focus-visible:border-focus/40 focus-visible:bg-surface-1 focus-visible:ring-2 focus-visible:ring-focus/20 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        'w-full rounded-xl border border-text-primary/10 bg-surface-2 px-3 py-2.5 text-base font-medium text-text-primary outline-none transition placeholder:text-text-secondary/65 focus-visible:border-focus/40 focus-visible:bg-surface-1 focus-visible:ring-2 focus-visible:ring-focus/20 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        'w-full rounded-xl border border-text-primary/10 bg-surface-2 px-3 py-2.5 text-base font-medium text-text-primary outline-none transition focus-visible:border-focus/40 focus-visible:bg-surface-1 focus-visible:ring-2 focus-visible:ring-focus/20 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export function StatCard({
  label,
  value,
  detail,
  tone = 'coral',
  children,
}: {
  label: string
  value: string
  detail?: string
  tone?: 'coral' | 'purple' | 'blue' | 'green' | 'amber'
  children?: ReactNode
}) {
  const toneClass = {
    coral: 'from-accent-primary/12 text-accent-primary',
    purple: 'from-accent-secondary/12 text-accent-secondary',
    blue: 'from-focus/12 text-focus',
    green: 'from-success/12 text-success',
    amber: 'from-accent-warm/16 text-accent-warm',
  }[tone]

  return (
    <Card className={cx('overflow-hidden bg-gradient-to-b to-surface-1', toneClass)}>
      <div className="text-[11px] font-bold text-text-secondary">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-bold leading-none text-text-primary">{value}</div>
          {detail ? <p className="mt-2 text-xs font-semibold text-text-secondary">{detail}</p> : null}
        </div>
        {children ? <div className="min-w-0 flex-1">{children}</div> : null}
      </div>
    </Card>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  accent = 'primary',
}: {
  label: string
  value: string
  detail: string
  accent?: 'primary' | 'secondary' | 'warm' | 'focus'
}) {
  const tone = accent === 'secondary' ? 'purple' : accent === 'warm' ? 'amber' : accent === 'focus' ? 'blue' : 'coral'
  return <StatCard label={label} value={value} detail={detail} tone={tone} />
}

export function Gauge({
  value,
  max = 100,
  color = 'rgb(var(--color-success))',
  label,
}: {
  value: number
  max?: number
  color?: string
  label?: string
}) {
  const safeValue = Math.max(0, Math.min(max, value))
  const radius = 42
  const circumference = Math.PI * radius
  const progress = (safeValue / max) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 108 62" className="h-20 w-full max-w-[150px]" aria-hidden="true">
        <path
          d="M12 54a42 42 0 0 1 84 0"
          fill="none"
          stroke="rgb(var(--color-surface-2))"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M12 54a42 42 0 0 1 84 0"
          fill="none"
          pathLength={circumference}
          stroke={color}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      {label ? <div className="-mt-5 text-[11px] font-bold text-text-secondary">{label}</div> : null}
    </div>
  )
}

function linePath(values: Array<number | null>, width: number, height: number): string {
  const valid = values.filter((value): value is number => Number.isFinite(value))
  if (!valid.length) return ''
  const padding = 6
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  const step = (width - padding * 2) / Math.max(1, values.length - 1)
  const scaleY = (value: number) => {
    if (max === min) return height / 2
    return height - padding - ((value - min) / (max - min)) * (height - padding * 2)
  }

  return values
    .map((value, index) => {
      if (value === null) return null
      const x = padding + step * index
      const y = scaleY(value)
      const isFirst = values.slice(0, index).every((candidate) => candidate === null)
      return `${isFirst ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .filter(Boolean)
    .join(' ')
}

export function Sparkline({
  values,
  color = 'rgb(var(--color-accent-secondary))',
  height = 54,
}: {
  values: Array<number | null>
  color?: string
  height?: number
}) {
  const width = 180
  const path = linePath(values, width, height)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeWidth="3" />
      {path ? <path d={`${path} L ${width - 6} ${height} L 6 ${height} Z`} fill={color} opacity="0.08" /> : null}
    </svg>
  )
}

export function ProgressBars({
  values,
  labels,
  color = 'bg-success',
}: {
  values: number[]
  labels: string[]
  color?: string
}) {
  return (
    <div className="flex h-28 items-end justify-between gap-2">
      {values.map((value, index) => (
        <div key={`${labels[index]}-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-20 w-full max-w-4 items-end rounded-full bg-surface-2">
            <div className={cx('w-full rounded-full', color)} style={{ height: `${Math.max(8, Math.min(100, value))}%` }} />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">{labels[index]}</span>
        </div>
      ))}
    </div>
  )
}

function formatWheelValue(value: number, step: number): string {
  if (Number.isInteger(step)) return String(value)
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function InlineWheelField({
  value,
  min,
  max,
  step,
  unit,
  onCommit,
}: {
  value: string
  min: number
  max: number
  step: number
  unit?: string
  onCommit: (value: string) => void
}) {
  const rowHeight = 36
  const options = useMemo(() => {
    const count = Math.floor((max - min) / step)
    return Array.from({ length: count + 1 }, (_, index) => Number((min + index * step).toFixed(2)))
  }, [max, min, step])
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const settleTimerRef = useRef<number | null>(null)
  const numericValue = Number.parseFloat(value)
  const selected = Number.isFinite(numericValue) ? numericValue : null
  const selectedIndex =
    selected === null
      ? -1
      : options.reduce((bestIndex, option, index) => {
          if (bestIndex === -1) return index
          return Math.abs(option - selected) < Math.abs(options[bestIndex] - selected) ? index : bestIndex
        }, -1)
  const [displayIndex, setDisplayIndex] = useState(Math.max(0, selectedIndex))

  const nearestIndexForScroll = useCallback(
    (scrollTop: number) => Math.max(0, Math.min(options.length - 1, Math.round(scrollTop / rowHeight))),
    [options.length],
  )

  const settleScroll = useCallback(() => {
    const node = scrollerRef.current
    if (!node) return
    const nextIndex = nearestIndexForScroll(node.scrollTop)
    const nextValue = formatWheelValue(options[nextIndex], step)
    setDisplayIndex(nextIndex)
    node.scrollTo({ top: nextIndex * rowHeight, behavior: 'smooth' })
    if (nextValue !== value) onCommit(nextValue)
  }, [nearestIndexForScroll, onCommit, options, step, value])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node || selectedIndex < 0) return
    setDisplayIndex(selectedIndex)
    node.scrollTop = selectedIndex * rowHeight
  }, [rowHeight, selectedIndex])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.addEventListener('scrollend', settleScroll)
    return () => node.removeEventListener('scrollend', settleScroll)
  }, [settleScroll])

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
    }
  }, [])

  return (
    <div className="relative h-[92px] overflow-hidden rounded-xl border border-text-primary/10 bg-surface-2 shadow-[inset_0_1px_0_rgb(var(--color-surface-1))]">
      <div className="pointer-events-none absolute inset-x-1.5 top-1/2 z-10 h-9 -translate-y-1/2 rounded-lg bg-surface-1/70 shadow-[inset_0_0_0_1px_rgb(var(--color-text-primary)/0.04)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-7 bg-gradient-to-b from-surface-2 to-surface-2/0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 bg-gradient-to-t from-surface-2 to-surface-2/0" />
      <div
        ref={scrollerRef}
        className="ios-momentum ios-wheel-mask no-scrollbar h-full snap-y snap-mandatory overflow-y-auto px-1 py-7"
        onScroll={() => {
          const node = scrollerRef.current
          if (node) setDisplayIndex(nearestIndexForScroll(node.scrollTop))
          if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
          settleTimerRef.current = window.setTimeout(settleScroll, 110)
        }}
        aria-label="Inline number selector"
      >
        {options.map((option, index) => {
          const optionText = formatWheelValue(option, step)
          const distance = Math.abs(index - displayIndex)
          const active = index === displayIndex
          const rowStyle =
            distance === 0
              ? 'scale-110 text-text-primary'
              : distance === 1
                ? 'text-text-secondary/70'
                : distance === 2
                  ? 'text-text-secondary/40'
                  : 'text-text-secondary/20'
          return (
            <button
              key={optionText}
              type="button"
              onClick={() => {
                setDisplayIndex(index)
                onCommit(optionText)
                scrollerRef.current?.scrollTo({ top: index * rowHeight, behavior: 'smooth' })
              }}
              className={cx(
                'relative z-20 flex h-9 w-full snap-center items-center justify-center border-0 text-lg font-bold leading-none transition will-change-transform',
                active ? 'scale-110 text-text-primary' : rowStyle,
              )}
            >
              {optionText}
              {active && unit ? <span className="ml-0.5 text-[10px] font-bold text-text-secondary">{unit}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ToastViewport({
  toasts,
}: {
  toasts: Array<{ id: number; tone: 'info' | 'success' | 'error'; message: string }>
}) {
  return (
    <div className="toast-safe pointer-events-none fixed right-4 z-50 flex max-w-[320px] flex-col gap-2 md:bottom-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx(
            'rounded-2xl border bg-surface-1 p-3 text-sm font-semibold shadow-warm',
            toast.tone === 'error' && 'border-error/30 text-error',
            toast.tone === 'success' && 'border-success/30 text-success',
            toast.tone === 'info' && 'border-focus/30 text-text-primary',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
