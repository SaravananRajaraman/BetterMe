import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getGuestData,
  saveGuestData,
  clearGuestData,
  getGuestTodosForDate,
  getGuestCategories,
  createGuestTodo,
  updateGuestTodo,
  deleteGuestTodo,
  toggleGuestCompletion,
  createGuestCategory,
  updateGuestCategory,
  deleteGuestCategory,
  upsertGuestWeightEntry,
  getGuestWeightEntries,
  deleteGuestWeightEntry,
} from '@/lib/guest-storage'
import type { GuestData } from '@/lib/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Guest Storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getGuestData', () => {
    it('should return default data on first call', () => {
      const data = getGuestData()
      expect(data.categories).toHaveLength(4)
      expect(data.todos).toHaveLength(0)
      expect(data.completions).toHaveLength(0)
      expect(data.weightEntries).toHaveLength(0)
      expect(data.lastPromptDate).toBeNull()
    })

    it('should create default categories with correct names', () => {
      const data = getGuestData()
      const categoryNames = data.categories.map((c) => c.name)
      expect(categoryNames).toContain('Health')
      expect(categoryNames).toContain('Work')
      expect(categoryNames).toContain('Personal')
      expect(categoryNames).toContain('Learning')
    })

    it('should persist data in localStorage', () => {
      getGuestData()
      const stored = localStorage.getItem('betterme-guest-data')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toBeDefined()
    })

    it('should return same data on subsequent calls', () => {
      const data1 = getGuestData()
      const data2 = getGuestData()
      expect(data1.categories).toEqual(data2.categories)
    })

    it('should handle legacy data without weightEntries', () => {
      const legacyData = {
        categories: [],
        todos: [],
        completions: [],
        lastPromptDate: null,
      }
      localStorage.setItem('betterme-guest-data', JSON.stringify(legacyData))
      const data = getGuestData()
      expect(data.weightEntries).toEqual([])
    })
  })

  describe('saveGuestData', () => {
    it('should save data to localStorage', () => {
      const data: GuestData = {
        categories: [],
        todos: [],
        completions: [],
        weightEntries: [],
        lastPromptDate: null,
      }
      saveGuestData(data)
      const stored = localStorage.getItem('betterme-guest-data')
      expect(JSON.parse(stored!)).toEqual(data)
    })
  })

  describe('clearGuestData', () => {
    it('should remove guest data from localStorage', () => {
      getGuestData()
      expect(localStorage.getItem('betterme-guest-data')).not.toBeNull()
      clearGuestData()
      expect(localStorage.getItem('betterme-guest-data')).toBeNull()
    })
  })

  describe('getGuestCategories', () => {
    it('should return all guest categories', () => {
      const categories = getGuestCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('id')
      expect(categories[0]).toHaveProperty('name')
    })

    it('should include default categories', () => {
      const categories = getGuestCategories()
      const names = categories.map((c) => c.name)
      expect(names).toContain('Health')
    })
  })

  describe('createGuestTodo', () => {
    it('should create a new todo', () => {
      const todo = createGuestTodo({ title: 'Test Todo' })
      expect(todo).toHaveProperty('id')
      expect(todo.title).toBe('Test Todo')
      expect(todo.user_id).toBe('guest')
      expect(todo.is_active).toBe(true)
    })

    it('should persist todo to storage', () => {
      const todo = createGuestTodo({ title: 'Test Todo' })
      const data = getGuestData()
      expect(data.todos).toContainEqual(todo)
    })

    it('should set default values for optional fields', () => {
      const todo = createGuestTodo({ title: 'Test' })
      expect(todo.description).toBeNull()
      expect(todo.category_id).toBeNull()
      expect(todo.recurrence_type).toBe('daily')
      expect(todo.recurrence_interval).toBe(1)
    })

    it('should accept all properties', () => {
      const categories = getGuestCategories()
      const todo = createGuestTodo({
        title: 'Test',
        description: 'A test todo',
        category_id: categories[0].id,
        reminder_time: '09:00',
        recurrence_type: 'weekly',
        recurrence_interval: 2,
        recurrence_days: [0, 1, 2],
      })
      expect(todo.description).toBe('A test todo')
      expect(todo.category_id).toBe(categories[0].id)
      expect(todo.reminder_time).toBe('09:00')
      expect(todo.recurrence_type).toBe('weekly')
      expect(todo.recurrence_interval).toBe(2)
      expect(todo.recurrence_days).toEqual([0, 1, 2])
    })
  })

  describe('updateGuestTodo', () => {
    it('should update an existing todo', () => {
      const created = createGuestTodo({ title: 'Original' })
      const updated = updateGuestTodo(created.id, { title: 'Updated' })
      expect(updated.title).toBe('Updated')
    })

    it('should persist updates to storage', () => {
      const created = createGuestTodo({ title: 'Original' })
      updateGuestTodo(created.id, { title: 'Updated' })
      const data = getGuestData()
      const stored = data.todos.find((t) => t.id === created.id)
      expect(stored?.title).toBe('Updated')
    })

    it('should throw error for non-existent todo', () => {
      expect(() => updateGuestTodo('non-existent-id', { title: 'Updated' })).toThrow(
        'Todo not found'
      )
    })

    it('should preserve unmodified fields', () => {
      const created = createGuestTodo({ title: 'Test', description: 'Original desc' })
      updateGuestTodo(created.id, { title: 'Updated' })
      const data = getGuestData()
      const stored = data.todos.find((t) => t.id === created.id)
      expect(stored?.description).toBe('Original desc')
    })
  })

  describe('deleteGuestTodo', () => {
    it('should delete a todo', () => {
      const created = createGuestTodo({ title: 'Test' })
      deleteGuestTodo(created.id)
      const data = getGuestData()
      expect(data.todos).not.toContainEqual(expect.objectContaining({ id: created.id }))
    })

    it('should remove associated completions', () => {
      const todo = createGuestTodo({ title: 'Test' })
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      deleteGuestTodo(todo.id)
      const data = getGuestData()
      expect(data.completions).toHaveLength(0)
    })
  })

  describe('toggleGuestCompletion', () => {
    it('should mark todo as completed', () => {
      const todo = createGuestTodo({ title: 'Test' })
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      const data = getGuestData()
      expect(data.completions).toHaveLength(1)
      expect(data.completions[0].todo_id).toBe(todo.id)
      expect(data.completions[0].completed_date).toBe('2024-01-01')
    })

    it('should not duplicate completion if already exists', () => {
      const todo = createGuestTodo({ title: 'Test' })
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      const data = getGuestData()
      expect(data.completions).toHaveLength(1)
    })

    it('should remove completion when toggled off', () => {
      const todo = createGuestTodo({ title: 'Test' })
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      toggleGuestCompletion(todo.id, false, false, '2024-01-01')
      const data = getGuestData()
      expect(data.completions).toHaveLength(0)
    })
  })

  describe('createGuestCategory', () => {
    it('should create a new category', () => {
      const category = createGuestCategory({
        name: 'Shopping',
        color: '#ff0000',
        icon: 'shopping-bag',
      })
      expect(category.name).toBe('Shopping')
      expect(category.color).toBe('#ff0000')
      expect(category.icon).toBe('shopping-bag')
    })

    it('should persist category to storage', () => {
      const category = createGuestCategory({
        name: 'Shopping',
        color: '#ff0000',
        icon: 'shopping-bag',
      })
      const data = getGuestData()
      expect(data.categories).toContainEqual(expect.objectContaining({ id: category.id }))
    })

    it('should set is_default to false', () => {
      const category = createGuestCategory({
        name: 'Shopping',
        color: '#ff0000',
        icon: 'shopping-bag',
      })
      expect(category.is_default).toBe(false)
    })
  })

  describe('updateGuestCategory', () => {
    it('should update an existing category', () => {
      const category = createGuestCategory({
        name: 'Original',
        color: '#ff0000',
        icon: 'icon1',
      })
      const updated = updateGuestCategory(category.id, { name: 'Updated' })
      expect(updated.name).toBe('Updated')
    })

    it('should throw error for non-existent category', () => {
      expect(() =>
        updateGuestCategory('non-existent-id', { name: 'Updated' })
      ).toThrow('Category not found')
    })
  })

  describe('deleteGuestCategory', () => {
    it('should delete a category', () => {
      const category = createGuestCategory({
        name: 'Shopping',
        color: '#ff0000',
        icon: 'shopping-bag',
      })
      deleteGuestCategory(category.id)
      const data = getGuestData()
      expect(data.categories).not.toContainEqual(
        expect.objectContaining({ id: category.id })
      )
    })

    it('should remove category from todos', () => {
      const category = createGuestCategory({
        name: 'Shopping',
        color: '#ff0000',
        icon: 'shopping-bag',
      })
      const todo = createGuestTodo({
        title: 'Buy milk',
        category_id: category.id,
      })
      deleteGuestCategory(category.id)
      const data = getGuestData()
      const stored = data.todos.find((t) => t.id === todo.id)
      expect(stored?.category_id).toBeNull()
    })
  })

  describe('upsertGuestWeightEntry', () => {
    it('should add a weight entry', () => {
      const entry = upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      expect(entry.weight).toBe(70)
      expect(entry.unit).toBe('kg')
      expect(entry.date).toBe('2024-01-01')
    })

    it('should persist entry to storage', () => {
      const entry = upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      const data = getGuestData()
      expect(data.weightEntries).toContainEqual(expect.objectContaining({ id: entry.id }))
    })

    it('should update existing entry for same date', () => {
      const entry1 = upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      const entry2 = upsertGuestWeightEntry({ weight: 72, unit: 'kg', date: '2024-01-01' })
      expect(entry1.id).toBe(entry2.id)
      expect(entry2.weight).toBe(72)
    })

    it('should accept optional notes field', () => {
      const entry = upsertGuestWeightEntry({
        weight: 70,
        unit: 'kg',
        date: '2024-01-01',
        notes: 'After breakfast',
      })
      expect(entry.notes).toBe('After breakfast')
    })
  })

  describe('getGuestWeightEntries', () => {
    it('should return all weight entries', () => {
      upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      upsertGuestWeightEntry({ weight: 71, unit: 'kg', date: '2024-01-02' })
      const entries = getGuestWeightEntries()
      expect(entries).toHaveLength(2)
    })

    it('should return empty array if no entries', () => {
      const entries = getGuestWeightEntries()
      expect(entries).toHaveLength(0)
    })

    it('should sort entries by date descending', () => {
      upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      upsertGuestWeightEntry({ weight: 71, unit: 'kg', date: '2024-01-03' })
      upsertGuestWeightEntry({ weight: 72, unit: 'kg', date: '2024-01-02' })
      const entries = getGuestWeightEntries()
      expect(entries[0].date).toBe('2024-01-03')
      expect(entries[1].date).toBe('2024-01-02')
      expect(entries[2].date).toBe('2024-01-01')
    })

    it('should respect limit parameter', () => {
      for (let i = 0; i < 100; i++) {
        upsertGuestWeightEntry({ weight: 70 + i, unit: 'kg', date: `2024-01-${String(i + 1).padStart(2, '0')}` })
      }
      const entries = getGuestWeightEntries(10)
      expect(entries.length).toBeLessThanOrEqual(10)
    })
  })

  describe('deleteGuestWeightEntry', () => {
    it('should delete a weight entry', () => {
      const entry = upsertGuestWeightEntry({ weight: 70, unit: 'kg', date: '2024-01-01' })
      deleteGuestWeightEntry(entry.id)
      const entries = getGuestWeightEntries()
      expect(entries).toHaveLength(0)
    })
  })
})
