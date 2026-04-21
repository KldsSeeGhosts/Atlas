import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  makeDefaultState,
  makeEmptyWeek,
  parseImport,
  saveState,
  computeMetrics,
  loadState,
  createExportEnvelope,
  getUpcomingTrainingDay,
} from '../lib/atlas'
import { applyTheme } from '../theme/theme'
import type { AppView, AtlasState, ThemeMode, TrainingDayId, Weekday } from '../types/atlas'

interface ToastItem {
  id: number
  tone: 'info' | 'success' | 'error'
  message: string
}

function nextToastId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function useAtlasApp() {
  const [state, setState] = useState<AtlasState>(() => loadState())
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((tone: ToastItem['tone'], message: string) => {
    const id = nextToastId()
    setToasts((previous) => [...previous, { id, tone, message }])
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveState(state)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => {
    applyTheme(state.themeMode)
    if (state.themeMode !== 'system') return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [state.themeMode])

  const currentWeekId = state.currentWeek
  const currentWeekKey = String(currentWeekId)
  const currentWeek = state.weeks[currentWeekKey] ?? makeEmptyWeek(false)
  const metrics = useMemo(() => computeMetrics(currentWeek), [currentWeek])
  const upcomingDay = useMemo(() => getUpcomingTrainingDay(currentWeek), [currentWeek])

  const ensureWeek = useCallback((targetWeek: number, sourceState: AtlasState): AtlasState => {
    const safeWeek = Math.max(1, targetWeek)
    if (sourceState.weeks[String(safeWeek)]) {
      return { ...sourceState, currentWeek: safeWeek }
    }
    return {
      ...sourceState,
      currentWeek: safeWeek,
      weeks: { ...sourceState.weeks, [String(safeWeek)]: makeEmptyWeek(false) },
    }
  }, [])

  const updateCurrentWeek = useCallback((updater: (draft: AtlasState['weeks'][string]) => void) => {
    setState((previous) => {
      const currentKey = String(previous.currentWeek)
      const current = previous.weeks[currentKey] ?? makeEmptyWeek(false)
      const nextWeek = structuredClone(current)
      updater(nextWeek)
      return {
        ...previous,
        weeks: {
          ...previous.weeks,
          [currentKey]: nextWeek,
        },
      }
    })
  }, [])

  const actions = {
    previousWeek: () => {
      setState((previous) => ensureWeek(previous.currentWeek - 1, previous))
    },
    nextWeek: () => {
      setState((previous) => ensureWeek(previous.currentWeek + 1, previous))
    },
    setCurrentWeek: (week: number) => {
      setState((previous) => ensureWeek(week, previous))
    },
    updateThemeMode: (themeMode: ThemeMode) => {
      setState((previous) => ({ ...previous, themeMode }))
      pushToast('info', `Theme updated to ${themeMode}`)
    },
    updateAiGoal: (value: string) => {
      updateCurrentWeek((week) => {
        week.aiGoal = value
      })
    },
    updateAiPriority: (value: string) => {
      updateCurrentWeek((week) => {
        week.aiPriority = value
      })
    },
    updateOverviewNote: (value: string) => {
      updateCurrentWeek((week) => {
        week.overviewNote = value
      })
    },
    updateWeeklyMetric: (day: Weekday, key: keyof AtlasState['weeks'][string]['weekly'][Weekday], value: string) => {
      updateCurrentWeek((week) => {
        week.weekly[day][key] = value
      })
    },
    updateSessionField: (dayId: TrainingDayId, key: keyof AtlasState['weeks'][string]['sessions'][TrainingDayId], value: string) => {
      updateCurrentWeek((week) => {
        if (key === 'exercises') return
        week.sessions[dayId][key] = value
      })
    },
    updateExerciseNote: (dayId: TrainingDayId, exerciseIndex: number, value: string) => {
      updateCurrentWeek((week) => {
        week.sessions[dayId].exercises[exerciseIndex].exerciseNotes = value
      })
    },
    updateSetField: (
      dayId: TrainingDayId,
      exerciseIndex: number,
      setIndex: number,
      key: keyof AtlasState['weeks'][string]['sessions'][TrainingDayId]['exercises'][number]['sets'][number],
      value: string,
    ) => {
      updateCurrentWeek((week) => {
        week.sessions[dayId].exercises[exerciseIndex].sets[setIndex][key] = value
      })
    },
    updateSettings: (settings: Partial<AtlasState['settings']>) => {
      setState((previous) => ({
        ...previous,
        settings: { ...previous.settings, ...settings },
      }))
    },
    clearCurrentWeek: () => {
      setState((previous) => ({
        ...previous,
        weeks: {
          ...previous.weeks,
          [String(previous.currentWeek)]: makeEmptyWeek(false),
        },
      }))
      pushToast('success', `Week ${currentWeekId} cleared`)
    },
    resetAtlasData: () => {
      setState({
        ...makeDefaultState(),
        themeMode: state.themeMode,
      })
      pushToast('success', 'Atlas data reset to defaults')
    },
    exportAtlasData: () => {
      const payload = JSON.stringify(createExportEnvelope(state), null, 2)
      pushToast('success', 'Atlas export prepared')
      return payload
    },
    importAtlasData: (rawText: string) => {
      try {
        const parsed = parseImport(rawText)
        setState(parsed)
        pushToast('success', 'Data imported successfully')
        return { ok: true as const, message: 'Data imported successfully' }
      } catch (error) {
        console.error(error)
        pushToast('error', 'Import failed. Ensure the file is valid JSON.')
        return { ok: false as const, message: 'Import failed. Ensure the file is valid JSON.' }
      }
    },
    copyToClipboard: async (text: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(text)
        pushToast('success', successMessage)
        return true
      } catch {
        pushToast('error', 'Clipboard failed in this browser context')
        return false
      }
    },
  }

  return {
    state,
    currentWeek,
    currentWeekId,
    metrics,
    upcomingDay,
    activeView,
    setActiveView,
    actions,
    toasts,
  }
}
