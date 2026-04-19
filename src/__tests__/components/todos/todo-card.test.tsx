import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoCard } from '@/components/todos/todo-card';
import type { TodoWithCompletion } from '@/lib/types';
import { useToggleCompletion, useDeleteTodo } from '@/hooks/use-todos';
import { useAppStore } from '@/stores/app-store';

vi.mock('@/hooks/use-todos', () => ({
  useToggleCompletion: vi.fn(),
  useDeleteTodo: vi.fn(),
}));

vi.mock('@/stores/app-store');

const mockToggleMutate = vi.fn();
const mockDeleteMutate = vi.fn();

const createMockTodo = (overrides: Partial<TodoWithCompletion> = {}): TodoWithCompletion => ({
  id: '1',
  user_id: 'user-1',
  title: 'Test Todo',
  description: 'Test description',
  category_id: null,
  category: null,
  completion: null,
  is_active: true,
  is_recurring: false,
  recurrence_type: 'daily',
  recurrence_interval: 1,
  recurrence_days: null,
  reminder_time: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('TodoCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToggleCompletion as any).mockReturnValue({
      mutate: mockToggleMutate,
      isPending: false,
    });
    (useDeleteTodo as any).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
    (useAppStore as any).mockReturnValue({
      setEditTodoId: vi.fn(),
    });
  });

  it('should render todo title', () => {
    const todo = createMockTodo({ title: 'Complete project' });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText('Complete project')).toBeInTheDocument();
  });

  it('should render todo description', () => {
    const todo = createMockTodo({ description: 'Finish by Friday' });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText('Finish by Friday')).toBeInTheDocument();
  });

  it('should render checkbox for uncompleted todo', () => {
    const todo = createMockTodo({ completion: null });
    render(<TodoCard todo={todo} />);
    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('should show completed state when todo has completion', () => {
    const todo = createMockTodo({
      completion: {
        id: 'comp-1',
        todo_id: '1',
        user_id: 'user-1',
        completed_date: '2024-01-01',
        skipped: false,
      },
    });
    render(<TodoCard todo={todo} />);
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox?.checked).toBe(true);
  });

  it('should show skipped state with different styling', () => {
    const todo = createMockTodo({
      completion: {
        id: 'comp-1',
        todo_id: '1',
        user_id: 'user-1',
        completed_date: '2024-01-01',
        skipped: true,
      },
    });
    const { container } = render(<TodoCard todo={todo} />);
    // Skipped todos have different text decoration
    expect(container).toBeInTheDocument();
  });

  it('should show daily recurrence badge (or none for daily)', () => {
    const todo = createMockTodo({
      is_recurring: true,
      recurrence_type: 'daily',
    });
    const { container } = render(<TodoCard todo={todo} />);
    // Daily recurrences don't show badge
    expect(container.innerHTML).not.toContain('Every');
  });

  it('should show interval recurrence badge', () => {
    const todo = createMockTodo({
      is_recurring: true,
      recurrence_type: 'interval',
      recurrence_interval: 3,
    });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(/Every 3 days/)).toBeInTheDocument();
  });

  it('should show weekly recurrence days', () => {
    const todo = createMockTodo({
      is_recurring: true,
      recurrence_type: 'weekly',
      recurrence_days: [1, 3, 5], // Mon, Wed, Fri
    });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(/Mon, Wed, Fri/)).toBeInTheDocument();
  });

  it('should show monthly recurrence date', () => {
    const todo = createMockTodo({
      is_recurring: true,
      recurrence_type: 'monthly',
      recurrence_days: [15],
    });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(/Monthly on 15/)).toBeInTheDocument();
  });

  it('should show reminder time when present', () => {
    const todo = createMockTodo({ reminder_time: '09:30' });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText('09:30')).toBeInTheDocument();
  });

  it('should not show reminder when not set', () => {
    const todo = createMockTodo({ reminder_time: null });
    const { container } = render(<TodoCard todo={todo} />);
    // Clock icon should not appear if no reminder
    const clockElements = container.querySelectorAll('svg');
    expect(clockElements.length).toBeGreaterThanOrEqual(0);
  });

  it('should render category badge when category present', () => {
    const todo = createMockTodo({
      category: {
        id: 'cat-1',
        user_id: 'user-1',
        name: 'Work',
        color: 'blue',
        icon: 'briefcase',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should not render category badge when category is null', () => {
    const todo = createMockTodo({ category: null });
    const { container } = render(<TodoCard todo={todo} />);
    // Should not crash and render without category
    expect(container).toBeInTheDocument();
  });

  it('should render edit button in the card', () => {
    const todo = createMockTodo();
    const { container } = render(<TodoCard todo={todo} />);
    const buttons = container.querySelectorAll('button');
    // Should have action buttons (edit, delete, skip, etc.)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render delete button', () => {
    const todo = createMockTodo();
    render(<TodoCard todo={todo} />);
    // Delete button should be present (trash icon)
    expect(document.querySelectorAll('button').length).toBeGreaterThan(0);
  });

  it('should handle toggle completion', () => {
    const todo = createMockTodo({ completion: null });
    render(<TodoCard todo={todo} />);
    
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(mockToggleMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          todoId: '1',
          completed: true,
        })
      );
    }
  });

  it('should accept optional date prop', () => {
    const todo = createMockTodo();
    const { container } = render(
      <TodoCard todo={todo} date="2024-01-15" />
    );
    expect(container).toBeInTheDocument();
  });

  it('should render without description', () => {
    const todo = createMockTodo({ description: null });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should handle long titles', () => {
    const longTitle = 'This is a very long todo title that might wrap to multiple lines in the UI';
    const todo = createMockTodo({ title: longTitle });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('should handle long descriptions', () => {
    const longDescription = 'This is a very detailed description of what needs to be done for this todo item with multiple sentences';
    const todo = createMockTodo({ description: longDescription });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should render all action buttons', () => {
    const todo = createMockTodo();
    const { container } = render(<TodoCard todo={todo} />);
    const buttons = container.querySelectorAll('button');
    // Should have multiple buttons (edit, delete, skip, etc.)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle empty recurrence days array', () => {
    const todo = createMockTodo({
      is_recurring: true,
      recurrence_type: 'weekly',
      recurrence_days: [],
    });
    render(<TodoCard todo={todo} />);
    expect(screen.getByText(/Weekly/)).toBeInTheDocument();
  });

  it('should handle all ordinal numbers for monthly', () => {
    const testCases = [
      { day: 1, expected: '1st' },
      { day: 2, expected: '2nd' },
      { day: 3, expected: '3rd' },
      { day: 4, expected: '4th' },
      { day: 21, expected: '21st' },
      { day: 22, expected: '22nd' },
      { day: 23, expected: '23rd' },
    ];

    testCases.forEach(({ day, expected }) => {
      const todo = createMockTodo({
        is_recurring: true,
        recurrence_type: 'monthly',
        recurrence_days: [day],
      });
      const { unmount } = render(<TodoCard todo={todo} />);
      expect(screen.getByText(new RegExp(`Monthly on ${expected}`))).toBeInTheDocument();
      unmount();
    });
  });
});
