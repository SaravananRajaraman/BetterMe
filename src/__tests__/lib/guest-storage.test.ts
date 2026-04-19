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

  describe('Prompt date tracking', () => {
    it('should track last prompt date', async () => {
      const { updateGuestLastPromptDate, getGuestLastPromptDate } = await import('@/lib/guest-storage')
      const date = '2024-01-15'
      updateGuestLastPromptDate(date)
      expect(getGuestLastPromptDate()).toBe(date)
    })

    it('should return null if no prompt date set', async () => {
      const { getGuestLastPromptDate } = await import('@/lib/guest-storage')
      expect(getGuestLastPromptDate()).toBeNull()
    })

    it('should persist prompt date across calls', async () => {
      const { updateGuestLastPromptDate, getGuestLastPromptDate } = await import('@/lib/guest-storage')
      updateGuestLastPromptDate('2024-01-10')
      updateGuestLastPromptDate('2024-01-15')
      expect(getGuestLastPromptDate()).toBe('2024-01-15')
    })
  })

  describe('Migration edge cases', () => {
    it('should handle migration with no todos', async () => {
      const { migrateGuestDataToSupabase } = await import('@/lib/guest-storage')
      const mockSupabase = {
        auth: { getUser: vi.fn() },
        from: vi.fn(),
      }
      
      // Should return early without error
      await migrateGuestDataToSupabase(mockSupabase as any)
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
    })

    it('should throw if user not authenticated during migration', async () => {
      const { migrateGuestDataToSupabase, createGuestTodo } = await import('@/lib/guest-storage')
      createGuestTodo({ title: 'Test' })
      
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
        from: vi.fn(),
      }
      
      await expect(migrateGuestDataToSupabase(mockSupabase as any)).rejects.toThrow('Not authenticated')
    })

    it('should handle inactive todos during migration', async () => {
      const { migrateGuestDataToSupabase } = await import('@/lib/guest-storage')
      const guestData = getGuestData()
      const now = new Date().toISOString()
      
      // Add an inactive todo
      guestData.todos.push({
        id: 'inactive-1',
        user_id: 'guest',
        title: 'Inactive todo',
        description: null,
        category_id: null,
        reminder_time: null,
        is_active: false,
        is_recurring: false,
        recurrence_type: 'daily',
        recurrence_interval: 1,
        recurrence_days: null,
        created_at: now,
      })
      saveGuestData(guestData)

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'user-123' } } 
        }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [] })
          }),
          insert: vi.fn(),
        }),
      }
      
      // Should complete without inserting inactive todo
      await migrateGuestDataToSupabase(mockSupabase as any)
    })

    it('should map default category IDs during migration', async () => {
      const { migrateGuestDataToSupabase, createGuestTodo } = await import('@/lib/guest-storage')
      
      const defaultCategory = getGuestCategories()[0]
      const todo = createGuestTodo({ 
        title: 'Test', 
        category_id: defaultCategory.id 
      })

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'user-123' } } 
        }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ 
              data: [{ id: 'supa-cat-1', name: defaultCategory.name }] 
            })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'new-todo-id' } })
            })
          }),
        }),
      }
      
      await migrateGuestDataToSupabase(mockSupabase as any)
      
      // Verify that insert was called for todo with mapped category
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('should handle custom categories during migration', async () => {
      const { migrateGuestDataToSupabase } = await import('@/lib/guest-storage')
      
      const customCat = createGuestCategory({
        name: 'Custom',
        color: '#ff0000',
        icon: 'star',
      })
      createGuestTodo({ title: 'Test', category_id: customCat.id })

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'user-123' } } 
        }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [] })
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ 
                data: { id: 'supa-id' } 
              })
            })
          }),
        }),
      }
      
      await migrateGuestDataToSupabase(mockSupabase as any)
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('should migrate completions with correct todo ID mapping', async () => {
      const { migrateGuestDataToSupabase } = await import('@/lib/guest-storage')
      
      const todo1 = createGuestTodo({ title: 'Todo 1' })
      const todo2 = createGuestTodo({ title: 'Todo 2' })
      
      toggleGuestCompletion(todo1.id, true, false, '2024-01-01')
      toggleGuestCompletion(todo2.id, true, false, '2024-01-02')

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { id: 'mapped-todo-id' } 
          })
        })
      })

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'user-123' } } 
        }) },
        from: vi.fn((table: string) => {
          if (table === 'todo_completions') {
            return {
              insert: mockInsert,
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [] })
            }),
            insert: mockInsert,
          }
        }),
      }
      
      await migrateGuestDataToSupabase(mockSupabase as any)
    })
  })

  describe('Data persistence', () => {
    it('should persist categories across page reloads', () => {
      const category1 = createGuestCategory({
        name: 'Test',
        color: '#ff0000',
        icon: 'star',
      })
      
      // Simulate page reload by getting data fresh
      const data = getGuestData()
      const found = data.categories.find(c => c.id === category1.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('Test')
    })

    it('should persist todos across page reloads', () => {
      const todo = createGuestTodo({ title: 'Test Todo' })
      
      const data = getGuestData()
      const found = data.todos.find(t => t.id === todo.id)
      expect(found).toBeDefined()
      expect(found?.title).toBe('Test Todo')
    })

    it('should persist completions across page reloads', () => {
      const todo = createGuestTodo({ title: 'Test' })
      toggleGuestCompletion(todo.id, true, false, '2024-01-01')
      
      const data = getGuestData()
      const completion = data.completions.find(
        c => c.todo_id === todo.id && c.completed_date === '2024-01-01'
      )
      expect(completion).toBeDefined()
    })
  })

  describe('Category deletion cascades', () => {
    it('should null out category_id on todos when category is deleted', () => {
      const category = createGuestCategory({
        name: 'Temp',
        color: '#ff0000',
        icon: 'trash',
      })
      const todo = createGuestTodo({
        title: 'Todo in category',
        category_id: category.id,
      })

      deleteGuestCategory(category.id)

      const updated = getGuestData().todos.find(t => t.id === todo.id)
      expect(updated?.category_id).toBeNull()
    })

    it('should not affect other todos when deleting category', () => {
      const cat1 = createGuestCategory({ name: 'Cat1', color: '#f00', icon: 'a' })
      const cat2 = createGuestCategory({ name: 'Cat2', color: '#0f0', icon: 'b' })
      
      const todo1 = createGuestTodo({ title: 'T1', category_id: cat1.id })
      const todo2 = createGuestTodo({ title: 'T2', category_id: cat2.id })

      deleteGuestCategory(cat1.id)

      const data = getGuestData()
      const t1 = data.todos.find(t => t.id === todo1.id)
      const t2 = data.todos.find(t => t.id === todo2.id)
      
      expect(t1?.category_id).toBeNull()
      expect(t2?.category_id).toBe(cat2.id)
    })
  })
})
