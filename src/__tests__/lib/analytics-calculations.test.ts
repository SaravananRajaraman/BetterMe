import { describe, it, expect } from 'vitest'

/**
 * Test utilities for date-based calculations used in weight/analytics
 */

export function calculateAveragWeight(entries: Array<{ weight: number }>): number {
  if (entries.length === 0) return 0
  const sum = entries.reduce((acc, entry) => acc + entry.weight, 0)
  return Math.round((sum / entries.length) * 10) / 10
}

export function calculateWeightTrend(
  entries: Array<{ weight: number; date: string }>
): 'gaining' | 'losing' | 'stable' {
  if (entries.length < 2) return 'stable'

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0].weight
  const last = sorted[sorted.length - 1].weight

  if (last > first + 1) return 'gaining'
  if (last < first - 1) return 'losing'
  return 'stable'
}

export function getWeeklyAverage(
  entries: Array<{ weight: number; date: string }>,
  endDate: string
): number {
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 7)

  const weekEntries = entries.filter((e) => {
    const entryDate = new Date(e.date)
    return entryDate >= startDate && entryDate <= new Date(endDate)
  })

  return calculateAveragWeight(weekEntries)
}

export function getTodoCompletionRate(
  completions: Array<{ todo_id: string; completed_date: string }>,
  todos: Array<{ id: string }>
): number {
  if (todos.length === 0) return 0
  const uniqueTodoIds = new Set(todos.map((t) => t.id))
  const completedTodos = new Set(completions.map((c) => c.todo_id))

  const completed = Array.from(uniqueTodoIds).filter((id) => completedTodos.has(id)).length
  return Math.round((completed / uniqueTodoIds.size) * 100)
}

export function getStreakDays(
  completions: Array<{ completed_date: string }>,
  today: string
): number {
  if (completions.length === 0) return 0

  const sorted = [...completions]
    .map((c) => new Date(c.completed_date))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  let currentDate = new Date(today)

  for (const completionDate of sorted) {
    const diffDays = Math.floor(
      (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = new Date(completionDate)
    } else {
      break
    }
  }

  return streak
}

// ============ TESTS ============

describe('Weight Calculations', () => {
  describe('calculateAveragWeight', () => {
    it('should calculate average of multiple weights', () => {
      const entries = [{ weight: 70 }, { weight: 72 }, { weight: 68 }]
      const avg = calculateAveragWeight(entries)
      expect(avg).toBe(70)
    })

    it('should return 0 for empty list', () => {
      expect(calculateAveragWeight([])).toBe(0)
    })

    it('should round to one decimal place', () => {
      const entries = [{ weight: 70.1 }, { weight: 70.2 }, { weight: 70.3 }]
      const avg = calculateAveragWeight(entries)
      expect(avg).toBe(70.2)
    })

    it('should handle single entry', () => {
      const entries = [{ weight: 75.5 }]
      expect(calculateAveragWeight(entries)).toBe(75.5)
    })
  })

  describe('calculateWeightTrend', () => {
    it('should detect gaining trend', () => {
      const entries = [
        { weight: 70, date: '2024-01-01' },
        { weight: 75, date: '2024-01-31' },
      ]
      expect(calculateWeightTrend(entries)).toBe('gaining')
    })

    it('should detect losing trend', () => {
      const entries = [
        { weight: 75, date: '2024-01-01' },
        { weight: 70, date: '2024-01-31' },
      ]
      expect(calculateWeightTrend(entries)).toBe('losing')
    })

    it('should detect stable trend', () => {
      const entries = [
        { weight: 70, date: '2024-01-01' },
        { weight: 70.5, date: '2024-01-31' },
      ]
      expect(calculateWeightTrend(entries)).toBe('stable')
    })

    it('should return stable for single entry', () => {
      const entries = [{ weight: 70, date: '2024-01-01' }]
      expect(calculateWeightTrend(entries)).toBe('stable')
    })

    it('should return stable for empty list', () => {
      expect(calculateWeightTrend([])).toBe('stable')
    })
  })

  describe('getWeeklyAverage', () => {
    it('should calculate average for entries within week', () => {
      const entries = [
        { weight: 70, date: '2024-01-25' },
        { weight: 72, date: '2024-01-26' },
        { weight: 74, date: '2024-01-31' },
      ]
      const avg = getWeeklyAverage(entries, '2024-01-31')
      expect(avg).toBe(72)
    })

    it('should exclude entries outside week range', () => {
      const entries = [
        { weight: 80, date: '2024-01-20' }, // Before week
        { weight: 70, date: '2024-01-25' },
        { weight: 72, date: '2024-01-31' },
      ]
      const avg = getWeeklyAverage(entries, '2024-01-31')
      expect(avg).toBe(71)
    })

    it('should return 0 for no entries in week', () => {
      const entries = [{ weight: 70, date: '2024-01-01' }]
      const avg = getWeeklyAverage(entries, '2024-01-31')
      expect(avg).toBe(0)
    })
  })
})

describe('Todo Metrics', () => {
  describe('getTodoCompletionRate', () => {
    it('should calculate completion percentage', () => {
      const todos = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
      ]
      const completions = [
        { todo_id: '1', completed_date: '2024-01-01' },
        { todo_id: '2', completed_date: '2024-01-01' },
      ]
      const rate = getTodoCompletionRate(completions, todos)
      expect(rate).toBe(50)
    })

    it('should return 0 when no todos', () => {
      const completions = [{ todo_id: '1', completed_date: '2024-01-01' }]
      expect(getTodoCompletionRate(completions, [])).toBe(0)
    })

    it('should return 100 when all completed', () => {
      const todos = [{ id: '1' }, { id: '2' }]
      const completions = [
        { todo_id: '1', completed_date: '2024-01-01' },
        { todo_id: '2', completed_date: '2024-01-01' },
      ]
      expect(getTodoCompletionRate(completions, todos)).toBe(100)
    })

    it('should handle duplicates in completions', () => {
      const todos = [{ id: '1' }, { id: '2' }]
      const completions = [
        { todo_id: '1', completed_date: '2024-01-01' },
        { todo_id: '1', completed_date: '2024-01-02' },
        { todo_id: '2', completed_date: '2024-01-01' },
      ]
      expect(getTodoCompletionRate(completions, todos)).toBe(100)
    })
  })

  describe('getStreakDays', () => {
    it('should calculate current streak', () => {
      const completions = [
        { completed_date: '2024-01-31' },
        { completed_date: '2024-01-30' },
        { completed_date: '2024-01-29' },
      ]
      const streak = getStreakDays(completions, '2024-01-31')
      expect(streak).toBe(3)
    })

    it('should break streak on gap', () => {
      const completions = [
        { completed_date: '2024-01-31' },
        { completed_date: '2024-01-30' },
        { completed_date: '2024-01-28' }, // Gap on Jan 29
      ]
      const streak = getStreakDays(completions, '2024-01-31')
      expect(streak).toBe(2)
    })

    it('should return 0 for no completions', () => {
      expect(getStreakDays([], '2024-01-31')).toBe(0)
    })

    it('should handle single completion', () => {
      const completions = [{ completed_date: '2024-01-31' }]
      expect(getStreakDays(completions, '2024-01-31')).toBe(1)
    })

    it('should handle completed yesterday', () => {
      const completions = [{ completed_date: '2024-01-30' }]
      expect(getStreakDays(completions, '2024-01-31')).toBe(1)
    })

    it('should break streak for old dates', () => {
      const completions = [{ completed_date: '2024-01-20' }]
      expect(getStreakDays(completions, '2024-01-31')).toBe(0)
    })
  })
})
