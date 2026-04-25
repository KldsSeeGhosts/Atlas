import { useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Home,
  Menu,
  Moon,
  Settings,
  Sparkles,
} from 'lucide-react'
import { PROGRAM } from '../data/program'
import { useAtlasApp } from '../hooks/useAtlasApp'
import { Button, Card, IconButton, Pill, Textarea, ToastViewport } from '../components/ui'
import { formatMaybe, getDayLogSummaries } from '../lib/atlas'
import { cx } from '../lib/cx'
import { DashboardSection } from '../features/dashboard/DashboardSection'
import { TrainingLogSection } from '../features/logging/TrainingLogSection'
import { WeeklySection } from '../features/weekly/WeeklySection'
import { AnalysisSection } from '../features/analysis/AnalysisSection'
import { SettingsSection } from '../features/settings/SettingsSection'
import type { AppView, TrainingDayId } from '../types/atlas'
import type { LucideIcon } from 'lucide-react'

type NavTarget = AppView | 'settings-drawer'

const NAV_ITEMS: Array<{ id: NavTarget; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'logging', label: 'Training Log', icon: Dumbbell },
  { id: 'weekly', label: 'Weekly Tracker', icon: BarChart3 },
  { id: 'analysis', label: 'Insights', icon: Sparkles },
  { id: 'settings-drawer', label: 'Settings', icon: Settings },
]

function AtlasMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-9 w-9 rounded-full bg-accent-primary/15">
        <div className="absolute bottom-1.5 left-1.5 h-5 w-5 rounded-full bg-accent-primary" />
        <div className="absolute bottom-1.5 left-2.5 h-3 w-7 rotate-[-25deg] rounded-full bg-surface-1" />
      </div>
      <span className="text-xl font-semibold tracking-[0.3em] text-text-primary">ATLAS</span>
    </div>
  )
}

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
    <div className="fixed inset-0 z-50 flex justify-end bg-text-primary/35 backdrop-blur-sm">
      <button
        className="h-full flex-1 cursor-default"
        onClick={onClose}
        aria-label="Close settings panel"
      />
      <aside className="h-full w-full max-w-[560px] overflow-auto border-l border-text-primary/10 bg-bg p-4 shadow-warm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-text-secondary">Atlas</p>
            <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
          </div>
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

function AppNav({
  activeView,
  onSelect,
}: {
  activeView: AppView
  onSelect: (target: NavTarget) => void
}) {
  return (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = item.id === activeView
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              active
                ? 'border-accent-primary/20 bg-accent-primary/10 text-accent-primary'
                : 'border-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function MobileNav({
  activeView,
  onSelect,
}: {
  activeView: AppView
  onSelect: (target: NavTarget) => void
}) {
  return (
    <nav className="mobile-nav-safe fixed inset-x-0 bottom-0 z-40 border-t border-text-primary/10 bg-surface-1/95 px-2 pt-1 shadow-warm backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = item.id === activeView
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cx(
                'flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition',
                active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="leading-none">{item.label.replace(' Tracker', '').replace('Training ', '')}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function RightRail({
  activeDayId,
  onSelectDay,
  atlas,
}: {
  activeDayId: TrainingDayId
  onSelectDay: (dayId: TrainingDayId) => void
  atlas: ReturnType<typeof useAtlasApp>
}) {
  const daySummaries = useMemo(() => getDayLogSummaries(atlas.currentWeek), [atlas.currentWeek])
  const upcoming = atlas.upcomingDay ?? PROGRAM[0]
  const completed = atlas.metrics.completedSessions

  return (
    <aside className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-text-secondary">Today's Plan</p>
            <h3 className="mt-3 text-base font-bold text-text-primary">{upcoming.title}</h3>
            <p className="mt-1 text-xs font-semibold text-text-secondary">{upcoming.focus}</p>
          </div>
          <Pill className="shrink-0">Day {Math.min(completed + 1, PROGRAM.length)} of {PROGRAM.length}</Pill>
        </div>
        <div className="mt-4 space-y-2 text-xs font-semibold text-text-secondary">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>{upcoming.exercises.length} Exercises</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{daySummaries[upcoming.id].loggedSets}/{daySummaries[upcoming.id].totalSets} Sets Logged</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>{formatMaybe(atlas.metrics.avgSleep, 1, 'h')} avg sleep</span>
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          variant="quiet"
          onClick={() => {
            onSelectDay(upcoming.id)
            atlas.setActiveView('logging')
          }}
        >
          Open Workout
        </Button>
      </Card>

      <Card>
        <p className="text-[11px] font-bold text-text-secondary">Split This Week</p>
        <div className="mt-3 space-y-1">
          {PROGRAM.map((day) => {
            const summary = daySummaries[day.id]
            const percent = Math.round((summary.loggedSets / Math.max(1, summary.totalSets)) * 100)
            return (
              <button
                key={day.id}
                onClick={() => {
                  onSelectDay(day.id)
                  atlas.setActiveView('logging')
                }}
                className={cx(
                  'w-full rounded-xl p-2 text-left transition hover:bg-surface-2',
                  activeDayId === day.id && 'bg-surface-2',
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-text-primary">{day.day}</span>
                  <span className="font-semibold text-text-secondary">{percent}%</span>
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-text-secondary">{day.title}</p>
                <div className="mt-2 h-1 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent-primary" style={{ width: `${percent}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <p className="text-[11px] font-bold text-text-secondary">Snapshot</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="font-semibold text-text-secondary">Recovery</span>
            <strong className="text-text-primary">{atlas.metrics.recoveryScore}/100</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-semibold text-text-secondary">Nutrition Compliance</span>
            <strong className="text-text-primary">{atlas.metrics.nutritionCompliance}%</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-semibold text-text-secondary">Bodyweight</span>
            <strong className="text-text-primary">{formatMaybe(atlas.metrics.avgBodyweight, 1, ' lb')}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-semibold text-text-secondary">Sleep</span>
            <strong className="text-text-primary">{formatMaybe(atlas.metrics.avgSleep, 1, ' h')}</strong>
          </div>
        </div>
        <button
          className="mt-4 text-sm font-bold text-accent-secondary"
          onClick={() => atlas.setActiveView('analysis')}
        >
          View all insights
        </button>
      </Card>

      <Card>
        <p className="text-[11px] font-bold text-text-secondary">AI Goal</p>
        <Textarea value={atlas.currentWeek.aiGoal} rows={4} onChange={(event) => atlas.actions.updateAiGoal(event.target.value)} />
        <p className="mt-3 text-[11px] font-bold text-text-secondary">Priority Constraints</p>
        <Textarea
          value={atlas.currentWeek.aiPriority}
          rows={4}
          onChange={(event) => atlas.actions.updateAiPriority(event.target.value)}
        />
      </Card>
    </aside>
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

  const handleNavSelect = (target: NavTarget) => {
    if (target === 'settings-drawer') {
      setSettingsOpen(true)
      return
    }
    atlas.setActiveView(target)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1520px] gap-0 bg-bg md:p-4 xl:p-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[224px] shrink-0 flex-col rounded-l-app border border-r-0 border-text-primary/10 bg-surface-1 p-4 shadow-card md:flex xl:w-[248px]">
          <div className="mb-8 mt-1">
            <AtlasMark />
          </div>
          <AppNav activeView={atlas.activeView} onSelect={handleNavSelect} />
          <div className="mt-auto border-t border-text-primary/10 pt-4">
            <div className="flex items-center gap-3 rounded-2xl p-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-focus/10 text-sm font-bold text-focus">T</div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-text-primary">TANVIR</p>
                <p className="text-[11px] font-semibold text-text-secondary">Athlete</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden border-text-primary/10 bg-surface-1 shadow-card md:rounded-r-app md:border">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-text-primary/10 bg-surface-1/92 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <IconButton className="md:hidden" icon={Menu} label="Menu" onClick={() => setSettingsOpen(true)} />
              <div className="hidden md:block">
                <p className="text-[11px] font-bold text-text-secondary">Atlas</p>
                <h1 className="truncate text-xl font-bold text-text-primary">{activeNavLabel}</h1>
              </div>
              <div className="md:hidden">
                <AtlasMark />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill className="hidden text-accent-primary sm:inline-flex">
                <HeartPulse className="h-3.5 w-3.5" />
                Health Sync
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Connected
              </Pill>
              <div className="hidden items-center rounded-xl border border-text-primary/10 bg-surface-1 shadow-sm sm:flex">
                <IconButton icon={ChevronLeft} label="Previous week" className="h-9 w-9 border-0 shadow-none" onClick={atlas.actions.previousWeek} />
                <Pill className="border-0 shadow-none">Week {atlas.currentWeekId}</Pill>
                <IconButton icon={ChevronRight} label="Next week" className="h-9 w-9 border-0 shadow-none" onClick={atlas.actions.nextWeek} />
              </div>
              <IconButton className="hidden sm:inline-flex" icon={CalendarDays} label="Calendar" />
              <IconButton icon={Settings} label="Settings" onClick={() => setSettingsOpen(true)} />
            </div>
          </header>

          <div className="mobile-content-safe grid min-w-0 gap-4 px-4 py-4 md:px-6 md:pb-6 xl:grid-cols-[minmax(0,1fr),300px] 2xl:grid-cols-[minmax(0,1fr),320px]">
            <main className="min-w-0 space-y-4">
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
                  onOpenLog={(dayId) => {
                    if (dayId) setActiveTrainingDayId(dayId)
                    atlas.setActiveView('logging')
                  }}
                  onOpenWeekly={() => atlas.setActiveView('weekly')}
                  onOpenInsights={() => atlas.setActiveView('analysis')}
                />
              ) : null}
            </main>

            <div className="hidden xl:block">
              <RightRail activeDayId={activeTrainingDayId} onSelectDay={setActiveTrainingDayId} atlas={atlas} />
            </div>
          </div>
        </div>
      </div>

      <MobileNav activeView={atlas.activeView} onSelect={handleNavSelect} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} atlas={atlas} />
      <ToastViewport toasts={atlas.toasts} />
    </div>
  )
}
