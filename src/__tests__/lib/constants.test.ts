import { describe, it, expect } from 'vitest'
import {
  DEFAULT_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_COLORS_TEXT,
  CATEGORY_COLORS_BG_LIGHT,
} from '@/lib/constants'

describe('Constants', () => {
  describe('DEFAULT_CATEGORIES', () => {
    it('should have 4 default categories', () => {
      expect(DEFAULT_CATEGORIES).toHaveLength(4)
    })

    it('should have required properties for each category', () => {
      DEFAULT_CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('color')
        expect(category).toHaveProperty('icon')
        expect(typeof category.name).toBe('string')
        expect(typeof category.color).toBe('string')
        expect(typeof category.icon).toBe('string')
      })
    })

    it('should have Health as first category', () => {
      expect(DEFAULT_CATEGORIES[0].name).toBe('Health')
    })

    it('should have Work as second category', () => {
      expect(DEFAULT_CATEGORIES[1].name).toBe('Work')
    })

    it('should have Personal as third category', () => {
      expect(DEFAULT_CATEGORIES[2].name).toBe('Personal')
    })

    it('should have Learning as fourth category', () => {
      expect(DEFAULT_CATEGORIES[3].name).toBe('Learning')
    })

    it('should have unique icons for each category', () => {
      const icons = DEFAULT_CATEGORIES.map((c) => c.icon)
      expect(new Set(icons).size).toBe(icons.length)
    })
  })

  describe('CATEGORY_COLORS', () => {
    it('should have color mappings', () => {
      expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThan(0)
    })

    it('should map colors to bg-* tailwind classes', () => {
      Object.values(CATEGORY_COLORS).forEach((value) => {
        expect(value).toMatch(/^bg-/)
      })
    })

    it('should contain green, blue, purple, and amber colors', () => {
      expect(CATEGORY_COLORS['#22c55e']).toBe('bg-green-500')
      expect(CATEGORY_COLORS['#3b82f6']).toBe('bg-blue-500')
      expect(CATEGORY_COLORS['#a855f7']).toBe('bg-purple-500')
      expect(CATEGORY_COLORS['#f59e0b']).toBe('bg-amber-500')
    })
  })

  describe('CATEGORY_COLORS_TEXT', () => {
    it('should have text color mappings', () => {
      expect(Object.keys(CATEGORY_COLORS_TEXT).length).toBeGreaterThan(0)
    })

    it('should map colors to text-* tailwind classes', () => {
      Object.values(CATEGORY_COLORS_TEXT).forEach((value) => {
        expect(value).toMatch(/^text-/)
      })
    })

    it('should contain same color keys as CATEGORY_COLORS', () => {
      expect(Object.keys(CATEGORY_COLORS_TEXT).sort()).toEqual(
        Object.keys(CATEGORY_COLORS).sort()
      )
    })
  })

  describe('CATEGORY_COLORS_BG_LIGHT', () => {
    it('should have light background color mappings', () => {
      expect(Object.keys(CATEGORY_COLORS_BG_LIGHT).length).toBeGreaterThan(0)
    })

    it('should include dark mode variants', () => {
      Object.values(CATEGORY_COLORS_BG_LIGHT).forEach((value) => {
        expect(value).toContain('dark:')
      })
    })

    it('should contain same color keys as CATEGORY_COLORS', () => {
      expect(Object.keys(CATEGORY_COLORS_BG_LIGHT).sort()).toEqual(
        Object.keys(CATEGORY_COLORS).sort()
      )
    })

    it('should map to light background classes', () => {
      expect(CATEGORY_COLORS_BG_LIGHT['#22c55e']).toContain('bg-green-100')
      expect(CATEGORY_COLORS_BG_LIGHT['#3b82f6']).toContain('bg-blue-100')
    })
  })
})
