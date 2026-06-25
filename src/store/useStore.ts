import { useState, useEffect, useCallback } from 'react'

export interface UserState {
  vagalState: 'ventral' | 'sympathetic' | 'dorsal'
  streakDays: number
  totalPoints: number
  failureIndex: number
  consecutiveCycles: number
  completedToday: string[]
  nbackLevel: number
  nbackBestScore: number
  habits: { id: string; label: string; completed: boolean }[]
  decisions: Decision[]
  systemicProblems: SystemicProblem[]
  focusBlocksToday: number
}

export interface Decision {
  id: string
  title: string
  type: 'type1' | 'type2' | null
  biases: number[]
  firstPrinciples: { belief: string; decomposed: string[]; rebuilt: string }
  regretScore: number
  createdAt: string
}

export interface SystemicProblem {
  id: string
  event: string
  pattern: string
  structure: string
  mentalModel: string
  createdAt: string
}

const DEFAULT_STATE: UserState = {
  vagalState: 'ventral',
  streakDays: 0,
  totalPoints: 0,
  failureIndex: 0,
  consecutiveCycles: 0,
  completedToday: [],
  nbackLevel: 2,
  nbackBestScore: 0,
  habits: [
    { id: 'cold', label: 'Ducha fria 30s', completed: false },
    { id: 'desk', label: 'Organizar mesa de trabalho', completed: false },
    { id: 'walk', label: 'Caminhada 5 min sem celular', completed: false },
  ],
  decisions: [],
  systemicProblems: [],
  focusBlocksToday: 0,
}

const ALPHA = 0.15
const BETA = 0.08
const P_BASE = 100

export function calcScore(state: UserState): number {
  const { consecutiveCycles: S, failureIndex: F } = state
  return Math.round(P_BASE * (1 + ALPHA * S) * Math.exp(-BETA * F))
}

function load(): UserState {
  try {
    const raw = localStorage.getItem('sinc_state')
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATE
  }
}

let _state = load()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(fn => fn())
}

function save() {
  localStorage.setItem('sinc_state', JSON.stringify(_state))
}

export function getState() { return _state }

export function setState(updater: (s: UserState) => Partial<UserState>) {
  const patch = updater(_state)
  _state = { ..._state, ...patch }
  save()
  notify()
}

export function useStore() {
  const [, forceRender] = useState(0)

  useEffect(() => {
    const rerender = () => forceRender(n => n + 1)
    listeners.add(rerender)
    return () => { listeners.delete(rerender) }
  }, [])

  const completeActivity = useCallback((activityId: string) => {
    setState(s => {
      if (s.completedToday.includes(activityId)) return {}
      const newCycles = s.consecutiveCycles + 1
      const pts = Math.round(P_BASE * (1 + ALPHA * newCycles) * Math.exp(-BETA * s.failureIndex))
      return {
        completedToday: [...s.completedToday, activityId],
        consecutiveCycles: newCycles,
        totalPoints: s.totalPoints + pts,
      }
    })
  }, [])

  const recordFailure = useCallback(() => {
    setState(s => ({ failureIndex: s.failureIndex + 1, consecutiveCycles: 0 }))
  }, [])

  const setVagalState = useCallback((vs: UserState['vagalState']) => {
    setState(() => ({ vagalState: vs }))
  }, [])

  const addDecision = useCallback((d: Omit<Decision, 'id' | 'createdAt'>) => {
    const decision: Decision = { ...d, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setState(s => ({ decisions: [decision, ...s.decisions] }))
    return decision.id
  }, [])

  const addSystemicProblem = useCallback((p: Omit<SystemicProblem, 'id' | 'createdAt'>) => {
    const prob: SystemicProblem = { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setState(s => ({ systemicProblems: [prob, ...s.systemicProblems] }))
  }, [])

  const toggleHabit = useCallback((id: string) => {
    setState(s => ({
      habits: s.habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h),
    }))
  }, [])

  const updateNback = useCallback((level: number, score: number) => {
    setState(s => ({
      nbackLevel: level,
      nbackBestScore: Math.max(s.nbackBestScore, score),
    }))
  }, [])

  const incrementFocusBlock = useCallback(() => {
    setState(s => ({ focusBlocksToday: s.focusBlocksToday + 1 }))
    completeActivity('focus_block')
  }, [completeActivity])

  return {
    state: _state,
    completeActivity,
    recordFailure,
    setVagalState,
    addDecision,
    addSystemicProblem,
    toggleHabit,
    updateNback,
    incrementFocusBlock,
    score: calcScore(_state),
  }
}
