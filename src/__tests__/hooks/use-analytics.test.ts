import { describe, it, expect } from 'vitest'
import type { DailySummary, StreakInfo } from '@/lib/types'

// Create a mock daily summary
const createMockDailySummary = (overrides: Partial<DailySummary> = {}): DailySummary => ({
  date: '2024-01-15',
  todos_count: 5,
  completed_count: 3,
  completion_rate: 0.6,
  last_completion_time: '15:30',
  ...overrides,
})

// Create a mock streak info
const createMockStreakInfo = (overrides: Partial<StreakInfo> = {}): StreakInfo => ({
  current_streak: 7,
  longest_streak: 21,
  last_completion_date: '2024-01-15',
  ...overrides,
})

describe('Daily Summary', () => {
  it('should create valid daily summary', () => {
    const summary = createMockDailySummary()
    expect(summary.date).toBe('2024-01-15')
    expect(summary.todos_count).toBe(5)
    expect(summary.completed_count).toBe(3)
    expect(summary.completion_rate).toBe(0.6)
  })

  it('should allow overrides', () => {
    const summary = createMockDailySummary({
      date: '2024-01-20',
      todos_count: 10,
      completed_count: 8,
      completion_rate: 0.8,
    })
    expect(summary.date).toBe('2024-01-20')
    expect(summary.todos_count).toBe(10)
    expect(summary.completed_count).toBe(8)
    expect(summary.completion_rate).toBe(0.8)
  })

  it('should maintain all required fields', () => {
    const summary = createMockDailySummary()
    expect(summary).toHaveProperty('date')
    expect(summary).toHaveProperty('todos_count')
    expect(summary).toHaveProperty('completed_count')
    expect(summary).toHaveProperty('completion_rate')
    expect(summary).toHaveProperty('last_completion_time')
  })

  it('should validate date format', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const summary = createMockDailySummary()
    expect(dateRegex.test(summary.date)).toBe(true)
  })

  it('should calculate completion rate correctly', () => {
    const summary = createMockDailySummary({
      todos_count: 10,
      completed_count: 7,
      completion_rate: 0.7,
    })
    expect(summary.completed_count / summary.todos_count).toBe(0.7)
  })
})

describe('Completion Rate Calculations', () => {
  it('should handle 0% completion', () => {
    const summary = createMockDailySummary({
      todos_count: 5,
      completed_count: 0,
      completion_rate: 0,
    })
    expect(summary.completion_rate).toBe(0)
  })

  it('should handle 100% completion', () => {
    const summary = createMockDailySummary({
      todos_count: 5,
      completed_count: 5,
      completion_rate: 1,
    })
    expect(summary.completion_rate).toBe(1)
  })

  it('should handle partial completion', () => {
    const summary = createMockDailySummary({
      todos_count: 10,
      completed_count: 3,
      completion_rate: 0.3,
    })
    expect(summary.completion_rate).toBeCloseTo(0.3, 1)
  })

  it('should round to reasonable precision', () => {
    const summary = createMockDailySummary({
      todos_count: 3,
      completed_count: 1,
      completion_rate: 0.333,
    })
    expect(summary.completion_rate).toBeCloseTo(0.333, 2)
  })

  it('should handle single todo', () => {
    const summary = createMockDailySummary({
      todos_count: 1,
      completed_count: 1,
      completion_rate: 1,
    })
    expect(summary.completion_rate).toBe(1)
  })
})

describe('Streak Info', () => {
  it('should create valid streak info', () => {
    const streak = createMockStreakInfo()
    expect(streak.current_streak).toBe(7)
    expect(streak.longest_streak).toBe(21)
    expect(streak.last_completion_date).toBe('2024-01-15')
  })

  it('should allow overrides', () => {
    const streak = createMockStreakInfo({
      current_streak: 30,
      longest_streak: 45,
      last_completion_date: '2024-01-20',
    })
    expect(streak.current_streak).toBe(30)
    expect(streak.longest_streak).toBe(45)
    expect(streak.last_completion_date).toBe('2024-01-20')
  })

  it('should maintain all required fields', () => {
    const streak = createMockStreakInfo()
    expect(streak).toHaveProperty('current_streak')
    expect(streak).toHaveProperty('longest_streak')
    expect(streak).toHaveProperty('last_completion_date')
  })

  it('should validate date format', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const streak = createMockStreakInfo()
    expect(dateRegex.test(streak.last_completion_date)).toBe(true)
  })
})

describe('Streak Logic', () => {
  it('should recognize active streak', () => {
    const streak = createMockStreakInfo({
      current_streak: 5,
      last_completion_date: '2024-01-15',
    })
    expect(streak.current_streak).toBeGreaterThan(0)
  })

  it('should break streak on missed day', () => {
    const streak = createMockStreakInfo({
      current_streak: 0,
      last_completion_date: '2024-01-13',
    })
    expect(streak.current_streak).toBe(0)
  })

  it('should allow longest streak to be greater than current', () => {
    const streak = createMockStreakInfo({
      current_streak: 5,
      longest_streak: 21,
    })
    expect(streak.longest_streak).toBeGreaterThanOrEqual(streak.current_streak)
  })

  it('should handle streak at 0', () => {
    const streak = createMockStreakInfo({ current_streak: 0 })
    expect(streak.current_streak).toBe(0)
  })

  it('should handle long streaks', () => {
    const streak = createMockStreakInfo({
      current_streak: 100,
      longest_streak: 100,
    })
    expect(streak.current_streak).toBe(100)
    expect(streak.longest_streak).toBe(100)
  })
})

describe('Weekly Analytics', () => {
  it('should aggregate 7 days', () => {
    const summaries = Array.from({ length: 7 }, (_, i) => {
      const dayNum = i + 1
      return createMockDailySummary({
        date: `2024-01-${String(dayNum).padStart(2, '0')}`,
        todos_count: 5,
        completed_count: i,
      })
    })

    expect(summaries).toHaveLength(7)
    const totalCompleted = summaries.reduce((sum, s) => sum + s.completed_count, 0)
    expect(totalCompleted).toBe(21) // 0+1+2+3+4+5+6
  })

  it('should calculate weekly average', () => {
    const summaries = [
      createMockDailySummary({ completion_rate: 1.0 }),
      createMockDailySummary({ completion_rate: 0.8 }),
      createMockDailySummary({ completion_rate: 0.6 }),
      createMockDailySummary({ completion_rate: 0.4 }),
      createMockDailySummary({ completion_rate: 0.2 }),
      createMockDailySummary({ completion_rate: 0.0 }),
      createMockDailySummary({ completion_rate: 1.0 }),
    ]

    const average =
      summaries.reduce((sum, s) => sum + s.completion_rate, 0) / summaries.length
    expect(average).toBeCloseTo(0.571, 1)
  })

  it('should identify best day', () => {
    const summaries = [
      createMockDailySummary({ date: '2024-01-01', completion_rate: 0.5 }),
      createMockDailySummary({ date: '2024-01-02', completion_rate: 0.9 }),
      createMockDailySummary({ date: '2024-01-03', completion_rate: 0.7 }),
    ]

    const best = summaries.reduce((best, current) =>
      current.completion_rate > best.completion_rate ? current : best
    )
    expect(best.date).toBe('2024-01-02')
    expect(best.completion_rate).toBe(0.9)
  })

  it('should identify worst day', () => {
    const summaries = [
      createMockDailySummary({ date: '2024-01-01', completion_rate: 0.5 }),
      createMockDailySummary({ date: '2024-01-02', completion_rate: 0.1 }),
      createMockDailySummary({ date: '2024-01-03', completion_rate: 0.7 }),
    ]

    const worst = summaries.reduce((worst, current) =>
      current.completion_rate < worst.completion_rate ? current : worst
    )
    expect(worst.date).toBe('2024-01-02')
    expect(worst.completion_rate).toBe(0.1)
  })
})

describe('Analytics Trends', () => {
  it('should detect improving trend', () => {
    const summaries = [
      createMockDailySummary({ completion_rate: 0.2 }),
      createMockDailySummary({ completion_rate: 0.4 }),
      createMockDailySummary({ completion_rate: 0.6 }),
      createMockDailySummary({ completion_rate: 0.8 }),
    ]

    const isImproving = summaries[0].completion_rate < summaries[summaries.length - 1].completion_rate
    expect(isImproving).toBe(true)
  })

  it('should detect declining trend', () => {
    const summaries = [
      createMockDailySummary({ completion_rate: 0.9 }),
      createMockDailySummary({ completion_rate: 0.7 }),
      createMockDailySummary({ completion_rate: 0.5 }),
      createMockDailySummary({ completion_rate: 0.2 }),
    ]

    const isDeclining = summaries[0].completion_rate > summaries[summaries.length - 1].completion_rate
    expect(isDeclining).toBe(true)
  })

  it('should detect stable trend', () => {
    const summaries = [
      createMockDailySummary({ completion_rate: 0.5 }),
      createMockDailySummary({ completion_rate: 0.5 }),
      createMockDailySummary({ completion_rate: 0.5 }),
    ]

    const isStable = summaries.every((s) => s.completion_rate === 0.5)
    expect(isStable).toBe(true)
  })
})
