import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { shouldShowTodoOnDate, useTodos, useCreateTodo, useToggleTodoCompletion } from '@/hooks/use-todos'
import { parseISO } from 'date-fns'
import type { Todo } from '@/lib/types'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

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

// Helper to create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

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
      // Day 6 (2024-01-07): 6 % 3 === 0 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-07')).toBe(true)
    })

    it('should respect interval of 1', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'interval',
        recurrence_interval: 1,
        created_at: '2024-01-01T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-03')).toBe(true)
    })

    it('should not show interval todos before creation date', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'interval',
        recurrence_interval: 2,
        created_at: '2024-01-10T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-05')).toBe(false)
      expect(shouldShowTodoOnDate(todo, '2024-01-09')).toBe(false)
      expect(shouldShowTodoOnDate(todo, '2024-01-10')).toBe(true)
    })

    it('should use default interval of 1 if not specified', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'interval',
        recurrence_interval: undefined,
        created_at: '2024-01-01T00:00:00Z',
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-02')).toBe(true)
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
      // 2024-01-04 is Thursday (day 4) ✗
      expect(shouldShowTodoOnDate(todo, '2024-01-04')).toBe(false)
      // 2024-01-05 is Friday (day 5) ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-05')).toBe(true)
    })

    it('should handle weekends only', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
        recurrence_days: [0, 6], // Sunday, Saturday
      })
      // 2024-01-06 is Saturday (day 6) ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-06')).toBe(true)
      // 2024-01-07 is Sunday (day 0) ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-07')).toBe(true)
      // 2024-01-01 is Monday (day 1) ✗
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
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

    it('should handle single day', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'weekly',
        recurrence_days: [3], // Wednesday only
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-03')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-01-10')).toBe(true) // Next Wednesday
      expect(shouldShowTodoOnDate(todo, '2024-01-04')).toBe(false)
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
      // 2024-01-30 is day 30 ✓
      expect(shouldShowTodoOnDate(todo, '2024-01-30')).toBe(true)
      // 2024-02-15 is also day 15 ✓
      expect(shouldShowTodoOnDate(todo, '2024-02-15')).toBe(true)
    })

    it('should handle every day of month', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: Array.from({ length: 31 }, (_, i) => i + 1),
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-15')).toBe(true)
      expect(shouldShowTodoOnDate(todo, '2024-02-15')).toBe(true)
    })

    it('should handle empty recurrence_days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [],
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
      expect(shouldShowTodoOnDate(todo, '2024-02-01')).toBe(false)
    })

    it('should handle null recurrence_days', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: null,
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-01')).toBe(false)
    })

    it('should handle last day of month', () => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [31],
      })
      expect(shouldShowTodoOnDate(todo, '2024-01-31')).toBe(true)
      // February only has 29 days in 2024
      expect(shouldShowTodoOnDate(todo, '2024-02-29')).toBe(false)
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
