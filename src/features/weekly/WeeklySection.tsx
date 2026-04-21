import { WEEK_DAYS } from '../../data/program'
import { Card, FieldLabel, Input, SectionHeader, Textarea } from '../../components/ui'
import { formatMaybe, type AtlasMetrics } from '../../lib/atlas'
import type { Weekday, WeekLog } from '../../types/atlas'

function linePath(values: Array<number | null>, width: number, height: number): string {
  const valid = values.filter((value): value is number => value !== null)
  if (!valid.length) return ''
  const padding = 8
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
  const bwPath = linePath(metrics.bodyweights, 300, 90)
  const sleepPath = linePath(metrics.sleep, 300, 90)

  return (
    <section id="atlas-weekly-tracker" className="space-y-4">
      <SectionHeader title="Weekly Tracker" subtitle="Bodyweight, nutrition, and recovery context that powers Atlas Insights." />

      <Card>
        <div className="grid gap-3 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Weekly Averages</p>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>Bodyweight: {formatMaybe(metrics.avgBodyweight, 1, ' lb')}</li>
              <li>Calories: {formatMaybe(metrics.avgCalories, 0, ' kcal')}</li>
              <li>Protein: {formatMaybe(metrics.avgProtein, 0, ' g')}</li>
              <li>Steps: {formatMaybe(metrics.avgSteps, 0, '')}</li>
              <li>Sleep: {formatMaybe(metrics.avgSleep, 1, ' hrs')}</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Trend: Bodyweight</p>
            <svg viewBox="0 0 300 90" width="100%" height="90">
              <path d={bwPath} fill="none" stroke="rgb(204,120,92)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Trend: Sleep</p>
            <svg viewBox="0 0 300 90" width="100%" height="90">
              <path d={sleepPath} fill="none" stroke="rgb(97,170,242)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {WEEK_DAYS.map((day) => (
          <Card key={day} className="space-y-2">
            <h3 className="font-semibold text-text-primary">{day}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <FieldLabel>Bodyweight</FieldLabel>
                <Input value={week.weekly[day].bw} onChange={(event) => onUpdateMetric(day, 'bw', event.target.value)} placeholder="lb" />
              </div>
              <div>
                <FieldLabel>Calories</FieldLabel>
                <Input
                  value={week.weekly[day].calories}
                  onChange={(event) => onUpdateMetric(day, 'calories', event.target.value)}
                  placeholder="kcal"
                />
              </div>
              <div>
                <FieldLabel>Protein</FieldLabel>
                <Input
                  value={week.weekly[day].protein}
                  onChange={(event) => onUpdateMetric(day, 'protein', event.target.value)}
                  placeholder="g"
                />
              </div>
              <div>
                <FieldLabel>Steps</FieldLabel>
                <Input
                  value={week.weekly[day].steps}
                  onChange={(event) => onUpdateMetric(day, 'steps', event.target.value)}
                  placeholder="steps"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Sleep</FieldLabel>
                <Input
                  value={week.weekly[day].sleep}
                  onChange={(event) => onUpdateMetric(day, 'sleep', event.target.value)}
                  placeholder="hrs"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Daily Note</FieldLabel>
                <Textarea
                  value={week.weekly[day].note}
                  onChange={(event) => onUpdateMetric(day, 'note', event.target.value)}
                  rows={2}
                  placeholder="Context"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <FieldLabel>Weekly Context Note</FieldLabel>
        <Textarea
          value={week.overviewNote}
          onChange={(event) => onUpdateOverviewNote(event.target.value)}
          rows={3}
          placeholder="What happened this week that may affect interpretation?"
        />
      </Card>
    </section>
  )
}
