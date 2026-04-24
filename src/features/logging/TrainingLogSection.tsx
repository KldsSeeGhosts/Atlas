import { useMemo } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PROGRAM } from '../../data/program'
import { Button, Card, FieldLabel, Input, Pill, SectionHeader, Textarea } from '../../components/ui'
import { getDayLogSummaries } from '../../lib/atlas'
import { cx } from '../../lib/cx'
import type { TrainingDayId, WeekLog } from '../../types/atlas'

function rpeStyle(rpeValue: string): string {
  const rpe = Number.parseFloat(rpeValue)
  if (!Number.isFinite(rpe)) return 'border-text-primary/10 bg-surface-1'
  if (rpe >= 9) return 'border-error/30 bg-error/5'
  if (rpe >= 8) return 'border-accent-primary/30 bg-accent-primary/5'
  if (rpe >= 7) return 'border-accent-warm/40 bg-accent-warm/10'
  return 'border-focus/30 bg-focus/5'
}

export function TrainingLogSection({
  week,
  activeDayId,
  onActiveDayChange,
  onUpdateSessionField,
  onUpdateExerciseNote,
  onUpdateSetField,
}: {
  week: WeekLog
  activeDayId: TrainingDayId
  onActiveDayChange: (dayId: TrainingDayId) => void
  onUpdateSessionField: (dayId: TrainingDayId, key: 'date' | 'bodyweight' | 'sleep' | 'readiness' | 'sessionNotes', value: string) => void
  onUpdateExerciseNote: (dayId: TrainingDayId, exerciseIndex: number, value: string) => void
  onUpdateSetField: (dayId: TrainingDayId, exerciseIndex: number, setIndex: number, key: 'weight' | 'reps' | 'rpe' | 'note', value: string) => void
}) {
  const dayIndex = useMemo(
    () => Math.max(0, PROGRAM.findIndex((day) => day.id === activeDayId)),
    [activeDayId],
  )
  const day = PROGRAM[dayIndex]
  const session = week.sessions[day.id]
  const daySummaries = useMemo(() => getDayLogSummaries(week), [week])
  const activeSummary = daySummaries[day.id]
  const progress = Math.round((activeSummary.loggedSets / Math.max(1, activeSummary.totalSets)) * 100)

  const goToPreviousDay = () => {
    const nextIndex = (dayIndex - 1 + PROGRAM.length) % PROGRAM.length
    onActiveDayChange(PROGRAM[nextIndex].id)
  }

  const goToNextDay = () => {
    const nextIndex = (dayIndex + 1) % PROGRAM.length
    onActiveDayChange(PROGRAM[nextIndex].id)
  }

  return (
    <section id="atlas-training-log" className="space-y-4">
      <SectionHeader
        title="Log Workout"
        subtitle="Compact set logging with the current split always one tap away."
        rightSlot={
          <div className="flex items-center gap-2">
            <Button variant="quiet" icon={ArrowLeft} onClick={goToPreviousDay}>
              Back
            </Button>
            <Button variant="primary" icon={ArrowRight} onClick={goToNextDay}>
              Next Day
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden border-accent-primary/20 bg-gradient-to-br from-accent-primary/10 to-surface-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">{day.day} of {PROGRAM.length}</p>
            <h3 className="mt-2 text-2xl font-bold text-text-primary">{day.title}</h3>
            <p className="mt-1 text-sm font-semibold text-text-secondary">{day.focus}</p>
          </div>
          <Pill>{progress}% logged</Pill>
        </div>
        <div className="mt-5 h-2 rounded-full bg-surface-1">
          <div className="h-full rounded-full bg-accent-primary" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div>
            <FieldLabel>Date</FieldLabel>
            <Input value={session.date} onChange={(event) => onUpdateSessionField(day.id, 'date', event.target.value)} placeholder="MM/DD" />
          </div>
          <div>
            <FieldLabel>Bodyweight</FieldLabel>
            <Input value={session.bodyweight} onChange={(event) => onUpdateSessionField(day.id, 'bodyweight', event.target.value)} placeholder="lb" />
          </div>
          <div>
            <FieldLabel>Sleep</FieldLabel>
            <Input value={session.sleep} onChange={(event) => onUpdateSessionField(day.id, 'sleep', event.target.value)} placeholder="hrs" />
          </div>
          <div>
            <FieldLabel>Readiness</FieldLabel>
            <Input value={session.readiness} onChange={(event) => onUpdateSessionField(day.id, 'readiness', event.target.value)} placeholder="1-5" />
          </div>
          <div className="md:col-span-1">
            <FieldLabel>Session Notes</FieldLabel>
            <Textarea value={session.sessionNotes} onChange={(event) => onUpdateSessionField(day.id, 'sessionNotes', event.target.value)} rows={2} placeholder="Feel, pain, energy" />
          </div>
        </div>
      </Card>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-5">
          {PROGRAM.map((programDay) => {
            const summary = daySummaries[programDay.id]
            const selected = programDay.id === day.id
            return (
              <button
                key={programDay.id}
                onClick={() => onActiveDayChange(programDay.id)}
                className={cx(
                  'w-44 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:w-auto',
                  selected ? 'border-accent-primary/30 bg-accent-primary/10' : 'border-text-primary/10 bg-surface-1 hover:bg-surface-2',
                )}
              >
                <div className="text-[11px] font-bold text-text-secondary">{programDay.day}</div>
                <div className="mt-1 truncate text-sm font-bold text-text-primary">{programDay.title}</div>
                <div className="mt-2 text-xs font-semibold text-text-secondary">
                  {summary.loggedSets}/{summary.totalSets} sets
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {day.exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.name} className="p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-text-primary/10 p-4">
              <div>
                <h4 className="text-base font-bold text-text-primary">{exerciseIndex + 1}. {exercise.name}</h4>
                <p className="mt-1 text-xs font-semibold text-text-secondary">{exercise.scheme} • {exercise.rest} • {exercise.target}</p>
              </div>
              <Pill className="bg-accent-secondary/10 text-accent-secondary">Last: {exercise.scheme}</Pill>
            </div>

            <div className="space-y-2 p-4">
              {session.exercises[exerciseIndex].sets.map((set, setIndex) => (
                <div
                  key={`${exercise.name}-${setIndex}`}
                  className={cx('grid gap-2 rounded-2xl border p-2 md:grid-cols-[72px,1fr,1fr,1fr,1.5fr]', rpeStyle(set.rpe))}
                >
                  <div className="flex items-center md:justify-start">
                    <span className="grid h-8 min-w-14 place-items-center rounded-full border border-text-primary/10 bg-surface-1 text-xs font-bold text-text-secondary">
                      Set {setIndex + 1}
                    </span>
                  </div>
                  <Input value={set.weight} onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'weight', event.target.value)} placeholder="Weight" />
                  <Input value={set.reps} onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'reps', event.target.value)} placeholder="Reps" />
                  <Input value={set.rpe} onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'rpe', event.target.value)} placeholder="RPE" />
                  <Input value={set.note} onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'note', event.target.value)} placeholder="Notes" />
                </div>
              ))}

              <div>
                <FieldLabel>Exercise Notes</FieldLabel>
                <Textarea value={session.exercises[exerciseIndex].exerciseNotes} onChange={(event) => onUpdateExerciseNote(day.id, exerciseIndex, event.target.value)} rows={2} placeholder={exercise.cue} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
