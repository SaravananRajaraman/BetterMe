import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('should render an input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDefined()
  })

  it('should accept placeholder prop', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement
    expect(input).toBeDefined()
  })

  it('should accept type prop', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.type).toBe('email')
  })

  it('should accept disabled prop', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('should handle value changes', async () => {
    const { container } = render(<Input type="text" />)
    const input = container.querySelector('input') as HTMLInputElement
    
    await userEvent.type(input, 'test value')
    expect(input.value).toBe('test value')
  })

  it('should forward ref correctly', () => {
    let ref: HTMLInputElement | null = null
    const { container } = render(
      <Input ref={(el) => { ref = el }} />
    )
    const input = container.querySelector('input')
    expect(ref).toBe(input)
  })

  it('should apply className prop', () => {
    const { container } = render(<Input className="custom-class" />)
    const input = container.querySelector('input')
    expect(input?.className).toContain('custom-class')
  })

  it('should handle focus events', async () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    
    await userEvent.click(input)
    expect(document.activeElement).toBe(input)
  })

  it('should work with different input types', () => {
    const { rerender, container } = render(<Input type="password" />)
    let input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('password')

    rerender(<Input type="number" />)
    input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('number')

    rerender(<Input type="email" />)
    input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('email')
  })

  it('should accept aria attributes', () => {
    const { container } = render(<Input aria-label="Test input" />)
    const input = container.querySelector('input')
    expect(input?.getAttribute('aria-label')).toBe('Test input')
  })

  it('should handle enter key press', async () => {
    const { container } = render(<Input type="text" />)
    const input = container.querySelector('input') as HTMLInputElement
    
    await userEvent.type(input, 'test{Enter}')
    expect(input.value).toBe('test')
  })
})
