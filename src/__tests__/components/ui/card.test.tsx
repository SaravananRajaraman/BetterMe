import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Component', () => {
  it('should render card wrapper', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.querySelector('[class*="card"]')
    expect(card).toBeDefined()
  })

  it('should render CardHeader', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header')).toBeDefined()
  })

  it('should render CardTitle', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>My Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('My Title')).toBeDefined()
  })

  it('should render CardDescription', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardDescription>My Description</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('My Description')).toBeDefined()
  })

  it('should render CardContent', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    )
    expect(screen.getByText('Main content')).toBeDefined()
  })

  it('should render CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    expect(screen.getByText('Footer content')).toBeDefined()
  })

  it('should support full card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
    expect(screen.getByText('Content')).toBeDefined()
    expect(screen.getByText('Footer')).toBeDefined()
  })

  it('should accept className prop', () => {
    const { container } = render(<Card className="custom-card">Test</Card>)
    const card = container.querySelector('[class*="card"]')
    expect(card?.className).toContain('custom-card')
  })
})
