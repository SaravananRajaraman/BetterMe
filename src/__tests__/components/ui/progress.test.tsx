import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress Component', () => {
  it('should render a progress bar', () => {
    const { container } = render(<Progress value={50} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress).toBeDefined()
  })

  it('should display percentage value', () => {
    const { container } = render(<Progress value={75} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.getAttribute('aria-valuenow')).toBe('75')
  })

  it('should handle 0 value', () => {
    const { container } = render(<Progress value={0} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.getAttribute('aria-valuenow')).toBe('0')
  })

  it('should handle 100 value', () => {
    const { container } = render(<Progress value={100} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.getAttribute('aria-valuenow')).toBe('100')
  })

  it('should apply className prop', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.className).toContain('custom-progress')
  })

  it('should have min and max values', () => {
    const { container } = render(<Progress value={50} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.getAttribute('aria-valuemin')).toBe('0')
    expect(progress?.getAttribute('aria-valuemax')).toBe('100')
  })

  it('should render partial progress', () => {
    const { container } = render(<Progress value={33} />)
    const progress = container.querySelector('[role="progressbar"]')
    expect(progress?.getAttribute('aria-valuenow')).toBe('33')
  })
})
