import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  shouldShowTodoOnDate,
  isTodoScheduledOnDate,
  computeDailySummary,
  computeStreaks,
} from '@/lib/analytics-calculations'
import type { Todo, TodoCompletion } from '@/lib/types'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  user_id: 'user-1',
  title: 'Test',
  description: null,
  category_id: null,
  reminder_time: null,
  is_recurring: true,
  recurrence_type: 'daily',
  recurrence_interval: 1,
  recurrence_days: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const makeCompletion = (
  overrides: Partial<TodoCompletion> = {}
): TodoCompletion => ({
  id: `comp-${Math.random()}`,
  todo_id: 'todo-1',
  user_id: 'user-1',
  completed_date: '2024-01-01',
  completed_at: '2024-01-01T08:00:00Z',
  skipped: false,
  ...overrides,
})

describe('shouldShowTodoOnDate', () => {
  it('always shows non-recurring todos (recurrence handled elsewhere)', () => {
    expect(shouldShowTodoOnDate(makeTodo({ is_recurring: false }), '2030-05-05')).toBe(true)
  })

  it('shows daily todos every day', () => {
    expect(shouldShowTodoOnDate(makeTodo({ recurrence_type: 'daily' }), '2024-06-15')).toBe(true)
  })

  it('treats a missing recurrence_type as daily', () => {
    const todo = makeTodo({ recurrence_type: null as unknown as 'daily' })
    expect(shouldShowTodoOnDate(todo, '2024-06-15')).toBe(true)
  })

  describe('interval', () => {
    const todo = makeTodo({ recurrence_type: 'interval', recurrence_interval: 3 })
    it('shows on the created day and every Nth day after', () => {
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(false)
      expect(shouldShowTodoOnDate(todo, '2024-01-04')).toBe(true)
    })
    it('does not show before the created day', () => {
      expect(shouldShowTodoOnDate(todo, '2023-12-31')).toBe(false)
    })
    it('defaults a missing interval to 1 (daily)', () => {
      const t = makeTodo({
        recurrence_type: 'interval',
        recurrence_interval: null as unknown as number,
      })
      expect(shouldShowTodoOnDate(t, '2024-01-02')).toBe(true)
    })
  })

  describe('weekly', () => {
    it('shows only on listed weekdays', () => {
      const todo = makeTodo({ recurrence_type: 'weekly', recurrence_days: [1, 3] }) // Mon, Wed
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true) // Monday
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(false) // Tuesday
      expect(shouldShowTodoOnDate(todo, '2024-01-03')).toBe(true) // Wednesday
    })
    it('shows nothing when recurrence_days is null', () => {
      const todo = makeTodo({ recurrence_type: 'weekly', recurrence_days: null })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })
  })

  describe('monthly', () => {
    it('shows on the matching day of month', () => {
      const todo = makeTodo({ recurrence_type: 'monthly', recurrence_days: [15] })
      expect(shouldShowTodoOnDate(todo, '2024-01-15')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-16')).toBe(false)
    })
    it('clamps an overrunning day to the last day of the month', () => {
      const todo = makeTodo({ recurrence_type: 'monthly', recurrence_days: [31] })
      expect(shouldShowTodoOnDate(todo, '2024-01-31')).toBe(true) // 31 exists
      expect(shouldShowTodoOnDate(todo, '2024-02-29')).toBe(true) // clamps to Feb 29
      expect(shouldShowTodoOnDate(todo, '2024-02-28')).toBe(false) // not the last day
    })
    it('shows nothing when recurrence_days is null', () => {
      const todo = makeTodo({ recurrence_type: 'monthly', recurrence_days: null })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })
  })
})

describe('isTodoScheduledOnDate', () => {
  it('returns false before the todo was created', () => {
    const todo = makeTodo({ created_at: '2024-02-01T00:00:00Z' })
    expect(isTodoScheduledOnDate(todo, '2024-01-15', [])).toBe(false)
  })

  it('delegates to recurrence for recurring todos', () => {
    const todo = makeTodo({ recurrence_type: 'daily' })
    expect(isTodoScheduledOnDate(todo, '2024-01-05', [])).toBe(true)
  })

  describe('one-time "stays until done"', () => {
    const oneTime = makeTodo({ is_recurring: false })
    it('stays visible while unresolved', () => {
      expect(isTodoScheduledOnDate(oneTime, '2024-01-10', [])).toBe(true)
    })
    it('hides once resolved on an earlier date', () => {
      const completions = [makeCompletion({ completed_date: '2024-01-05' })]
      expect(isTodoScheduledOnDate(oneTime, '2024-01-10', completions)).toBe(false)
    })
    it('still shows on its own completion date', () => {
      const completions = [makeCompletion({ completed_date: '2024-01-10' })]
      expect(isTodoScheduledOnDate(oneTime, '2024-01-10', completions)).toBe(true)
    })
  })
})

describe('computeDailySummary', () => {
  it('counts only todos scheduled that day, with a consistent rate', () => {
    const daily = makeTodo({ id: 'A', recurrence_type: 'daily' })
    const weeklyMon = makeTodo({
      id: 'B',
      recurrence_type: 'weekly',
      recurrence_days: [1],
    })
    const oneTime = makeTodo({ id: 'C', is_recurring: false })
    const completions: TodoCompletion[] = [
      makeCompletion({ todo_id: 'A', completed_date: '2024-01-01' }),
      // a second row for A exercises the group-by accumulation path
      makeCompletion({ todo_id: 'A', completed_date: '2024-01-02' }),
      makeCompletion({ todo_id: 'B', completed_date: '2024-01-01', skipped: true }),
    ]

    // 2024-01-01 is a Monday
    const summary = computeDailySummary([daily, weeklyMon, oneTime], completions, '2024-01-01')
    expect(summary).toEqual({
      date: '2024-01-01',
      totalTodos: 3,
      completedCount: 1, // A
      skippedCount: 1, // B
      missedCount: 1, // C
      completionRate: 33,
    })
  })

  it('excludes completions for todos not scheduled that day', () => {
    const daily = makeTodo({ id: 'A', recurrence_type: 'daily' })
    const completions = [
      makeCompletion({ todo_id: 'A', completed_date: '2024-01-01' }),
      // orphaned completion for an unknown todo
      makeCompletion({ todo_id: 'ghost', completed_date: '2024-01-01' }),
    ]
    const summary = computeDailySummary([daily], completions, '2024-01-01')
    expect(summary.totalTodos).toBe(1)
    expect(summary.completedCount).toBe(1)
    expect(summary.completionRate).toBe(100)
  })

  it('returns a 0% rate when nothing is scheduled', () => {
    const summary = computeDailySummary([], [], '2024-01-01')
    expect(summary).toEqual({
      date: '2024-01-01',
      totalTodos: 0,
      completedCount: 0,
      skippedCount: 0,
      missedCount: 0,
      completionRate: 0,
    })
  })
})

describe('computeStreaks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-31T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns zeros for no completions', () => {
    expect(computeStreaks([])).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    })
  })

  it('counts a consecutive run ending today and dedupes dates', () => {
    const result = computeStreaks([
      '2024-01-31',
      '2024-01-31',
      '2024-01-30',
      '2024-01-29',
    ])
    expect(result).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      lastCompletedDate: '2024-01-31',
    })
  })

  it('breaks the current streak on a gap', () => {
    const result = computeStreaks(['2024-01-31', '2024-01-29'])
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('counts a streak that ends yesterday', () => {
    const result = computeStreaks(['2024-01-30'])
    expect(result.currentStreak).toBe(1)
  })

  it('reports no current streak when the latest completion is older', () => {
    const result = computeStreaks(['2024-01-20'])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(1)
    expect(result.lastCompletedDate).toBe('2024-01-20')
  })
})
