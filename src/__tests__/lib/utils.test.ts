import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn - className utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toBe('px-2 py-1')
  })

  it('should handle conditional classes', () => {
    const result = cn('px-2', false && 'py-1', 'text-sm')
    expect(result).toBe('px-2 text-sm')
  })

  it('should merge tailwind classes with proper precedence', () => {
    const result = cn('px-2 py-1', 'p-4')
    // tailwind-merge should resolve p-4 as the final value
    expect(result).toContain('p-4')
  })

  it('should handle empty inputs', () => {
    const result = cn('', null, undefined, 'text-sm')
    expect(result).toBe('text-sm')
  })

  it('should handle array inputs', () => {
    const result = cn(['px-2', 'py-1'], 'text-sm')
    expect(result).toContain('px-2')
    expect(result).toContain('text-sm')
  })
})
