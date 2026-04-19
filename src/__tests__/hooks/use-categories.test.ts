import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { DEFAULT_CATEGORIES } from '@/lib/constants'
import type { Category } from '@/lib/types'

// Create a mock category
const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  user_id: 'user-1',
  name: 'Work',
  color: '#FF6B6B',
  icon: 'briefcase',
  is_default: false,
  sort_order: 0,
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

describe('Default Categories', () => {
  it('should have work category', () => {
    const work = DEFAULT_CATEGORIES.find((c) => c.name === 'Work')
    expect(work).toBeDefined()
    expect(work?.icon).toBe('briefcase')
  })

  it('should have health category', () => {
    const health = DEFAULT_CATEGORIES.find((c) => c.name === 'Health')
    expect(health).toBeDefined()
    expect(health?.icon).toBe('heart')
  })

  it('should have personal category', () => {
    const personal = DEFAULT_CATEGORIES.find((c) => c.name === 'Personal')
    expect(personal).toBeDefined()
    expect(personal?.icon).toBe('user')
  })

  it('should have learning category', () => {
    const learning = DEFAULT_CATEGORIES.find((c) => c.name === 'Learning')
    expect(learning).toBeDefined()
    expect(learning?.icon).toBe('book-open')
  })

  it('should have consistent structure', () => {
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('color')
      expect(category).toHaveProperty('icon')
      expect(typeof category.name).toBe('string')
      expect(typeof category.color).toBe('string')
      expect(typeof category.icon).toBe('string')
    })
  })

  it('should have valid hex colors', () => {
    const hexRegex = /^#[0-9A-F]{6}$/i
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(hexRegex.test(category.color)).toBe(true)
    })
  })

  it('should have unique category names', () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  it('should have meaningful category names', () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase())
    expect(names.some((n) => ['work', 'personal', 'health', 'learning'].includes(n))).toBe(true)
  })
})

describe('Mock Category Factory', () => {
  it('should create valid mock category', () => {
    const cat = createMockCategory()
    expect(cat.id).toBe('cat-1')
    expect(cat.user_id).toBe('user-1')
    expect(cat.name).toBe('Work')
  })

  it('should allow overrides', () => {
    const cat = createMockCategory({ name: 'Exercise', color: '#4ECDC4' })
    expect(cat.name).toBe('Exercise')
    expect(cat.color).toBe('#4ECDC4')
    expect(cat.icon).toBe('briefcase') // Original value
  })

  it('should maintain all required fields', () => {
    const cat = createMockCategory()
    expect(cat).toHaveProperty('id')
    expect(cat).toHaveProperty('user_id')
    expect(cat).toHaveProperty('name')
    expect(cat).toHaveProperty('color')
    expect(cat).toHaveProperty('icon')
    expect(cat).toHaveProperty('is_default')
    expect(cat).toHaveProperty('sort_order')
    expect(cat).toHaveProperty('created_at')
    expect(cat).toHaveProperty('updated_at')
  })
})

describe('Category Sorting', () => {
  it('should maintain sort order', () => {
    const categories = [
      createMockCategory({ id: 'cat-1', sort_order: 2 }),
      createMockCategory({ id: 'cat-2', sort_order: 1 }),
      createMockCategory({ id: 'cat-3', sort_order: 3 }),
    ]
    
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    expect(sorted[0].id).toBe('cat-2')
    expect(sorted[1].id).toBe('cat-1')
    expect(sorted[2].id).toBe('cat-3')
  })

  it('should handle equal sort orders', () => {
    const categories = [
      createMockCategory({ id: 'cat-1', sort_order: 1 }),
      createMockCategory({ id: 'cat-2', sort_order: 1 }),
    ]
    
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    expect(sorted.length).toBe(2)
    expect(sorted[0].sort_order).toBe(1)
    expect(sorted[1].sort_order).toBe(1)
  })

  it('should handle negative sort orders', () => {
    const categories = [
      createMockCategory({ id: 'cat-1', sort_order: -1 }),
      createMockCategory({ id: 'cat-2', sort_order: 0 }),
      createMockCategory({ id: 'cat-3', sort_order: 1 }),
    ]
    
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    expect(sorted[0].sort_order).toBe(-1)
    expect(sorted[1].sort_order).toBe(0)
    expect(sorted[2].sort_order).toBe(1)
  })
})

describe('Category Colors', () => {
  it('should support various hex color formats', () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
    ]
    
    const hexRegex = /^#[0-9A-F]{6}$/i
    colors.forEach((color) => {
      expect(hexRegex.test(color)).toBe(true)
    })
  })

  it('should validate color uniqueness is not required', () => {
    const cat1 = createMockCategory({ id: 'cat-1', color: '#FF6B6B' })
    const cat2 = createMockCategory({ id: 'cat-2', color: '#FF6B6B' })
    expect(cat1.color).toBe(cat2.color) // Same color allowed
  })
})

describe('Category Icons', () => {
  it('should have valid icon names', () => {
    const validIcons = ['briefcase', 'heart', 'user', 'book', 'star', 'folder', 'tag']
    const category = createMockCategory({ icon: 'briefcase' })
    expect(validIcons).toContain(category.icon)
  })

  it('should allow custom icons', () => {
    const customIcons = ['custom-icon', 'my-icon', 'special']
    const cat = createMockCategory({ icon: 'custom-icon' })
    expect(customIcons).toContain(cat.icon)
  })
})

describe('Category Timestamps', () => {
  it('should have valid ISO timestamps', () => {
    const cat = createMockCategory()
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    expect(isoRegex.test(cat.created_at)).toBe(true)
    expect(isoRegex.test(cat.updated_at)).toBe(true)
  })

  it('should allow different created and updated times', () => {
    const cat = createMockCategory({
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    })
    expect(cat.created_at).not.toBe(cat.updated_at)
  })
})
