import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateTitle,
  validateWeight,
  validateDate,
  validateAuthFormData,
} from '@/lib/validation'

describe('Email Validation', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com').valid).toBe(true)
    expect(validateEmail('test.email@domain.co.uk').valid).toBe(true)
    expect(validateEmail('user+tag@example.com').valid).toBe(true)
  })

  it('should reject empty email', () => {
    const result = validateEmail('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email is required')
  })

  it('should reject email without @', () => {
    const result = validateEmail('userexample.com')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  it('should reject email without domain', () => {
    const result = validateEmail('user@')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  it('should reject very short emails', () => {
    const result = validateEmail('a@b')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email is too short')
  })

  it('should reject very long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    const result = validateEmail(longEmail)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email is too long')
  })
})

describe('Password Validation', () => {
  it('should accept valid passwords', () => {
    expect(validatePassword('SecurePass123').valid).toBe(true)
    expect(validatePassword('MyPassword2024').valid).toBe(true)
  })

  it('should reject empty password', () => {
    const result = validatePassword('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password is required')
  })

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('Short1A')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  it('should reject password without uppercase', () => {
    const result = validatePassword('password123')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('uppercase')
  })

  it('should reject password without lowercase', () => {
    const result = validatePassword('PASSWORD123')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('lowercase')
  })

  it('should reject password without numbers', () => {
    const result = validatePassword('PasswordABC')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('numbers')
  })

  it('should reject very long passwords', () => {
    const longPassword = 'A' + 'a'.repeat(130) + '1'
    const result = validatePassword(longPassword)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Password is too long')
  })
})

describe('Title Validation', () => {
  it('should accept valid titles', () => {
    expect(validateTitle('My Todo').valid).toBe(true)
    expect(validateTitle('Buy groceries').valid).toBe(true)
  })

  it('should reject empty title', () => {
    const result = validateTitle('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Title is required')
  })

  it('should reject whitespace-only title', () => {
    const result = validateTitle('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Title cannot be empty')
  })

  it('should reject title exceeding max length', () => {
    const longTitle = 'a'.repeat(101)
    const result = validateTitle(longTitle)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('100 characters')
  })

  it('should allow custom max length', () => {
    const title = 'a'.repeat(51)
    const result = validateTitle(title, 50)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('50 characters')
  })
})

describe('Weight Validation', () => {
  it('should accept valid weights', () => {
    expect(validateWeight(70).valid).toBe(true)
    expect(validateWeight(65.5).valid).toBe(true)
    expect(validateWeight(0.1).valid).toBe(true)
  })

  it('should reject undefined weight', () => {
    const result = validateWeight(undefined as any)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Weight is required')
  })

  it('should reject null weight', () => {
    const result = validateWeight(null as any)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Weight is required')
  })

  it('should reject non-numeric weight', () => {
    const result = validateWeight('70' as any)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Weight must be a number')
  })

  it('should reject zero or negative weight', () => {
    expect(validateWeight(0).valid).toBe(false)
    expect(validateWeight(-10).valid).toBe(false)
    expect(validateWeight(-10).error).toBe('Weight must be greater than 0')
  })

  it('should reject weight > 500', () => {
    const result = validateWeight(501)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Weight must be less than 500kg/lbs')
  })
})

describe('Date Validation', () => {
  it('should accept valid dates', () => {
    expect(validateDate('2024-01-01').valid).toBe(true)
    expect(validateDate('2024-12-31').valid).toBe(true)
    expect(validateDate('2025-06-15').valid).toBe(true)
  })

  it('should reject empty date', () => {
    const result = validateDate('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Date is required')
  })

  it('should reject invalid date format', () => {
    expect(validateDate('2024/01/01').valid).toBe(false)
    expect(validateDate('01-01-2024').valid).toBe(false)
    expect(validateDate('2024-1-1').valid).toBe(false)
  })

  it('should reject invalid dates', () => {
    const result = validateDate('2024-13-01')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid date')
  })

  it('should accept leap year dates', () => {
    expect(validateDate('2024-02-29').valid).toBe(true)
    expect(validateDate('2023-02-29').valid).toBe(false)
  })
})

describe('Auth Form Data Validation', () => {
  it('should validate correct form data', () => {
    const result = validateAuthFormData('user@example.com', 'Password123')
    expect(result.valid).toBe(true)
    expect(result.errors.email).toBeUndefined()
    expect(result.errors.password).toBeUndefined()
  })

  it('should validate email error', () => {
    const result = validateAuthFormData('invalid-email', 'Password123')
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBeDefined()
  })

  it('should validate password error', () => {
    const result = validateAuthFormData('user@example.com', 'weak')
    expect(result.valid).toBe(false)
    expect(result.errors.password).toBeDefined()
  })

  it('should validate both errors', () => {
    const result = validateAuthFormData('bad-email', 'weak')
    expect(result.valid).toBe(false)
    expect(result.errors.email).toBeDefined()
    expect(result.errors.password).toBeDefined()
  })
})
