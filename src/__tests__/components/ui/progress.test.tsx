import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from '@/components/ui/progress'

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

describe('ProgressLabel', () => {
  it('should render label with text', () => {
    const { getByText } = render(
      <Progress value={50}>
        <ProgressLabel>Loading</ProgressLabel>
      </Progress>
    )
    expect(getByText('Loading')).toBeDefined()
  })

  it('should apply className to label', () => {
    const { container } = render(
      <Progress value={50}>
        <ProgressLabel className="custom-label">Progress</ProgressLabel>
      </Progress>
    )
    const label = container.querySelector('[data-slot="progress-label"]')
    expect(label?.className).toContain('custom-label')
  })

  it('should have semantic label styling', () => {
    const { container } = render(
      <Progress value={50}>
        <ProgressLabel>Status</ProgressLabel>
      </Progress>
    )
    const label = container.querySelector('[data-slot="progress-label"]')
    expect(label?.className).toContain('text-sm')
    expect(label?.className).toContain('font-medium')
  })
})

describe('ProgressValue', () => {
  it('should render value display', () => {
    const { getByText } = render(
      <Progress value={50}>
        <ProgressValue>50%</ProgressValue>
      </Progress>
    )
    expect(getByText('50%')).toBeDefined()
  })

  it('should apply className to value', () => {
    const { container } = render(
      <Progress value={75}>
        <ProgressValue className="custom-value">75%</ProgressValue>
      </Progress>
    )
    const value = container.querySelector('[data-slot="progress-value"]')
    expect(value?.className).toContain('custom-value')
  })

  it('should have semantic value styling', () => {
    const { container } = render(
      <Progress value={25}>
        <ProgressValue>25%</ProgressValue>
      </Progress>
    )
    const value = container.querySelector('[data-slot="progress-value"]')
    expect(value?.className).toContain('text-sm')
    expect(value?.className).toContain('text-muted-foreground')
  })
})

describe('ProgressTrack and Indicator', () => {
  it('should render track with indicator', () => {
    const { container } = render(<Progress value={60} />)
    const track = container.querySelector('[data-slot="progress-track"]')
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(track).toBeDefined()
    expect(indicator).toBeDefined()
  })

  it('should have proper track styling', () => {
    const { container } = render(<Progress value={50} />)
    const track = container.querySelector('[data-slot="progress-track"]')
    expect(track?.className).toContain('h-1')
    expect(track?.className).toContain('w-full')
    expect(track?.className).toContain('bg-muted')
  })

  it('should have indicator with transition', () => {
    const { container } = render(<Progress value={50} />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(indicator?.className).toContain('bg-primary')
    expect(indicator?.className).toContain('transition-all')
  })

  it('should apply custom className to track', () => {
    const { container } = render(
      <Progress value={50}>
        <ProgressTrack className="custom-track">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    )
    const track = container.querySelector('[data-slot="progress-track"]')
    expect(track?.className).toContain('custom-track')
  })

  it('should apply custom className to indicator', () => {
    const { container } = render(
      <Progress value={50}>
        <ProgressTrack>
          <ProgressIndicator className="custom-indicator" />
        </ProgressTrack>
      </Progress>
    )
    const indicator = container.querySelector('[data-slot="progress-indicator"]')
    expect(indicator?.className).toContain('custom-indicator')
  })
})
