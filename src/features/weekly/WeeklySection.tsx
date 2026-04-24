import { Flame, Footprints, Moon, Scale, Utensils } from 'lucide-react'
import { WEEK_DAYS } from '../../data/program'
import { Card, FieldLabel, Input, SectionHeader, Sparkline, StatCard, Textarea } from '../../components/ui'
import { formatMaybe, type AtlasMetrics } from '../../lib/atlas'
import type { Weekday, WeekLog } from '../../types/atlas'

export function WeeklySection({
  week,
  metrics,
  onUpdateMetric,
  onUpdateOverviewNote,
}: {
  week: WeekLog
  metrics: AtlasMetrics
  onUpdateMetric: (day: Weekday, key: 'bw' | 'calories' | 'protein' | 'steps' | 'sleep' | 'note', value: string) => void
  onUpdateOverviewNote: (value: string) => void
}) {
  const averageTiles = [
    { label: 'Bodyweight', value: formatMaybe(metrics.avgBodyweight, 1, ' lb'), detail: '7-day avg', icon: Scale, tone: 'purple' as const },
    { label: 'Calories', value: formatMaybe(metrics.avgCalories, 0, ' kcal'), detail: 'daily avg', icon: Flame, tone: 'coral' as const },
    { label: 'Protein', value: formatMaybe(metrics.avgProtein, 0, ' g'), detail: 'daily avg', icon: Utensils, tone: 'green' as const },
    { label: 'Steps', value: formatMaybe(metrics.avgSteps, 0, ''), detail: 'daily avg', icon: Footprints, tone: 'amber' as const },
    { label: 'Sleep', value: formatMaybe(metrics.avgSleep, 1, ' h'), detail: 'nightly avg', icon: Moon, tone: 'blue' as const },
  ]

  return (
    <section id="atlas-weekly-tracker" className="space-y-4">
      <SectionHeader title="Weekly Tracker" subtitle="Bodyweight, nutrition, recovery, and context for better recommendations." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {averageTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <StatCard key={tile.label} label={tile.label} value={tile.value} detail={tile.detail} tone={tile.tone}>
              <div className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-current/10">
                <Icon className="h-5 w-5" />
              </div>
            </StatCard>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-text-secondary">Bodyweight Trend</p>
            <span className="text-xs font-bold text-accent-secondary">{formatMaybe(metrics.bwDelta, 1, ' lb')}</span>
          </div>
          <div className="mt-4">
            <Sparkline values={metrics.bodyweights} color="rgb(var(--color-accent-secondary))" height={96} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-text-secondary">Sleep Trend</p>
            <span className="text-xs font-bold text-focus">{formatMaybe(metrics.avgSleep, 1, ' h avg')}</span>
          </div>
          <div className="mt-4">
            <Sparkline values={metrics.sleep} color="rgb(var(--color-focus))" height={96} />
          </div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {WEEK_DAYS.map((day) => (
          <Card key={day} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-text-primary">{day}</h3>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-text-secondary">Daily log</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <FieldLabel>Bodyweight</FieldLabel>
                <Input value={week.weekly[day].bw} onChange={(event) => onUpdateMetric(day, 'bw', event.target.value)} placeholder="lb" />
              </div>
              <div>
                <FieldLabel>Calories</FieldLabel>
                <Input value={week.weekly[day].calories} onChange={(event) => onUpdateMetric(day, 'calories', event.target.value)} placeholder="kcal" />
              </div>
              <div>
                <FieldLabel>Protein</FieldLabel>
                <Input value={week.weekly[day].protein} onChange={(event) => onUpdateMetric(day, 'protein', event.target.value)} placeholder="g" />
              </div>
              <div>
                <FieldLabel>Steps</FieldLabel>
                <Input value={week.weekly[day].steps} onChange={(event) => onUpdateMetric(day, 'steps', event.target.value)} placeholder="steps" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Sleep</FieldLabel>
                <Input value={week.weekly[day].sleep} onChange={(event) => onUpdateMetric(day, 'sleep', event.target.value)} placeholder="hrs" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Daily Note</FieldLabel>
                <Textarea value={week.weekly[day].note} onChange={(event) => onUpdateMetric(day, 'note', event.target.value)} rows={2} placeholder="Context" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <FieldLabel>Weekly Context Note</FieldLabel>
        <Textarea value={week.overviewNote} onChange={(event) => onUpdateOverviewNote(event.target.value)} rows={3} placeholder="What happened this week that may affect interpretation?" />
      </Card>
    </section>
  )
}
