import { ArrowDown, ArrowUp, Dumbbell, Plus, Sparkles, Weight } from 'lucide-react'
import { PROGRAM, WEEK_DAYS } from '../../data/program'
import { formatMaybe, getDayLogSummaries, type AtlasMetrics } from '../../lib/atlas'
import { Button, Card, Gauge, Pill, ProgressBars, Sparkline, StatCard } from '../../components/ui'
import type { TrainingDayId, WeekLog } from '../../types/atlas'

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

function TrendLine({ value }: { value: number | null }) {
  const down = value !== null && value < 0
  const neutral = value === null || value === 0
  const Icon = down ? ArrowDown : ArrowUp
  return (
    <div className={neutral ? 'text-text-secondary' : down ? 'text-error' : 'text-success'}>
      <div className="flex items-center gap-1 text-xs font-bold">
        {!neutral ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{value === null ? 'Add more data' : `${Math.abs(value).toFixed(1)} lb vs last week`}</span>
      </div>
    </div>
  )
}

export function DashboardSection({
  week,
  weekId,
  metrics,
  upcomingDay,
  onOpenLog,
  onOpenWeekly,
  onOpenInsights,
}: {
  week: WeekLog
  weekId: number
  metrics: AtlasMetrics
  upcomingDay: (typeof PROGRAM)[number] | null
  onOpenLog: (dayId?: TrainingDayId) => void
  onOpenWeekly: () => void
  onOpenInsights: () => void
}) {
  const daySummaries = getDayLogSummaries(week)
  const volume = computeSessionVolume(week)
  const nextDay = upcomingDay ?? PROGRAM[0]
  const coverageValues = PROGRAM.map((day) => {
    const summary = daySummaries[day.id]
    return Math.round((summary.loggedSets / Math.max(1, summary.totalSets)) * 100)
  })
  const readiness = metrics.avgReadiness === null ? 0 : Math.round((metrics.avgReadiness / 5) * 100)
  const sleepValue = metrics.avgSleep === null ? '-' : `${Math.floor(metrics.avgSleep)} h ${Math.round((metrics.avgSleep % 1) * 60)} m`

  return (
    <section id="atlas-dashboard" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Good morning, Tanvir</h2>
          <p className="mt-1 text-sm font-medium text-text-secondary">Here's your training overview for week {weekId}.</p>
        </div>
        <Pill className="text-accent-secondary">
          <Sparkles className="h-3.5 w-3.5" />
          AI coaching ready
        </Pill>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard label="Recovery Score" value={`${metrics.recoveryScore}`} detail="Good" tone="green">
          <Gauge value={metrics.recoveryScore} color="rgb(var(--color-success))" label="/100" />
        </StatCard>
        <StatCard label="Nutrition Compliance" value={`${metrics.nutritionCompliance}%`} detail="On track" tone="purple">
          <Gauge value={metrics.nutritionCompliance} color="rgb(var(--color-accent-secondary))" label="weekly" />
        </StatCard>
        <StatCard label="Bodyweight Trend" value={formatMaybe(metrics.avgBodyweight, 1, ' lb')} tone="purple">
          <div className="space-y-2">
            <Sparkline values={metrics.bodyweights} color="rgb(var(--color-accent-secondary))" />
            <TrendLine value={metrics.bwDelta} />
          </div>
        </StatCard>
        <StatCard label="Sleep (7-day avg)" value={sleepValue} detail="Good" tone="blue">
          <Gauge value={Math.min(100, ((metrics.avgSleep ?? 0) / 8) * 100)} color="rgb(var(--color-focus))" label="sleep" />
        </StatCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.15fr,0.85fr] 2xl:grid-cols-[1.05fr,0.95fr,0.95fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-text-secondary">Upcoming Workout</p>
              <h3 className="mt-4 text-lg font-bold text-text-primary">{nextDay.title}</h3>
              <p className="mt-1 text-sm font-semibold text-text-secondary">{nextDay.focus}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-secondary/12 text-accent-secondary">
              <Dumbbell className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-text-secondary">{nextDay.exercises.length} exercises • {nextDay.stress}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="min-w-40 flex-1" variant="primary" onClick={() => onOpenLog(nextDay.id)}>
              View Workout
            </Button>
            <Button variant="quiet" onClick={() => onOpenLog()}>
              Log
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-text-secondary">Split Coverage</p>
              <div className="mt-4 text-2xl font-bold text-text-primary">
                {metrics.completedSessions}
                <span className="text-sm text-text-secondary"> / {PROGRAM.length} days logged</span>
              </div>
            </div>
            <Pill>This week</Pill>
          </div>
          <ProgressBars values={coverageValues} labels={['M', 'T', 'W', 'T', 'F']} color="bg-success" />
          <Button className="mt-4 w-full" variant="quiet" onClick={onOpenWeekly}>
            View Split
          </Button>
        </Card>

        <Card className="lg:col-span-2 2xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-accent-secondary">AI Insight</p>
            <Pill className="text-accent-secondary">New</Pill>
          </div>
          <h3 className="mt-5 text-base font-bold text-text-primary">Great recovery and consistency this week.</h3>
          <p className="mt-3 text-sm font-medium leading-6 text-text-secondary">{metrics.summaryLine}</p>
          <Button className="mt-5 w-full border-accent-primary/20 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/15" onClick={onOpenInsights}>
            View Recommendations
          </Button>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <p className="text-[11px] font-bold text-text-secondary">Volume (7-day)</p>
          <div className="mt-4 text-2xl font-bold text-text-primary">{volume.toLocaleString()} <span className="text-sm text-text-secondary">lb</span></div>
          <Sparkline values={WEEK_DAYS.map((day, index) => (week.weekly[day].steps ? Number(week.weekly[day].steps) / 100 : null) ?? (index + 1) * 10)} color="rgb(var(--color-accent-primary))" />
        </Card>

        <Card>
          <p className="text-[11px] font-bold text-text-secondary">Session Readiness</p>
          <div className="mt-4 text-2xl font-bold text-success">{readiness >= 70 ? 'High' : readiness >= 45 ? 'Moderate' : 'Low'}</div>
          <p className="mt-1 text-sm font-semibold text-text-secondary">You're ready to train.</p>
          <Gauge value={readiness} color="rgb(var(--color-success))" label={`${readiness}%`} />
        </Card>

        <Card>
          <p className="text-[11px] font-bold text-text-secondary">Quick Actions</p>
          <div className="mt-3 space-y-2">
            <Button className="w-full justify-between border-accent-primary/20 bg-accent-primary/10 text-accent-primary" icon={Plus} onClick={() => onOpenLog(nextDay.id)}>
              Log Workout
            </Button>
            <Button className="w-full justify-between border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary" icon={Weight} onClick={onOpenWeekly}>
              Add Bodyweight
            </Button>
            <Button className="w-full justify-between border-success/20 bg-success/10 text-success" icon={Sparkles} onClick={onOpenInsights}>
              Open AI Coach
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
