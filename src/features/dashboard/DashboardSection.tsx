import { PROGRAM } from '../../data/program'
import { formatMaybe, type AtlasMetrics } from '../../lib/atlas'
import { Card, MetricCard, Pill, SectionHeader } from '../../components/ui'
import type { WeekLog } from '../../types/atlas'

function sparkline(values: Array<number | null>, color: string): string {
  const width = 220
  const height = 70
  const padding = 6
  const valid = values.filter((value): value is number => value !== null)
  if (!valid.length) return ''
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  const step = (width - padding * 2) / Math.max(1, values.length - 1)
  const scale = (value: number) => {
    if (max === min) return height / 2
    return height - padding - ((value - min) / (max - min)) * (height - padding * 2)
  }

  const d = values
    .map((value, index) => {
      if (value === null) return null
      const x = padding + index * step
      const y = scale(value)
      const isFirstDefined = values.slice(0, index).every((candidate) => candidate === null)
      return `${isFirstDefined ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .filter(Boolean)
    .join(' ')

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none">
      <path d="${d}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>
  `
}

function computeSessionVolume(week: WeekLog): number {
  let total = 0
  for (const day of PROGRAM) {
    for (const exercise of week.sessions[day.id].exercises) {
      for (const set of exercise.sets) {
        const reps = Number.parseFloat(set.reps)
        const weight = Number.parseFloat(set.weight)
        if (Number.isFinite(reps) && Number.isFinite(weight)) {
          total += reps * weight
        }
      }
    }
  }
  return Math.round(total)
}

export function DashboardSection({
  week,
  weekId,
  metrics,
  upcomingDay,
}: {
  week: WeekLog
  weekId: number
  metrics: AtlasMetrics
  upcomingDay: (typeof PROGRAM)[number] | null
}) {
  const volume = computeSessionVolume(week)

  return (
    <section id="atlas-dashboard" className="space-y-4">
      <SectionHeader
        title="Dashboard"
        subtitle="A calm weekly pulse for training, recovery, nutrition, and analysis readiness."
        rightSlot={<Pill>Week {weekId}</Pill>}
      />

      <Card className="relative overflow-hidden bg-gradient-to-br from-surface-1 to-surface-2">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-warm/40 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-accent-primary/20 blur-2xl" />
        <div className="relative z-10 grid gap-4 md:grid-cols-[1.4fr,1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Atlas Overview</p>
            <h3 className="mt-2 font-display text-3xl text-text-primary">Structured signal, less noise.</h3>
            <p className="mt-2 max-w-xl text-sm text-text-secondary">{metrics.summaryLine}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Pill>{metrics.completedSessions}/5 sessions logged</Pill>
              <Pill>{metrics.totalLoggedSets} logged sets</Pill>
              <Pill>{volume} lb volume</Pill>
            </div>
          </div>
          <div className="rounded-xl border border-text-primary/10 bg-bg/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Upcoming Training Day</p>
            {upcomingDay ? (
              <>
                <h4 className="mt-2 font-display text-xl text-text-primary">{upcomingDay.title}</h4>
                <p className="text-sm text-text-secondary">{upcomingDay.focus}</p>
                <p className="mt-3 text-sm text-text-secondary">{upcomingDay.description}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-text-secondary">All programmed sessions have entries this week.</p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Recovery Score"
          value={String(metrics.recoveryScore)}
          detail="Blends sleep, readiness, protein adequacy, and session consistency."
          accent="primary"
        />
        <MetricCard
          label="Nutrition Compliance"
          value={`${metrics.nutritionCompliance}%`}
          detail={`Protein ratio ${formatMaybe(metrics.proteinTargetRatio, 2, ' g/lb')} with nutrition logging coverage.`}
          accent="secondary"
        />
        <MetricCard
          label="Bodyweight Trend"
          value={formatMaybe(metrics.bwDelta, 1, ' lb/wk')}
          detail={`Average ${formatMaybe(metrics.avgBodyweight, 1, ' lb')} this week.`}
          accent="warm"
        />
        <MetricCard
          label="Bench Highlight"
          value={formatMaybe(metrics.benchE1RM, 1, ' e1RM')}
          detail="Estimated from logged barbell bench work."
          accent="focus"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Bodyweight (7-day)</p>
          <div
            className="mt-3"
            dangerouslySetInnerHTML={{ __html: sparkline(metrics.bodyweights, 'rgb(204,120,92)') }}
          />
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Sleep (7-day)</p>
          <div
            className="mt-3"
            dangerouslySetInnerHTML={{ __html: sparkline(metrics.sleep, 'rgb(97,170,242)') }}
          />
        </Card>
      </div>
    </section>
  )
}
