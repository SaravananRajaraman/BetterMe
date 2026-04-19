import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '@/components/todos/category-badge';
import type { Category } from '@/lib/types';

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: '1',
  user_id: 'user-1',
  name: 'Work',
  color: 'blue',
  icon: 'briefcase',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('CategoryBadge', () => {
  it('should return null when category is null', () => {
    const { container } = render(<CategoryBadge category={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render badge with category name', () => {
    const category = createMockCategory({ name: 'Work' });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should render badge with different category names', () => {
    const category = createMockCategory({ name: 'Personal' });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('should apply secondary variant', () => {
    const category = createMockCategory();
    const { container } = render(<CategoryBadge category={category} />);
    const badge = container.querySelector('[class*="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it('should apply text-xs class for size', () => {
    const category = createMockCategory();
    const { container } = render(<CategoryBadge category={category} />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('text-xs');
  });

  it('should apply font-medium class', () => {
    const category = createMockCategory();
    const { container } = render(<CategoryBadge category={category} />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('font-medium');
  });

  it('should accept custom className prop', () => {
    const category = createMockCategory();
    const { container } = render(
      <CategoryBadge category={category} className="custom-class" />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-class');
  });

  it('should handle category with different colors', () => {
    const colors: Array<'blue' | 'green' | 'red' | 'yellow' | 'purple'> = ['blue', 'green', 'red', 'yellow', 'purple'];
    
    colors.forEach((color) => {
      const category = createMockCategory({ color, name: `${color} category` });
      const { container } = render(
        <CategoryBadge category={category} key={color} />
      );
      expect(screen.getByText(`${color} category`)).toBeInTheDocument();
    });
  });

  it('should render multiple badges independently', () => {
    const cat1 = createMockCategory({ id: '1', name: 'Work' });
    const cat2 = createMockCategory({ id: '2', name: 'Health' });

    const { container } = render(
      <>
        <CategoryBadge category={cat1} />
        <CategoryBadge category={cat2} />
      </>
    );

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('should handle category name with special characters', () => {
    const category = createMockCategory({ name: 'Work & Projects' });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Work & Projects')).toBeInTheDocument();
  });

  it('should handle category name with numbers', () => {
    const category = createMockCategory({ name: 'Project 2024' });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Project 2024')).toBeInTheDocument();
  });

  it('should handle very long category names', () => {
    const longName = 'This is a very long category name that might wrap';
    const category = createMockCategory({ name: longName });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  it('should preserve category object structure', () => {
    const category = createMockCategory({
      id: 'custom-id',
      name: 'Custom Name',
      color: 'purple',
    });
    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Custom Name')).toBeInTheDocument();
  });

  it('should handle className with multiple classes', () => {
    const category = createMockCategory();
    const { container } = render(
      <CategoryBadge
        category={category}
        className="mt-2 mb-2 px-4"
      />
    );
    const badge = container.firstChild;
    expect(badge).toHaveClass('mt-2', 'mb-2', 'px-4');
  });
});
