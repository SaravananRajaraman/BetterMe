import { describe, it, expect } from 'vitest'
import { localNowParts, isWithinQuietHours } from '@/lib/push/reminder-window'

describe('localNowParts', () => {
  it('formats date and HH:MM in UTC', () => {
    expect(localNowParts('UTC', new Date('2024-01-31T14:05:00Z'))).toEqual({
      date: '2024-01-31',
      minute: '14:05',
    })
  })

  it('applies a timezone offset', () => {
    // New York is UTC-5 in January
    expect(
      localNowParts('America/New_York', new Date('2024-01-31T14:05:00Z'))
    ).toEqual({ date: '2024-01-31', minute: '09:05' })
  })

  it('uses a 24h clock so midnight is 00:MM', () => {
    expect(localNowParts('UTC', new Date('2024-01-31T00:00:00Z')).minute).toBe('00:00')
  })

  it('rolls the local date back across a timezone boundary', () => {
    // 02:00Z is still the previous evening in New York
    expect(
      localNowParts('America/New_York', new Date('2024-01-31T02:00:00Z'))
    ).toEqual({ date: '2024-01-30', minute: '21:00' })
  })
})

describe('isWithinQuietHours', () => {
  it('returns false when a bound is missing', () => {
    expect(isWithinQuietHours('12:00', null, '07:00')).toBe(false)
    expect(isWithinQuietHours('12:00', '22:00', null)).toBe(false)
  })

  it('returns false when bounds are equal', () => {
    expect(isWithinQuietHours('12:00', '09:00', '09:00')).toBe(false)
  })

  it('handles a same-day window (start inclusive, end exclusive)', () => {
    expect(isWithinQuietHours('12:00', '09:00', '17:00')).toBe(true)
    expect(isWithinQuietHours('09:00', '09:00', '17:00')).toBe(true)
    expect(isWithinQuietHours('17:00', '09:00', '17:00')).toBe(false)
    expect(isWithinQuietHours('08:00', '09:00', '17:00')).toBe(false)
  })

  it('handles a window that wraps past midnight', () => {
    expect(isWithinQuietHours('23:00', '22:00', '07:00')).toBe(true)
    expect(isWithinQuietHours('06:59', '22:00', '07:00')).toBe(true)
    expect(isWithinQuietHours('07:00', '22:00', '07:00')).toBe(false)
    expect(isWithinQuietHours('12:00', '22:00', '07:00')).toBe(false)
  })

  it('ignores seconds on the bounds', () => {
    expect(isWithinQuietHours('23:30', '22:00:00', '07:00:00')).toBe(true)
  })
})
