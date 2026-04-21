import { useMemo } from 'react'
import { PROGRAM } from '../../data/program'
import { Button, Card, FieldLabel, Input, Pill, SectionHeader, Textarea } from '../../components/ui'
import { getDayLogSummaries } from '../../lib/atlas'
import { cx } from '../../lib/cx'
import type { TrainingDayId, WeekLog } from '../../types/atlas'

function rpeStyle(rpeValue: string): string {
  const rpe = Number.parseFloat(rpeValue)
  if (!Number.isFinite(rpe)) return 'border-text-primary/15'
  if (rpe >= 9) return 'border-error/50 bg-error/5'
  if (rpe >= 8) return 'border-accent-primary/50 bg-accent-primary/5'
  if (rpe >= 7) return 'border-accent-secondary/60 bg-accent-secondary/10'
  return 'border-focus/40 bg-focus/5'
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
        title="Training Log"
        subtitle="Single-day logging workspace with rapid day switching and split coverage visibility."
        rightSlot={
          <div className="flex items-center gap-2">
            <Button variant="quiet" onClick={goToPreviousDay}>
              Previous Day
            </Button>
            <Pill>
              {day.day} of {PROGRAM.length}
            </Pill>
            <Button variant="quiet" onClick={goToNextDay}>
              Next Day
            </Button>
          </div>
        }
      />

      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Jump To Training Day</p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {PROGRAM.map((programDay) => {
            const summary = daySummaries[programDay.id]
            return (
              <button
                key={programDay.id}
                onClick={() => onActiveDayChange(programDay.id)}
                className={cx(
                  'rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  programDay.id === day.id
                    ? 'border-accent-primary/50 bg-accent-primary/12'
                    : 'border-text-primary/15 bg-bg/70 hover:bg-surface-2/60',
                )}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{programDay.day}</div>
                <div className="font-semibold text-text-primary">{programDay.title}</div>
                <div className="mt-1 text-xs text-text-secondary">
                  {summary.loggedExercises}/{summary.totalExercises} lifts | {summary.loggedSets}/{summary.totalSets} sets
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="space-y-4 border-l-4" style={{ borderLeftColor: day.color }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{day.day}</p>
            <h3 className="font-display text-2xl text-text-primary">{day.title}</h3>
            <p className="text-sm text-text-secondary">{day.description}</p>
          </div>
          <div className="rounded-lg border border-text-primary/10 bg-bg/60 px-3 py-2 text-sm text-text-secondary">
            <strong className="text-text-primary">{day.focus}</strong>
            <div>Stress: {day.stress}</div>
            <div className="mt-1 text-xs">
              Logged {daySummaries[day.id].loggedExercises}/{daySummaries[day.id].totalExercises} lifts
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <FieldLabel>Date</FieldLabel>
            <Input
              value={session.date}
              onChange={(event) => onUpdateSessionField(day.id, 'date', event.target.value)}
              placeholder="MM/DD"
            />
          </div>
          <div>
            <FieldLabel>Bodyweight</FieldLabel>
            <Input
              value={session.bodyweight}
              onChange={(event) => onUpdateSessionField(day.id, 'bodyweight', event.target.value)}
              placeholder="lb"
            />
          </div>
          <div>
            <FieldLabel>Sleep</FieldLabel>
            <Input
              value={session.sleep}
              onChange={(event) => onUpdateSessionField(day.id, 'sleep', event.target.value)}
              placeholder="hrs"
            />
          </div>
          <div>
            <FieldLabel>Readiness</FieldLabel>
            <Input
              value={session.readiness}
              onChange={(event) => onUpdateSessionField(day.id, 'readiness', event.target.value)}
              placeholder="1-5"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <FieldLabel>Session Notes</FieldLabel>
            <Textarea
              value={session.sessionNotes}
              onChange={(event) => onUpdateSessionField(day.id, 'sessionNotes', event.target.value)}
              rows={2}
              placeholder="How did this day feel?"
            />
          </div>
        </div>

        <div className="space-y-3">
          {day.exercises.map((exercise, exerciseIndex) => (
            <Card key={exercise.name} className="bg-bg/45">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-text-primary">{exercise.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {exercise.scheme} | {exercise.rest} | {exercise.target}
                  </p>
                </div>
                <p className="max-w-sm text-xs text-text-secondary">{exercise.cue}</p>
              </div>

              <div className="mt-3 grid gap-2">
                {session.exercises[exerciseIndex].sets.map((set, setIndex) => (
                  <div
                    key={`${exercise.name}-${setIndex}`}
                    className={`grid gap-2 rounded-lg border p-2 md:grid-cols-[90px,1fr,1fr,1fr,2fr] ${rpeStyle(set.rpe)}`}
                  >
                    <div className="self-center text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Set {setIndex + 1}
                    </div>
                    <Input
                      value={set.weight}
                      onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'weight', event.target.value)}
                      placeholder="Weight"
                    />
                    <Input
                      value={set.reps}
                      onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'reps', event.target.value)}
                      placeholder="Reps"
                    />
                    <Input
                      value={set.rpe}
                      onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'rpe', event.target.value)}
                      placeholder="RPE"
                    />
                    <Input
                      value={set.note}
                      onChange={(event) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'note', event.target.value)}
                      placeholder="Notes"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <FieldLabel>Exercise Notes</FieldLabel>
                <Textarea
                  value={session.exercises[exerciseIndex].exerciseNotes}
                  onChange={(event) => onUpdateExerciseNote(day.id, exerciseIndex, event.target.value)}
                  rows={2}
                  placeholder="Technique cues, setup reminders, pain notes"
                />
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  )
}
