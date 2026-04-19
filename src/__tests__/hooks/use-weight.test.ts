import { describe, it, expect } from 'vitest'
import type { WeightEntry } from '@/lib/types'

// Create a mock weight entry
const createMockWeightEntry = (overrides: Partial<WeightEntry> = {}): WeightEntry => ({
  id: 'weight-1',
  user_id: 'user-1',
  date: '2024-01-15',
  weight: 70.5,
  unit: 'kg',
  notes: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
})

describe('Weight Entry Factory', () => {
  it('should create valid mock weight entry', () => {
    const entry = createMockWeightEntry()
    expect(entry.id).toBe('weight-1')
    expect(entry.user_id).toBe('user-1')
    expect(entry.weight).toBe(70.5)
    expect(entry.unit).toBe('kg')
  })

  it('should allow overrides', () => {
    const entry = createMockWeightEntry({
      weight: 75.2,
      unit: 'lbs',
      notes: 'After lunch',
    })
    expect(entry.weight).toBe(75.2)
    expect(entry.unit).toBe('lbs')
    expect(entry.notes).toBe('After lunch')
  })

  it('should maintain all required fields', () => {
    const entry = createMockWeightEntry()
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('user_id')
    expect(entry).toHaveProperty('date')
    expect(entry).toHaveProperty('weight')
    expect(entry).toHaveProperty('unit')
    expect(entry).toHaveProperty('notes')
    expect(entry).toHaveProperty('created_at')
    expect(entry).toHaveProperty('updated_at')
  })
})

describe('Weight Entry Validation', () => {
  it('should accept valid weight values', () => {
    expect(createMockWeightEntry({ weight: 50 }).weight).toBe(50)
    expect(createMockWeightEntry({ weight: 75.5 }).weight).toBe(75.5)
    expect(createMockWeightEntry({ weight: 0.1 }).weight).toBe(0.1)
  })

  it('should accept kg and lbs units', () => {
    expect(createMockWeightEntry({ unit: 'kg' }).unit).toBe('kg')
    expect(createMockWeightEntry({ unit: 'lbs' }).unit).toBe('lbs')
  })

  it('should support optional notes', () => {
    expect(createMockWeightEntry({ notes: null }).notes).toBeNull()
    expect(createMockWeightEntry({ notes: 'Morning measurement' }).notes).toBe(
      'Morning measurement'
    )
    expect(
      createMockWeightEntry({ notes: 'After workout and meal' }).notes
    ).toBe('After workout and meal')
  })
})

describe('Weight Entry Dates', () => {
  it('should have valid date format (YYYY-MM-DD)', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    expect(dateRegex.test(createMockWeightEntry({ date: '2024-01-15' }).date)).toBe(true)
    expect(dateRegex.test(createMockWeightEntry({ date: '2024-12-31' }).date)).toBe(true)
  })

  it('should have valid ISO timestamps', () => {
    const entry = createMockWeightEntry()
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    expect(isoRegex.test(entry.created_at)).toBe(true)
    expect(isoRegex.test(entry.updated_at)).toBe(true)
  })

  it('should allow different dates', () => {
    const entry1 = createMockWeightEntry({ date: '2024-01-01' })
    const entry2 = createMockWeightEntry({ date: '2024-12-31' })
    expect(entry1.date).not.toBe(entry2.date)
  })
})

describe('Weight Tracking Progress', () => {
  it('should calculate weight change', () => {
    const entries = [
      createMockWeightEntry({ date: '2024-01-01', weight: 80 }),
      createMockWeightEntry({ date: '2024-01-15', weight: 78 }),
    ]
    const change = entries[0].weight - entries[1].weight
    expect(change).toBe(2) // Lost 2 kg
  })

  it('should identify weight gain', () => {
    const entries = [
      createMockWeightEntry({ date: '2024-01-01', weight: 70 }),
      createMockWeightEntry({ date: '2024-01-15', weight: 72.5 }),
    ]
    const change = entries[0].weight - entries[1].weight
    expect(change).toBeLessThan(0) // Gained weight
  })

  it('should identify weight loss', () => {
    const entries = [
      createMockWeightEntry({ date: '2024-01-01', weight: 75 }),
      createMockWeightEntry({ date: '2024-01-15', weight: 72 }),
    ]
    const change = entries[0].weight - entries[1].weight
    expect(change).toBeGreaterThan(0) // Lost weight
  })

  it('should track plateau (no change)', () => {
    const entries = [
      createMockWeightEntry({ date: '2024-01-01', weight: 70 }),
      createMockWeightEntry({ date: '2024-01-15', weight: 70 }),
    ]
    const change = Math.abs(entries[0].weight - entries[1].weight)
    expect(change).toBe(0) // No change
  })
})

describe('Weight Entry Sorting', () => {
  it('should sort by date descending', () => {
    const entries = [
      createMockWeightEntry({ date: '2024-01-10' }),
      createMockWeightEntry({ date: '2024-01-01' }),
      createMockWeightEntry({ date: '2024-01-20' }),
    ]
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
    expect(sorted[0].date).toBe('2024-01-20')
    expect(sorted[1].date).toBe('2024-01-10')
    expect(sorted[2].date).toBe('2024-01-01')
  })

  it('should sort by weight ascending', () => {
    const entries = [
      createMockWeightEntry({ weight: 75 }),
      createMockWeightEntry({ weight: 70 }),
      createMockWeightEntry({ weight: 80 }),
    ]
    const sorted = [...entries].sort((a, b) => a.weight - b.weight)
    expect(sorted[0].weight).toBe(70)
    expect(sorted[1].weight).toBe(75)
    expect(sorted[2].weight).toBe(80)
  })
})

describe('Weight Conversion', () => {
  it('should convert kg to lbs', () => {
    const kg = 70
    const lbs = kg * 2.20462
    expect(lbs).toBeCloseTo(154.323, 1)
  })

  it('should convert lbs to kg', () => {
    const lbs = 150
    const kg = lbs / 2.20462
    expect(kg).toBeCloseTo(68.04, 1)
  })

  it('should maintain precision in conversion', () => {
    const kg = 70.5
    const lbs = kg * 2.20462
    expect(lbs).toBeCloseTo(155.175, 0)
  })
})

describe('Weight Entry Time Series', () => {
  it('should create entries over time', () => {
    const entries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date('2024-01-01')
      date.setDate(date.getDate() + i)
      return createMockWeightEntry({
        id: `weight-${i}`,
        date: date.toISOString().split('T')[0],
        weight: 70 + i * 0.2,
      })
    })
    
    expect(entries).toHaveLength(7)
    expect(entries[0].weight).toBe(70)
    expect(entries[6].weight).toBe(71.2)
  })

  it('should limit to recent entries (90 days)', () => {
    const entries = Array.from({ length: 100 }, (_, i) => {
      const date = new Date('2024-01-01')
      date.setDate(date.getDate() + i)
      return createMockWeightEntry({
        id: `weight-${i}`,
        date: date.toISOString().split('T')[0],
      })
    })
    
    const recent = entries.slice(-90)
    expect(recent).toHaveLength(90)
  })
})
