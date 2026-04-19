import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'

describe('Card Component', () => {
  it('should render card wrapper', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.querySelector('[data-slot="card"]')
    expect(card).toBeDefined()
  })

  it('should render with default size', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.querySelector('[data-slot="card"]')
    expect(card?.getAttribute('data-size')).toBe('default')
  })

  it('should render with small size', () => {
    const { container } = render(<Card size="sm">Content</Card>)
    const card = container.querySelector('[data-slot="card"]')
    expect(card?.getAttribute('data-size')).toBe('sm')
  })

  it('should accept className prop', () => {
    const { container } = render(<Card className="custom-card">Test</Card>)
    const card = container.querySelector('[data-slot="card"]')
    expect(card?.className).toContain('custom-card')
  })

  it('should render CardHeader', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    expect(container.querySelector('[data-slot="card-header"]')).toBeDefined()
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
    expect(container.querySelector('[data-slot="card-title"]')).toBeDefined()
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
    expect(container.querySelector('[data-slot="card-description"]')).toBeDefined()
    expect(screen.getByText('My Description')).toBeDefined()
  })

  it('should render CardContent', () => {
    const { container } = render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    )
    expect(container.querySelector('[data-slot="card-content"]')).toBeDefined()
    expect(screen.getByText('Main content')).toBeDefined()
  })

  it('should render CardFooter', () => {
    const { container } = render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    expect(container.querySelector('[data-slot="card-footer"]')).toBeDefined()
    expect(screen.getByText('Footer content')).toBeDefined()
  })

  it('should render CardAction', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>Action</CardAction>
        </CardHeader>
      </Card>
    )
    expect(container.querySelector('[data-slot="card-action"]')).toBeDefined()
    expect(screen.getByText('Action')).toBeDefined()
  })

  it('should support full card structure', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(container.querySelector('[data-slot="card"]')).toBeDefined()
    expect(container.querySelector('[data-slot="card-header"]')).toBeDefined()
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
    expect(screen.getByText('Content')).toBeDefined()
    expect(screen.getByText('Footer')).toBeDefined()
  })

  it('should apply className to subcomponents', () => {
    const { container } = render(
      <Card className="card-custom">
        <CardHeader className="header-custom">
          <CardTitle className="title-custom">Title</CardTitle>
          <CardDescription className="desc-custom">Desc</CardDescription>
        </CardHeader>
        <CardContent className="content-custom">Content</CardContent>
        <CardFooter className="footer-custom">Footer</CardFooter>
      </Card>
    )
    expect(container.querySelector('[data-slot="card"]')?.className).toContain('card-custom')
    expect(container.querySelector('[data-slot="card-header"]')?.className).toContain('header-custom')
    expect(container.querySelector('[data-slot="card-title"]')?.className).toContain('title-custom')
    expect(container.querySelector('[data-slot="card-description"]')?.className).toContain('desc-custom')
    expect(container.querySelector('[data-slot="card-content"]')?.className).toContain('content-custom')
    expect(container.querySelector('[data-slot="card-footer"]')?.className).toContain('footer-custom')
  })
})
