import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('should render a label element', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label.tagName).toBe('LABEL')
  })

  it('should accept htmlFor prop', () => {
    render(<Label htmlFor="test-id">Test</Label>)
    const label = screen.getByText('Test') as HTMLLabelElement
    expect(label.htmlFor).toBe('test-id')
  })

  it('should render children content', () => {
    render(<Label>Custom Label Text</Label>)
    expect(screen.getByText('Custom Label Text')).toBeDefined()
  })

  it('should apply className prop', () => {
    const { container } = render(<Label className="custom-class">Test</Label>)
    const label = container.querySelector('label')
    expect(label?.className).toContain('custom-class')
  })

  it('should work with form inputs', () => {
    const { container } = render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    )
    const label = container.querySelector('label') as HTMLLabelElement
    const input = container.querySelector('input')
    expect(label.htmlFor).toBe(input?.id)
  })

  it('should accept custom attributes', () => {
    const { container } = render(<Label data-testid="custom-label">Test</Label>)
    const label = container.querySelector('[data-testid="custom-label"]')
    expect(label).toBeDefined()
  })

  it('should render complex children', () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    )
    expect(screen.getByText('Required')).toBeDefined()
    expect(screen.getByText(/Field/)).toBeDefined()
  })

  it('should support required indicator', () => {
    render(<Label>Email *</Label>)
    expect(screen.getByText(/Email \*/)).toBeDefined()
  })

  it('should forward ref correctly', () => {
    let ref: HTMLLabelElement | null = null
    const { container } = render(
      <Label ref={(el) => { ref = el }}>Test</Label>
    )
    const label = container.querySelector('label')
    expect(ref).toBe(label)
  })

  it('should accept aria attributes', () => {
    const { container } = render(<Label aria-required="true">Required</Label>)
    const label = container.querySelector('label')
    expect(label?.getAttribute('aria-required')).toBe('true')
  })
})
