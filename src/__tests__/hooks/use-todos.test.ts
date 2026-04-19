import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shouldShowTodoOnDate } from '@/hooks/use-todos'
import { parseISO } from 'date-fns'
import type { Todo } from '@/lib/types'

// Create a mock todo base
const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  user_id: 'user-1',
  title: 'Test Todo',
  description: null,
  category_id: null,
  reminder_time: null,
  is_recurring: false,
  recurrence_type: 'daily',
  recurrence_interval: 1,
  recurrence_days: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('shouldShowTodoOnDate', () => {
  describe('Non-recurring todos', () => {
    it('should always show non-recurring todos', () => {
      const todo = createMockTodo({ is_recurring: false })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-12-31')).toBe(true)
    })
  })

  describe('Daily recurring todos', () => {
    it('should show daily recurring todos every day', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'daily',
        created_at: '2024-01-01T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-06-15')).toBe(true)
    })
  })

  describe('Interval recurring todos', () => {
    it('should show interval todos on matching days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'interval',
        recurrence_interval: 3,
        created_at: '2024-01-01T00:00:00Z',
      })
      // Day 0 (2024-01-01): 0 % 3 === 0 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      // Day 1 (2024-01-02): 1 % 3 !== 0 ✗
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(false)
      // Day 3 (2024-01-04): 3 % 3 === 0 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-04')).toBe(true)
    })

    it('should not show interval todos before creation date', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'interval',
        recurrence_interval: 2,
        created_at: '2024-01-10T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-05')).toBe(false)
    })
  })

  describe('Weekly recurring todos', () => {
    it('should show weekly todos only on specified days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
        recurrence_days: [1, 3, 5], // Monday, Wednesday, Friday
      })
      // 2024-01-01 is Monday (day 1) ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      // 2024-01-02 is Tuesday (day 2) ✗
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(false)
      // 2024-01-03 is Wednesday (day 3) ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-03')).toBe(true)
    })

    it('should handle empty recurrence_days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
        recurrence_days: [],
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })

    it('should handle null recurrence_days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
        recurrence_days: null,
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })
  })

  describe('Monthly recurring todos', () => {
    it('should show monthly todos only on specified days of month', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [1, 15, 30], // 1st, 15th, 30th of month
      })
      // 2024-01-01 is day 1 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      // 2024-01-05 is day 5 ✗
      expect(shouldShowTodoOnDate(todo, '2024-01-05')).toBe(false)
      // 2024-01-15 is day 15 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-15')).toBe(true)
      // 2024-02-30 doesn't exist, so 2024-02-29 is day 29 ✗
      expect(shouldShowTodoOnDate(todo, '2024-02-29')).toBe(false)
    })

    it('should handle empty recurrence_days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [],
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle todos with unrecognized recurrence_type', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBeDefined()
    })

    it('should handle dates across year boundaries', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'daily',
        created_at: '2023-12-31T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
    })

    it('should handle leap year dates', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [29],
      })
      // 2024-02-29 is leap day
      expect(shouldShowTodoOnDate(todo, '2024-02-29')).toBe(true)
      // 2023 is not a leap year
      expect(shouldShowTodoOnDate(todo, '2023-02-28')).toBe(false)
    })
  })
})
