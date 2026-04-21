import { useMemo, useState } from 'react'
import { PROGRAM } from '../data/program'
import { useAtlasApp } from '../hooks/useAtlasApp'
import { Button, Card, Pill, Textarea, ToastViewport } from '../components/ui'
import { formatMaybe, getDayLogSummaries } from '../lib/atlas'
import { cx } from '../lib/cx'
import { DashboardSection } from '../features/dashboard/DashboardSection'
import { TrainingLogSection } from '../features/logging/TrainingLogSection'
import { WeeklySection } from '../features/weekly/WeeklySection'
import { AnalysisSection } from '../features/analysis/AnalysisSection'
import { SettingsSection } from '../features/settings/SettingsSection'
import type { AppView, TrainingDayId } from '../types/atlas'

const NAV_ITEMS: Array<{ id: AppView; label: string; subtitle: string }> = [
  { id: 'dashboard', label: 'Dashboard', subtitle: 'Weekly pulse' },
  { id: 'logging', label: 'Training Log', subtitle: '5-day split' },
  { id: 'weekly', label: 'Weekly Tracker', subtitle: 'Recovery + nutrition' },
  { id: 'analysis', label: 'Atlas Insights', subtitle: 'AI workspace' },
]

function SettingsDrawer({
  open,
  onClose,
  atlas,
}: {
  open: boolean
  onClose: () => void
  atlas: ReturnType<typeof useAtlasApp>
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[1px]">
      <button
        className="h-full flex-1 cursor-default"
        onClick={onClose}
        aria-label="Close settings panel"
      />
      <aside className="h-full w-full max-w-[560px] overflow-auto border-l border-text-primary/15 bg-bg p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-text-primary">Atlas Settings</h2>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </div>
        <SettingsSection
          state={atlas.state}
          onUpdateThemeMode={atlas.actions.updateThemeMode}
          onUpdateSettings={atlas.actions.updateSettings}
          onExportData={atlas.actions.exportAtlasData}
          onImportData={atlas.actions.importAtlasData}
          onClearCurrentWeek={atlas.actions.clearCurrentWeek}
          onResetAll={atlas.actions.resetAtlasData}
        />
      </aside>
    </div>
  )
}

export default function App() {
  const atlas = useAtlasApp()
  const [activeTrainingDayId, setActiveTrainingDayId] = useState<TrainingDayId>('pull')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const activeNavLabel = useMemo(
    () => NAV_ITEMS.find((item) => item.id === atlas.activeView)?.label ?? 'Dashboard',
    [atlas.activeView],
  )

  const daySummaries = useMemo(() => getDayLogSummaries(atlas.currentWeek), [atlas.currentWeek])

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[260px,minmax(0,1fr),320px] lg:px-6">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <Card className="h-full bg-surface-1/95">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">Atlas</p>
              <h1 className="mt-2 font-display text-3xl leading-tight text-text-primary">Training Intelligence</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Local-first logging, recovery context, and model-aware analysis.
              </p>
            </div>
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => atlas.setActiveView(item.id)}
                  className={cx(
                    'w-full rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                    atlas.activeView === item.id
                      ? 'border-accent-primary/45 bg-accent-primary/10'
                      : 'border-text-primary/10 bg-bg/30 hover:bg-bg/55',
                  )}
                >
                  <div className="font-semibold text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-secondary">{item.subtitle}</div>
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        <main className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 bg-surface-1/95">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Workspace</p>
              <h2 className="font-display text-2xl text-text-primary">{activeNavLabel}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={atlas.actions.previousWeek} aria-label="Previous week">
                Previous
              </Button>
              <Pill>Week {atlas.currentWeekId}</Pill>
              <Button onClick={atlas.actions.nextWeek} aria-label="Next week">
                Next
              </Button>
            </div>
          </Card>

          {atlas.activeView === 'logging' ? (
            <TrainingLogSection
              week={atlas.currentWeek}
              activeDayId={activeTrainingDayId}
              onActiveDayChange={setActiveTrainingDayId}
              onUpdateSessionField={atlas.actions.updateSessionField}
              onUpdateExerciseNote={atlas.actions.updateExerciseNote}
              onUpdateSetField={atlas.actions.updateSetField}
            />
          ) : null}

          {atlas.activeView === 'weekly' ? (
            <WeeklySection
              week={atlas.currentWeek}
              metrics={atlas.metrics}
              onUpdateMetric={atlas.actions.updateWeeklyMetric}
              onUpdateOverviewNote={atlas.actions.updateOverviewNote}
            />
          ) : null}

          {atlas.activeView === 'analysis' ? (
            <AnalysisSection
              state={atlas.state}
              weekId={atlas.currentWeekId}
              onUpdateSettings={atlas.actions.updateSettings}
              onCopy={atlas.actions.copyToClipboard}
            />
          ) : null}

          {atlas.activeView === 'dashboard' ? (
            <DashboardSection
              week={atlas.currentWeek}
              weekId={atlas.currentWeekId}
              metrics={atlas.metrics}
              upcomingDay={atlas.upcomingDay}
            />
          ) : null}
        </main>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-auto">
          <Card className="bg-surface-1/95">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Current Week Snapshot</p>
            <div className="mt-3 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Recovery</span>
                <strong className="text-text-primary">{atlas.metrics.recoveryScore}</strong>
              </div>
              <div className="flex justify-between">
                <span>Nutrition Compliance</span>
                <strong className="text-text-primary">{atlas.metrics.nutritionCompliance}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Bodyweight Avg</span>
                <strong className="text-text-primary">{formatMaybe(atlas.metrics.avgBodyweight, 1, ' lb')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Bench e1RM</span>
                <strong className="text-text-primary">{formatMaybe(atlas.metrics.benchE1RM, 1, ' lb')}</strong>
              </div>
            </div>
          </Card>

          <Card className="bg-surface-1/95">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Controls</p>
            <Button className="mt-2 w-full" variant="quiet" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
              </svg>
              Settings
            </Button>
          </Card>

          <Card className="bg-surface-1/95">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Split Coverage</p>
            <div className="mt-2 space-y-2">
              {PROGRAM.map((day) => {
                const summary = daySummaries[day.id]
                const selected = activeTrainingDayId === day.id
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      setActiveTrainingDayId(day.id)
                      atlas.setActiveView('logging')
                    }}
                    className={cx(
                      'w-full rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                      selected ? 'border-accent-primary/50 bg-accent-primary/12' : 'border-text-primary/10 bg-bg/40 hover:bg-bg/60',
                    )}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{day.day}</div>
                    <div className="font-semibold text-text-primary">{day.title}</div>
                    <div className="text-xs text-text-secondary">
                      {summary.loggedExercises}/{summary.totalExercises} lifts, {summary.loggedSets}/{summary.totalSets} sets
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="bg-surface-1/95">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">AI Goal</p>
            <Textarea value={atlas.currentWeek.aiGoal} rows={4} onChange={(event) => atlas.actions.updateAiGoal(event.target.value)} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Priority Constraints</p>
            <Textarea
              value={atlas.currentWeek.aiPriority}
              rows={4}
              onChange={(event) => atlas.actions.updateAiPriority(event.target.value)}
            />
          </Card>
        </aside>
      </div>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} atlas={atlas} />
      <ToastViewport toasts={atlas.toasts} />
    </div>
  )
}
