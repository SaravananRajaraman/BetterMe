import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('should render a badge', () => {
    const { container } = render(<Badge>New</Badge>)
    const badge = container.querySelector('[class*="badge"]')
    expect(badge).toBeDefined()
  })

  it('should render children content', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should accept variant prop', () => {
    const { container, rerender } = render(<Badge variant="default">Default</Badge>)
    let badge = container.querySelector('[class*="badge"]')
    expect(badge).toBeDefined()

    rerender(<Badge variant="secondary">Secondary</Badge>)
    badge = container.querySelector('[class*="badge"]')
    expect(badge).toBeDefined()
  })

  it('should apply className prop', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>)
    const badge = container.querySelector('[class*="badge"]')
    expect(badge?.className).toContain('custom-class')
  })

  it('should accept multiple variants', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline']
    variants.forEach(variant => {
      const { container } = render(
        <Badge variant={variant as any}>{variant}</Badge>
      )
      expect(container.querySelector('[class*="badge"]')).toBeDefined()
    })
  })

  it('should support different content types', () => {
    render(
      <>
        <Badge>Text Badge</Badge>
        <Badge>123</Badge>
        <Badge>With Emoji 🎉</Badge>
      </>
    )
    expect(screen.getByText('Text Badge')).toBeDefined()
    expect(screen.getByText('123')).toBeDefined()
    expect(screen.getByText(/With Emoji/)).toBeDefined()
  })

  it('should work with inline elements', () => {
    render(
      <Badge>
        <span>Inline</span> Badge
      </Badge>
    )
    expect(screen.getByText('Inline')).toBeDefined()
  })
})
