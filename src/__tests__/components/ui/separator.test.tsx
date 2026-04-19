import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

describe('Separator Component', () => {
  it('should render a separator', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[role="separator"]')
    expect(separator).toBeDefined()
  })

  it('should render with default orientation', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[role="separator"]')
    expect(separator?.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('should support vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.querySelector('[role="separator"]')
    expect(separator?.getAttribute('data-orientation')).toBe('vertical')
  })

  it('should apply className prop', () => {
    const { container } = render(<Separator className="custom-sep" />)
    const separator = container.querySelector('[role="separator"]')
    expect(separator?.className).toContain('custom-sep')
  })

  it('should render as decorative by default', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[role="separator"]')
    expect(separator?.getAttribute('aria-orientation')).toBe('horizontal')
  })
})
