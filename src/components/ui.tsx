import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cx } from '../lib/cx'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <article
      className={cx('rounded-xl2 border border-text-primary/10 bg-surface-1/85 p-4 shadow-soft', className)}
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
        <h2 className="font-display text-2xl tracking-tight text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}

export function Pill({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cx('rounded-full border border-text-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary', className)}>{children}</span>
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">{children}</label>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'quiet'
}

export function Button({ className, variant = 'ghost', ...props }: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'border border-accent-primary/50 bg-accent-primary text-white hover:bg-accent-primary/90'
      : variant === 'danger'
        ? 'border border-error/40 bg-error/10 text-error hover:bg-error/20'
        : variant === 'quiet'
          ? 'border border-text-primary/10 bg-surface-2/70 text-text-secondary hover:bg-surface-2'
          : 'border border-text-primary/15 bg-surface-2/60 text-text-primary hover:bg-surface-2'

  return (
    <button
      className={cx(
        'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        variantClass,
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'w-full rounded-lg border border-text-primary/15 bg-bg px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-secondary/70 focus-visible:ring-2 focus-visible:ring-focus',
        props.className,
      )}
      {...props}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        'w-full rounded-lg border border-text-primary/15 bg-bg px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-secondary/70 focus-visible:ring-2 focus-visible:ring-focus',
        props.className,
      )}
      {...props}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        'w-full rounded-lg border border-text-primary/15 bg-bg px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-focus',
        props.className,
      )}
      {...props}
    />
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
  const accentClass =
    accent === 'secondary'
      ? 'border-accent-secondary/40'
      : accent === 'warm'
        ? 'border-accent-warm/40'
        : accent === 'focus'
          ? 'border-focus/40'
          : 'border-accent-primary/40'

  return (
    <Card className={cx('border-l-4', accentClass)}>
      <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="mt-2 font-display text-2xl text-text-primary">{value}</div>
      <p className="mt-2 text-sm text-text-secondary">{detail}</p>
    </Card>
  )
}

export function ToastViewport({
  toasts,
}: {
  toasts: Array<{ id: number; tone: 'info' | 'success' | 'error'; message: string }>
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cx(
            'rounded-lg border bg-surface-1 p-3 text-sm shadow-warm',
            toast.tone === 'error' && 'border-error/40 text-error',
            toast.tone === 'success' && 'border-accent-primary/40 text-text-primary',
            toast.tone === 'info' && 'border-focus/40 text-text-primary',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
