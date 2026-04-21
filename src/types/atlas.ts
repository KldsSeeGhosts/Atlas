export type ThemeMode = 'light' | 'dark' | 'system'

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export type TrainingDayId = 'pull' | 'push' | 'legs' | 'upper' | 'arms'

export interface ExerciseTemplate {
  name: string
  scheme: string
  rest: string
  target: string
  cue: string
  sets: number
}

export interface TrainingDayTemplate {
  id: TrainingDayId
  day: string
  title: string
  focus: string
  stress: string
  description: string
  color: string
  exercises: ExerciseTemplate[]
}

export interface SetLog {
  weight: string
  reps: string
  rpe: string
  note: string
}

export interface ExerciseLog {
  name: string
  exerciseNotes: string
  sets: SetLog[]
}

export interface SessionLog {
  date: string
  bodyweight: string
  sleep: string
  readiness: string
  sessionNotes: string
  exercises: ExerciseLog[]
}

export interface DailyWeeklyMetric {
  bw: string
  calories: string
  protein: string
  steps: string
  sleep: string
  note: string
}

export interface WeekLog {
  overviewNote: string
  aiGoal: string
  aiPriority: string
  weekly: Record<Weekday, DailyWeeklyMetric>
  sessions: Record<TrainingDayId, SessionLog>
}

export interface AnalysisSettings {
  endpointUrl: string
  model: string
  authToken: string
  systemPrompt: string
  timeoutMs: number
}

export interface AtlasState {
  schemaVersion: number
  currentWeek: number
  themeMode: ThemeMode
  settings: AnalysisSettings
  weeks: Record<string, WeekLog>
}

export interface AtlasExportEnvelope {
  appName: 'Atlas'
  schemaVersion: number
  exportedAt: string
  state: AtlasState
}

export interface LegacyAiGainsLikeState {
  currentWeek?: number
  settings?: {
    endpoint?: string
    model?: string
    systemPrompt?: string
  }
  weeks?: Record<string, unknown>
}

export type AppView = 'dashboard' | 'logging' | 'weekly' | 'analysis' | 'settings'
