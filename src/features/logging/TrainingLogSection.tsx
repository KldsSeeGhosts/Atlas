import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronsRight } from 'lucide-react'
import { PROGRAM } from '../../data/program'
import { Button, Card, FieldLabel, InlineWheelField, Input, Pill, SectionHeader, Textarea } from '../../components/ui'
import { getDayLogSummaries } from '../../lib/atlas'
import { cx } from '../../lib/cx'
import type { SetLog, TrainingDayId, WeekLog } from '../../types/atlas'

type EditableSetKey = 'weight' | 'reps' | 'rpe'

interface SetFieldConfig {
  key: EditableSetKey
  label: string
  min: number
  max: number
  step: number
  unit?: string
}

function rpeStyle(rpeValue: string): string {
  const rpe = Number.parseFloat(rpeValue)
  if (!Number.isFinite(rpe)) return 'border-text-primary/10 bg-surface-1'
  if (rpe >= 9) return 'border-error/30 bg-error/5'
  if (rpe >= 8) return 'border-accent-primary/30 bg-accent-primary/5'
  if (rpe >= 7) return 'border-accent-warm/40 bg-accent-warm/10'
  return 'border-focus/30 bg-focus/5'
}

function isVisibleSetLogged(set: SetLog): boolean {
  return Boolean(set.weight || set.reps || set.rpe)
}

function setFieldConfig(key: EditableSetKey): SetFieldConfig {
  if (key === 'weight') {
    return { key, label: 'Weight', min: 0, max: 500, step: 2.5, unit: 'lb' }
  }
  if (key === 'reps') {
    return { key, label: 'Reps', min: 0, max: 50, step: 1 }
  }
  return { key, label: 'RPE', min: 5, max: 10, step: 0.5 }
}

function SetValueField({
  config,
  value,
  onChange,
}: {
  config: SetFieldConfig
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="px-0.5 md:hidden">
        <span className="block text-[10px] font-bold uppercase leading-tight tracking-wide text-text-secondary">{config.label}</span>
      </div>
      <div className="md:hidden">
        <InlineWheelField
          key={`${config.key}-${value}`}
          value={value}
          min={config.min}
          max={config.max}
          step={config.step}
          unit={config.unit}
          onCommit={onChange}
        />
      </div>
      <label className="hidden md:block">
        <span className="mb-1 block text-[10px] font-bold uppercase leading-tight tracking-wide text-text-secondary">{config.label}</span>
        <Input
          value={value}
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder={config.unit ?? config.label}
          autoCorrect="off"
          autoCapitalize="none"
        />
      </label>
    </div>
  )
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
  const [activeExercise, setActiveExercise] = useState<{ dayId: TrainingDayId; index: number }>({ dayId: activeDayId, index: 0 })
  const dayIndex = useMemo(
    () => Math.max(0, PROGRAM.findIndex((day) => day.id === activeDayId)),
    [activeDayId],
  )
  const day = PROGRAM[dayIndex]
  const session = week.sessions[day.id]
  const daySummaries = useMemo(() => getDayLogSummaries(week), [week])
  const activeSummary = daySummaries[day.id]
  const progress = Math.round((activeSummary.loggedSets / Math.max(1, activeSummary.totalSets)) * 100)
  const activeExerciseIndex = activeExercise.dayId === activeDayId ? activeExercise.index : 0
  const exerciseIndex = Math.min(activeExerciseIndex, day.exercises.length - 1)
  const exercise = day.exercises[exerciseIndex]
  const exerciseLog = session.exercises[exerciseIndex]
  const exerciseLoggedSets = exerciseLog.sets.filter(isVisibleSetLogged).length

  const selectDay = (dayId: TrainingDayId) => {
    setActiveExercise({ dayId, index: 0 })
    onActiveDayChange(dayId)
  }

  const goToPreviousDay = () => {
    const nextIndex = (dayIndex - 1 + PROGRAM.length) % PROGRAM.length
    selectDay(PROGRAM[nextIndex].id)
  }

  const goToNextDay = () => {
    const nextIndex = (dayIndex + 1) % PROGRAM.length
    selectDay(PROGRAM[nextIndex].id)
  }

  const goToPreviousExercise = () => {
    setActiveExercise((current) => ({ dayId: activeDayId, index: Math.max(0, current.dayId === activeDayId ? current.index - 1 : 0) }))
  }

  const goToNextExerciseOrDay = () => {
    if (exerciseIndex < day.exercises.length - 1) {
      setActiveExercise((current) => ({ dayId: activeDayId, index: (current.dayId === activeDayId ? current.index : 0) + 1 }))
      return
    }
    goToNextDay()
  }

  return (
    <section id="atlas-training-log" className="space-y-4">
      <SectionHeader
        title="Log Workout"
        subtitle="One exercise at a time, fast set entry, less thumb travel."
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
        <div className="mt-5 grid grid-cols-4 gap-2 md:hidden">
          <div className="rounded-xl border border-text-primary/10 bg-surface-1/75 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase text-text-secondary">Date</p>
            <p className="mt-1 truncate text-sm font-bold text-text-primary">{session.date || '-'}</p>
          </div>
          <div className="rounded-xl border border-text-primary/10 bg-surface-1/75 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase text-text-secondary">BW</p>
            <p className="mt-1 truncate text-sm font-bold text-text-primary">{session.bodyweight || '-'}</p>
          </div>
          <div className="rounded-xl border border-text-primary/10 bg-surface-1/75 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase text-text-secondary">Sleep</p>
            <p className="mt-1 truncate text-sm font-bold text-text-primary">{session.sleep || '-'}</p>
          </div>
          <div className="rounded-xl border border-text-primary/10 bg-surface-1/75 px-2.5 py-2">
            <p className="text-[10px] font-bold uppercase text-text-secondary">Ready</p>
            <p className="mt-1 truncate text-sm font-bold text-text-primary">{session.readiness || '-'}</p>
          </div>
        </div>

        <details className="mt-3 rounded-2xl border border-text-primary/10 bg-surface-1/75 p-3 md:hidden">
          <summary className="cursor-pointer text-sm font-bold text-text-primary">Edit session details</summary>
          <div className="mt-3 grid gap-3">
            <div>
              <FieldLabel>Date</FieldLabel>
              <Input value={session.date} onChange={(event) => onUpdateSessionField(day.id, 'date', event.target.value)} placeholder="MM/DD" autoCorrect="off" autoCapitalize="none" />
            </div>
            <div>
              <FieldLabel>Bodyweight</FieldLabel>
              <Input value={session.bodyweight} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'bodyweight', event.target.value)} placeholder="lb" autoCorrect="off" autoCapitalize="none" />
            </div>
            <div>
              <FieldLabel>Sleep</FieldLabel>
              <Input value={session.sleep} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'sleep', event.target.value)} placeholder="hrs" autoCorrect="off" autoCapitalize="none" />
            </div>
            <div>
              <FieldLabel>Readiness</FieldLabel>
              <Input value={session.readiness} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'readiness', event.target.value)} placeholder="1-5" autoCorrect="off" autoCapitalize="none" />
            </div>
            <div>
              <FieldLabel>Session Notes</FieldLabel>
              <Textarea value={session.sessionNotes} onChange={(event) => onUpdateSessionField(day.id, 'sessionNotes', event.target.value)} rows={2} placeholder="Feel, pain, energy" autoCorrect="on" />
            </div>
          </div>
        </details>

        <div className="mt-5 hidden gap-3 md:grid md:grid-cols-5">
          <div>
            <FieldLabel>Date</FieldLabel>
            <Input value={session.date} onChange={(event) => onUpdateSessionField(day.id, 'date', event.target.value)} placeholder="MM/DD" autoCorrect="off" autoCapitalize="none" />
          </div>
          <div>
            <FieldLabel>Bodyweight</FieldLabel>
            <Input value={session.bodyweight} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'bodyweight', event.target.value)} placeholder="lb" autoCorrect="off" autoCapitalize="none" />
          </div>
          <div>
            <FieldLabel>Sleep</FieldLabel>
            <Input value={session.sleep} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'sleep', event.target.value)} placeholder="hrs" autoCorrect="off" autoCapitalize="none" />
          </div>
          <div>
            <FieldLabel>Readiness</FieldLabel>
            <Input value={session.readiness} inputMode="decimal" onChange={(event) => onUpdateSessionField(day.id, 'readiness', event.target.value)} placeholder="1-5" autoCorrect="off" autoCapitalize="none" />
          </div>
          <div className="md:col-span-1">
            <FieldLabel>Session Notes</FieldLabel>
            <Textarea value={session.sessionNotes} onChange={(event) => onUpdateSessionField(day.id, 'sessionNotes', event.target.value)} rows={2} placeholder="Feel, pain, energy" />
          </div>
        </div>
      </Card>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="ios-momentum no-scrollbar flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-5">
          {PROGRAM.map((programDay) => {
            const summary = daySummaries[programDay.id]
            const selected = programDay.id === day.id
            return (
              <button
                key={programDay.id}
                onClick={() => selectDay(programDay.id)}
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

      <div className="sticky top-[74px] z-20 -mx-4 border-y border-text-primary/10 bg-bg/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">Exercise Focus</p>
          <Pill>
            {exerciseIndex + 1}/{day.exercises.length}
          </Pill>
        </div>
        <div className="ios-momentum no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {day.exercises.map((programExercise, index) => {
            const loggedSets = session.exercises[index].sets.filter(isVisibleSetLogged).length
            const selected = index === exerciseIndex
            return (
              <button
                key={programExercise.name}
                type="button"
                onClick={() => setActiveExercise({ dayId: activeDayId, index })}
                className={cx(
                  'flex min-w-[82px] flex-col items-center rounded-xl border px-2.5 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  selected ? 'border-accent-secondary/35 bg-accent-secondary/10 text-accent-secondary' : 'border-text-primary/10 bg-surface-1 text-text-secondary',
                )}
              >
                <span className="text-sm font-bold">{index + 1}</span>
                <span className="mt-1 max-w-[64px] truncate text-[10px] font-bold">{programExercise.name}</span>
                <span className="mt-1 text-[10px] font-semibold">{loggedSets}/{programExercise.sets}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Card className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-text-primary/10 p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">Exercise {exerciseIndex + 1}</p>
            <h4 className="mt-1 text-xl font-bold text-text-primary">{exercise.name}</h4>
            <p className="mt-1 text-xs font-semibold text-text-secondary">{exercise.scheme} | {exercise.rest} | {exercise.target}</p>
          </div>
          <Pill className="bg-accent-secondary/10 text-accent-secondary">
            {exerciseLoggedSets}/{exercise.sets} sets
          </Pill>
        </div>

        <div className="space-y-2.5 p-3 md:space-y-3 md:p-4">
          {exerciseLog.sets.map((set, setIndex) => (
            <div key={`${exercise.name}-${setIndex}`} className={cx('rounded-2xl border p-2.5 md:p-3', rpeStyle(set.rpe))}>
              <div className="mb-2 flex items-center justify-between gap-3 md:mb-3">
                <span className="grid h-8 min-w-14 place-items-center rounded-full border border-text-primary/10 bg-surface-1 text-xs font-bold text-text-secondary">
                  Set {setIndex + 1}
                </span>
                <span className="text-xs font-bold text-text-secondary">{isVisibleSetLogged(set) ? 'Logged' : 'Empty'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                <SetValueField
                  config={setFieldConfig('weight')}
                  value={set.weight}
                  onChange={(value) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'weight', value)}
                />
                <SetValueField
                  config={setFieldConfig('reps')}
                  value={set.reps}
                  onChange={(value) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'reps', value)}
                />
                <SetValueField
                  config={setFieldConfig('rpe')}
                  value={set.rpe}
                  onChange={(value) => onUpdateSetField(day.id, exerciseIndex, setIndex, 'rpe', value)}
                />
              </div>
            </div>
          ))}

          <div>
            <FieldLabel>Exercise Notes</FieldLabel>
            <Textarea value={exerciseLog.exerciseNotes} onChange={(event) => onUpdateExerciseNote(day.id, exerciseIndex, event.target.value)} rows={3} placeholder={exercise.cue} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="quiet" icon={ArrowLeft} onClick={goToPreviousExercise} disabled={exerciseIndex === 0}>
              Previous Exercise
            </Button>
            <Button variant="primary" icon={exerciseIndex === day.exercises.length - 1 ? ChevronsRight : ArrowRight} onClick={goToNextExerciseOrDay}>
              {exerciseIndex === day.exercises.length - 1 ? 'Next Day' : 'Next Exercise'}
            </Button>
          </div>
        </div>
      </Card>

    </section>
  )
}
