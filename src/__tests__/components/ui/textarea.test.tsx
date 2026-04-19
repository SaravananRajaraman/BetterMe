import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea Component', () => {
  it('should render a textarea element', () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeDefined()
  })

  it('should accept placeholder prop', () => {
    const { container } = render(<Textarea placeholder="Enter description" />)
    const textarea = container.querySelector('textarea')
    expect(textarea?.placeholder).toBe('Enter description')
  })

  it('should handle text input', async () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    
    await userEvent.type(textarea, 'Test input')
    expect(textarea.value).toBe('Test input')
  })

  it('should handle multiline text', async () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    
    await userEvent.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')
    expect(textarea.value).toContain('Line 1')
    expect(textarea.value).toContain('Line 2')
    expect(textarea.value).toContain('Line 3')
  })

  it('should accept disabled prop', () => {
    const { container } = render(<Textarea disabled />)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.disabled).toBe(true)
  })

  it('should accept rows prop', () => {
    const { container } = render(<Textarea rows={10} />)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.rows).toBe(10)
  })

  it('should forward ref correctly', () => {
    let ref: HTMLTextAreaElement | null = null
    const { container } = render(
      <Textarea ref={(el) => { ref = el }} />
    )
    const textarea = container.querySelector('textarea')
    expect(ref).toBe(textarea)
  })

  it('should apply className prop', () => {
    const { container } = render(<Textarea className="custom-class" />)
    const textarea = container.querySelector('textarea')
    expect(textarea?.className).toContain('custom-class')
  })

  it('should handle value clearing', async () => {
    const { container } = render(<Textarea />)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    
    await userEvent.type(textarea, 'Test')
    expect(textarea.value).toBe('Test')
    
    await userEvent.clear(textarea)
    expect(textarea.value).toBe('')
  })

  it('should accept aria attributes', () => {
    const { container } = render(<Textarea aria-label="Notes" aria-describedby="help-text" />)
    const textarea = container.querySelector('textarea')
    expect(textarea?.getAttribute('aria-label')).toBe('Notes')
    expect(textarea?.getAttribute('aria-describedby')).toBe('help-text')
  })
})
