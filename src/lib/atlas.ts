import { PROGRAM, WEEK_DAYS } from '../data/program'
import type {
  AnalysisSettings,
  AtlasExportEnvelope,
  AtlasState,
  DailyWeeklyMetric,
  ExerciseLog,
  LegacyAiGainsLikeState,
  SetLog,
  SessionLog,
  ThemeMode,
  TrainingDayId,
  WeekLog,
  Weekday,
} from '../types/atlas'

export const ATLAS_SCHEMA_VERSION = 1
export const ATLAS_STORAGE_KEY = 'atlas.appState.v1'
export const LEGACY_STORAGE_KEY = 'aigains_atelier_v1'

const DEFAULT_ANALYSIS_SETTINGS: AnalysisSettings = {
  endpointUrl: 'http://127.0.0.1:8082/v1/chat/completions',
  model: 'qwen3.6-35b',
  authToken: '',
  timeoutMs: 30000,
  systemPrompt:
    'You are a precise training analyst. Recommend next-session load, rep target, and whether to hold, push, or trim fatigue. Consider bodyweight trend, recovery, and the user preference for simple, repeatable lifts.',
}

export interface AtlasMetrics {
  avgBodyweight: number | null
  avgSleep: number | null
  avgCalories: number | null
  avgProtein: number | null
  avgSteps: number | null
  avgRpe: number | null
  avgReadiness: number | null
  completedSessions: number
  totalLoggedSets: number
  benchE1RM: number | null
  bwDelta: number | null
  proteinTargetRatio: number | null
  recoveryScore: number
  nutritionCompliance: number
  bodyweights: Array<number | null>
  sleep: Array<number | null>
  calories: Array<number | null>
  steps: Array<number | null>
  summaryLine: string
}

export interface DayLogSummary {
  loggedExercises: number
  totalExercises: number
  loggedSets: number
  totalSets: number
  sessionLogged: boolean
}

function makeSetLog(): SetLog {
  return { weight: '', reps: '', rpe: '', note: '' }
}

function makeExerciseLog(name: string, setCount: number): ExerciseLog {
  return {
    name,
    exerciseNotes: '',
    sets: Array.from({ length: setCount }, makeSetLog),
  }
}

function makeWeekMetric(): DailyWeeklyMetric {
  return { bw: '', calories: '', protein: '', steps: '', sleep: '', note: '' }
}

export function makeEmptyWeek(seedDemo = false): WeekLog {
  const base: WeekLog = {
    overviewNote: '',
    aiGoal: 'Get stronger while getting leaner while maintaining repeatable, low-skill training.',
    aiPriority:
      'Prefer simple exercises, preserve bench progression, and avoid fatigue spikes from unnecessary complexity.',
    weekly: WEEK_DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: makeWeekMetric() }),
      {} as Record<Weekday, DailyWeeklyMetric>,
    ),
    sessions: PROGRAM.reduce((acc, day) => {
      acc[day.id] = {
        date: '',
        bodyweight: '',
        sleep: '',
        readiness: '',
        sessionNotes: '',
        exercises: day.exercises.map((exercise) => makeExerciseLog(exercise.name, exercise.sets)),
      }
      return acc
    }, {} as Record<TrainingDayId, SessionLog>),
  }

  if (!seedDemo) return base

  base.weekly = {
    Mon: { bw: '188.6', calories: '2320', protein: '198', steps: '8940', sleep: '7.5', note: 'Good energy' },
    Tue: { bw: '188.2', calories: '2410', protein: '205', steps: '8110', sleep: '7.2', note: 'Bench felt sharp' },
    Wed: { bw: '187.9', calories: '2290', protein: '196', steps: '10340', sleep: '6.9', note: 'Slight fatigue' },
    Thu: { bw: '187.7', calories: '2360', protein: '201', steps: '9140', sleep: '7.8', note: 'Recovered well' },
    Fri: { bw: '187.6', calories: '2440', protein: '208', steps: '8750', sleep: '7.1', note: 'Arm pump day' },
    Sat: { bw: '187.4', calories: '2280', protein: '192', steps: '11280', sleep: '8.0', note: 'Long walk' },
    Sun: { bw: '187.5', calories: '2350', protein: '197', steps: '7420', sleep: '7.6', note: 'Rest day' },
  }

  base.sessions.push.date = '04/15'
  base.sessions.push.bodyweight = '188.2'
  base.sessions.push.sleep = '7.2'
  base.sessions.push.readiness = '4'
  base.sessions.push.sessionNotes = 'Bench felt strong. Triceps fatigue showed up late.'
  base.sessions.push.exercises[0].sets = [
    { weight: '205', reps: '6', rpe: '8', note: 'Fast' },
    { weight: '205', reps: '6', rpe: '8.5', note: '' },
    { weight: '205', reps: '5', rpe: '9', note: 'Slight slowdown' },
    { weight: '205', reps: '5', rpe: '9', note: '' },
  ]
  base.sessions.pull.date = '04/14'
  base.sessions.pull.bodyweight = '188.6'
  base.sessions.pull.sleep = '7.5'
  base.sessions.pull.readiness = '4'
  base.sessions.pull.sessionNotes = 'Back work felt better when chest support stayed locked in.'
  base.sessions.pull.exercises[0].sets = [
    { weight: '110', reps: '8', rpe: '8', note: '' },
    { weight: '110', reps: '8', rpe: '8.5', note: '' },
    { weight: '110', reps: '7', rpe: '9', note: '' },
    { weight: '110', reps: '7', rpe: '9', note: '' },
  ]
  base.sessions.arms.date = '04/18'
  base.sessions.arms.bodyweight = '187.6'
  base.sessions.arms.sleep = '7.1'
  base.sessions.arms.readiness = '3'
  base.sessions.arms.sessionNotes = 'Lateral raises felt excellent; elbow a little tight on extensions.'

  return base
}

export function makeDefaultState(): AtlasState {
  return {
    schemaVersion: ATLAS_SCHEMA_VERSION,
    currentWeek: 1,
    themeMode: 'system',
    settings: { ...DEFAULT_ANALYSIS_SETTINGS },
    weeks: { '1': makeEmptyWeek(true) },
  }
}

export function makeBlankState(): AtlasState {
  return {
    schemaVersion: ATLAS_SCHEMA_VERSION,
    currentWeek: 1,
    themeMode: 'system',
    settings: { ...DEFAULT_ANALYSIS_SETTINGS },
    weeks: { '1': makeEmptyWeek(false) },
  }
}

export function toNumber(value: string): number | null {
  const parsed = Number.parseFloat(String(value).replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => Number.isFinite(value))
  if (!valid.length) return null
  return valid.reduce((sum, item) => sum + item, 0) / valid.length
}

function normalizeSession(dayId: TrainingDayId, incoming: unknown): SessionLog {
  const template = makeEmptyWeek(false).sessions[dayId]
  if (!incoming || typeof incoming !== 'object') return template
  const source = incoming as Partial<SessionLog>

  return {
    date: source.date || '',
    bodyweight: source.bodyweight || '',
    sleep: source.sleep || '',
    readiness: source.readiness || '',
    sessionNotes: source.sessionNotes || '',
    exercises: PROGRAM.find((item) => item.id === dayId)!.exercises.map((exercise, index) => {
      const incomingExercise = source.exercises?.[index]
      const incomingSets = incomingExercise?.sets ?? []
      return {
        name: exercise.name,
        exerciseNotes: incomingExercise?.exerciseNotes || '',
        sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
          weight: incomingSets[setIndex]?.weight || '',
          reps: incomingSets[setIndex]?.reps || '',
          rpe: incomingSets[setIndex]?.rpe || '',
          note: incomingSets[setIndex]?.note || '',
        })),
      }
    }),
  }
}

export function normalizeWeek(week: unknown): WeekLog {
  const template = makeEmptyWeek(false)
  if (!week || typeof week !== 'object') return template

  const source = week as Partial<WeekLog>
  const normalizedWeekly = { ...template.weekly }

  for (const day of WEEK_DAYS) {
    normalizedWeekly[day] = {
      ...template.weekly[day],
      ...(source.weekly?.[day] ?? {}),
    }
  }

  const normalizedSessions = { ...template.sessions }
  for (const day of PROGRAM) {
    normalizedSessions[day.id] = normalizeSession(day.id, source.sessions?.[day.id])
  }

  return {
    overviewNote: source.overviewNote || '',
    aiGoal: source.aiGoal || template.aiGoal,
    aiPriority: source.aiPriority || template.aiPriority,
    weekly: normalizedWeekly,
    sessions: normalizedSessions,
  }
}

function normalizeThemeMode(themeMode: unknown): ThemeMode {
  if (themeMode === 'light' || themeMode === 'dark' || themeMode === 'system') {
    return themeMode
  }
  return 'system'
}

function normalizeSettings(settings: unknown): AnalysisSettings {
  if (!settings || typeof settings !== 'object') {
    return { ...DEFAULT_ANALYSIS_SETTINGS }
  }

  const source = settings as Partial<AnalysisSettings>
  return {
    endpointUrl: source.endpointUrl || DEFAULT_ANALYSIS_SETTINGS.endpointUrl,
    model: source.model || DEFAULT_ANALYSIS_SETTINGS.model,
    authToken: source.authToken || '',
    systemPrompt: source.systemPrompt || DEFAULT_ANALYSIS_SETTINGS.systemPrompt,
    timeoutMs:
      typeof source.timeoutMs === 'number' && source.timeoutMs >= 3000 ? source.timeoutMs : DEFAULT_ANALYSIS_SETTINGS.timeoutMs,
  }
}

export function sanitizeAtlasState(candidate: unknown): AtlasState {
  const fallback = makeDefaultState()
  if (!candidate || typeof candidate !== 'object') return fallback
  const source = candidate as Partial<AtlasState>

  const currentWeek = Number.isFinite(source.currentWeek) && Number(source.currentWeek) > 0 ? Number(source.currentWeek) : 1
  const weeksSource = source.weeks && typeof source.weeks === 'object' ? source.weeks : {}
  const weeks: Record<string, WeekLog> = {}

  Object.keys(weeksSource).forEach((weekId) => {
    weeks[weekId] = normalizeWeek(weeksSource[weekId])
  })

  if (!weeks[String(currentWeek)]) {
    weeks[String(currentWeek)] = makeEmptyWeek(false)
  }

  return {
    schemaVersion: ATLAS_SCHEMA_VERSION,
    currentWeek,
    themeMode: normalizeThemeMode(source.themeMode),
    settings: normalizeSettings(source.settings),
    weeks,
  }
}

export function migrateLegacyState(legacy: unknown): AtlasState {
  if (!legacy || typeof legacy !== 'object') return makeDefaultState()
  const source = legacy as LegacyAiGainsLikeState
  const state = makeDefaultState()

  state.currentWeek = Number(source.currentWeek) > 0 ? Number(source.currentWeek) : 1
  if (source.settings) {
    state.settings.endpointUrl = source.settings.endpoint || state.settings.endpointUrl
    state.settings.model = source.settings.model || state.settings.model
    state.settings.systemPrompt = source.settings.systemPrompt || state.settings.systemPrompt
  }

  if (source.weeks && typeof source.weeks === 'object') {
    state.weeks = {}
    Object.entries(source.weeks).forEach(([weekId, week]) => {
      state.weeks[weekId] = normalizeWeek(week)
    })
  }

  if (!state.weeks[String(state.currentWeek)]) {
    state.weeks[String(state.currentWeek)] = makeEmptyWeek(false)
  }

  return state
}

export function loadState(): AtlasState {
  try {
    const atlasRaw = localStorage.getItem(ATLAS_STORAGE_KEY)
    if (atlasRaw) {
      return sanitizeAtlasState(JSON.parse(atlasRaw))
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      return migrateLegacyState(JSON.parse(legacyRaw))
    }
  } catch (error) {
    console.error(error)
  }

  return makeDefaultState()
}

export function saveState(state: AtlasState): void {
  localStorage.setItem(ATLAS_STORAGE_KEY, JSON.stringify(state))
}

export function clearStoredAtlasData(): void {
  localStorage.removeItem(ATLAS_STORAGE_KEY)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export function createExportEnvelope(state: AtlasState): AtlasExportEnvelope {
  return {
    appName: 'Atlas',
    schemaVersion: ATLAS_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
}

export function parseImport(raw: string): AtlasState {
  const parsed = JSON.parse(raw) as unknown
  if (parsed && typeof parsed === 'object' && 'appName' in parsed) {
    const envelope = parsed as AtlasExportEnvelope
    if (envelope.appName === 'Atlas' && envelope.state) {
      return sanitizeAtlasState(envelope.state)
    }
  }
  return sanitizeAtlasState(migrateLegacyState(parsed))
}

function isSetLogged(set: SetLog): boolean {
  return Boolean(set.weight || set.reps || set.rpe || set.note)
}

export function isSessionLogged(session: SessionLog): boolean {
  if (session.date || session.sessionNotes) return true
  return session.exercises.some((exercise) => exercise.sets.some(isSetLogged))
}

function summarizeSession(session: SessionLog): DayLogSummary {
  const totalExercises = session.exercises.length
  const totalSets = session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
  const loggedExercises = session.exercises.filter((exercise) => exercise.sets.some(isSetLogged)).length
  const loggedSets = session.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter(isSetLogged).length,
    0,
  )

  return {
    loggedExercises,
    totalExercises,
    loggedSets,
    totalSets,
    sessionLogged: isSessionLogged(session),
  }
}

export function getDayLogSummaries(week: WeekLog): Record<TrainingDayId, DayLogSummary> {
  const summaries = {} as Record<TrainingDayId, DayLogSummary>
  PROGRAM.forEach((day) => {
    summaries[day.id] = summarizeSession(week.sessions[day.id])
  })
  return summaries
}

export function computeMetrics(week: WeekLog): AtlasMetrics {
  const bodyweights = WEEK_DAYS.map((day) => toNumber(week.weekly[day].bw))
  const sleep = WEEK_DAYS.map((day) => toNumber(week.weekly[day].sleep))
  const calories = WEEK_DAYS.map((day) => toNumber(week.weekly[day].calories))
  const protein = WEEK_DAYS.map((day) => toNumber(week.weekly[day].protein))
  const steps = WEEK_DAYS.map((day) => toNumber(week.weekly[day].steps))

  const avgBodyweight = average(bodyweights)
  const avgSleep = average(sleep)
  const avgCalories = average(calories)
  const avgProtein = average(protein)
  const avgSteps = average(steps)

  const sets = PROGRAM.flatMap((day) => week.sessions[day.id].exercises.flatMap((exercise) => exercise.sets))
  const loggedSets = sets.filter(isSetLogged)
  const avgRpe = average(loggedSets.map((set) => toNumber(set.rpe)))
  const avgReadiness = average(PROGRAM.map((day) => toNumber(week.sessions[day.id].readiness)))
  const completedSessions = PROGRAM.filter((day) => isSessionLogged(week.sessions[day.id])).length

  const firstBw = bodyweights.find((value) => value !== null)
  const lastBw = [...bodyweights].reverse().find((value) => value !== null)
  const bwDelta = firstBw !== undefined && lastBw !== undefined && firstBw !== null && lastBw !== null ? lastBw - firstBw : null

  let benchE1RM: number | null = null
  const benchSets = week.sessions.push.exercises[0]?.sets ?? []
  benchSets.forEach((set) => {
    const weight = toNumber(set.weight)
    const reps = toNumber(set.reps)
    if (weight === null || reps === null) return
    const e1rm = weight * (1 + reps / 30)
    benchE1RM = benchE1RM === null ? e1rm : Math.max(benchE1RM, e1rm)
  })

  const proteinTargetRatio = avgBodyweight && avgProtein ? avgProtein / avgBodyweight : null
  const sleepScore = avgSleep ? Math.min(100, Math.max(0, ((avgSleep - 5.5) / 2.5) * 100)) : 0
  const proteinScore = proteinTargetRatio ? Math.min(100, (proteinTargetRatio / 0.95) * 100) : 0
  const readinessScore = avgReadiness ? (avgReadiness / 5) * 100 : 0
  const consistencyScore = (completedSessions / PROGRAM.length) * 100
  const recoveryScore = Math.round(
    sleepScore * 0.35 + proteinScore * 0.25 + readinessScore * 0.2 + consistencyScore * 0.2,
  )
  const loggedNutritionDays = WEEK_DAYS.filter((day) => week.weekly[day].calories && week.weekly[day].protein).length
  const nutritionCompliance = Math.round(
    Math.min(
      100,
      (loggedNutritionDays / WEEK_DAYS.length) * 45 + (proteinTargetRatio ? Math.min(55, (proteinTargetRatio / 0.8) * 55) : 0),
    ),
  )

  const summaryLine =
    bwDelta === null
      ? 'Log more bodyweight and recovery data to sharpen this week summary.'
      : bwDelta < 0
        ? `Bodyweight is trending down ${Math.abs(bwDelta).toFixed(1)} lb this week with recovery at ${recoveryScore}.`
        : `Bodyweight is flat or up ${bwDelta.toFixed(1)} lb this week with recovery at ${recoveryScore}.`

  return {
    avgBodyweight,
    avgSleep,
    avgCalories,
    avgProtein,
    avgSteps,
    avgRpe,
    avgReadiness,
    completedSessions,
    totalLoggedSets: loggedSets.length,
    benchE1RM,
    bwDelta,
    proteinTargetRatio,
    recoveryScore,
    nutritionCompliance,
    bodyweights,
    sleep,
    calories,
    steps,
    summaryLine,
  }
}

export function getUpcomingTrainingDay(week: WeekLog): (typeof PROGRAM)[number] | null {
  return PROGRAM.find((day) => !isSessionLogged(week.sessions[day.id])) ?? null
}

export function buildAnalysisPrompt(state: AtlasState, weekId: number): string {
  const week = state.weeks[String(weekId)] ?? makeEmptyWeek(false)
  const metrics = computeMetrics(week)

  let prompt = `Atlas weekly review\n`
  prompt += `Week: ${weekId}\n`
  prompt += `Goal: ${week.aiGoal}\n`
  prompt += `Priority constraints: ${week.aiPriority}\n`
  prompt += `Recovery score: ${metrics.recoveryScore}\n`
  prompt += `Average bodyweight: ${formatMaybe(metrics.avgBodyweight, 1, ' lb')}\n`
  prompt += `Bodyweight delta: ${metrics.bwDelta === null ? '-' : `${metrics.bwDelta.toFixed(1)} lb/week`}\n`
  prompt += `Average sleep: ${formatMaybe(metrics.avgSleep, 1, ' hrs')}\n`
  prompt += `Average calories: ${formatMaybe(metrics.avgCalories, 0, ' kcal')}\n`
  prompt += `Average protein: ${formatMaybe(metrics.avgProtein, 0, ' g')}\n`
  prompt += `Average steps: ${formatMaybe(metrics.avgSteps, 0, '')}\n`
  prompt += `Bench e1RM: ${formatMaybe(metrics.benchE1RM, 1, ' lb')}\n\n`
  prompt += `Nutrition and recovery log:\n`

  WEEK_DAYS.forEach((day) => {
    const entry = week.weekly[day]
    prompt += `${day}: BW ${entry.bw || '-'}, Calories ${entry.calories || '-'}, Protein ${entry.protein || '-'}, Steps ${entry.steps || '-'}, Sleep ${entry.sleep || '-'}, Note ${entry.note || '-'}\n`
  })

  prompt += `\nTraining sessions:\n`
  PROGRAM.forEach((day) => {
    const session = week.sessions[day.id]
    prompt += `\n${day.day} - ${day.title} (${day.focus})\n`
    prompt += `Date: ${session.date || '-'} | Bodyweight: ${session.bodyweight || '-'} | Sleep: ${session.sleep || '-'} | Readiness: ${session.readiness || '-'}\n`
    if (session.sessionNotes) prompt += `Session note: ${session.sessionNotes}\n`
    day.exercises.forEach((exercise, exerciseIndex) => {
      prompt += `- ${exercise.name} [${exercise.scheme}, ${exercise.target}]\n`
      if (session.exercises[exerciseIndex].exerciseNotes) {
        prompt += `  Exercise note: ${session.exercises[exerciseIndex].exerciseNotes}\n`
      }
      session.exercises[exerciseIndex].sets.forEach((set, setIndex) => {
        if (isSetLogged(set)) {
          prompt += `  Set ${setIndex + 1}: ${set.weight || '-'} lb x ${set.reps || '-'} reps @ RPE ${set.rpe || '-'}${set.note ? ` | ${set.note}` : ''}\n`
        }
      })
    })
  })

  prompt += '\nOutput format:\n'
  prompt += '1. Overall read on the week\n'
  prompt += '2. Recovery or nutrition warning flags\n'
  prompt += '3. Next-session targets for each logged exercise (add, hold, or reduce load + rep goal)\n'
  prompt += '4. Specific recommendation for bench progression\n'
  prompt += '5. Whether current bodyweight pace is appropriate for strength retention\n'

  return prompt
}

export function buildChatPayload(state: AtlasState, weekId: number): Record<string, unknown> {
  return {
    model: state.settings.model,
    temperature: 0.35,
    messages: [
      { role: 'system', content: state.settings.systemPrompt },
      { role: 'user', content: buildAnalysisPrompt(state, weekId) },
    ],
  }
}

export function formatMaybe(value: number | null, decimals = 0, suffix = ''): string {
  return value === null ? '-' : `${value.toFixed(decimals)}${suffix}`
}
