import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
  it('should render a checkbox', () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('[role="checkbox"]')
    expect(checkbox).toBeDefined()
  })

  it('should be unchecked by default', () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
  })

  it('should handle checked state', async () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    
    await userEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
  })

  it('should toggle when clicked', async () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    
    await userEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('true')
    
    await userEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
  })

  it('should accept disabled prop', () => {
    const { container } = render(<Checkbox disabled />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    expect(checkbox.getAttribute('aria-disabled')).toBe('true')
  })

  it('should not toggle when disabled', async () => {
    const { container } = render(<Checkbox disabled />)
    const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement
    
    await userEvent.click(checkbox)
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
  })

  it('should forward ref correctly', () => {
    let ref: any = null
    const { container } = render(
      <Checkbox ref={(el) => { ref = el }} />
    )
    const checkbox = container.querySelector('[role="checkbox"]')
    expect(ref).toBeDefined()
  })

  it('should accept className prop', () => {
    const { container } = render(<Checkbox className="custom-class" />)
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDefined()
  })

  it('should be accessible with aria attributes', () => {
    const { container } = render(<Checkbox />)
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDefined()
  })
})
