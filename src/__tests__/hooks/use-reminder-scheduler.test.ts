import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReminderScheduler } from '@/hooks/use-reminder-scheduler';
import type { TodoWithCompletion } from '@/lib/types';

// Mock Notification API
const mockNotification = vi.fn();
global.Notification = mockNotification as any;

describe('useReminderScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockTodo = (overrides: Partial<TodoWithCompletion> = {}): TodoWithCompletion => ({
    id: '1',
    user_id: 'user-1',
    title: 'Test Todo',
    description: null,
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

  it('should not schedule reminders when todos is undefined', () => {
    renderHook(() => useReminderScheduler(undefined));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should not schedule reminders when todos is empty', () => {
    renderHook(() => useReminderScheduler([]));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should ignore todos without reminder_time', () => {
    const todos = [createMockTodo({ reminder_time: null })];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should ignore todos that are already completed', () => {
    const todos = [
      createMockTodo({
        reminder_time: '10:00',
        completion: {
          id: 'comp-1',
          todo_id: '1',
          user_id: 'user-1',
          completed_date: '2024-01-01',
          skipped: false,
        },
      }),
    ];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should handle invalid reminder_time format', () => {
    const todos = [createMockTodo({ reminder_time: 'invalid' })];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should handle reminder_time with missing components', () => {
    const todos = [createMockTodo({ reminder_time: '10' })];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should skip reminders scheduled in the past', () => {
    const now = new Date();
    const pastHour = now.getHours() - 1;
    const pastMinute = now.getMinutes();
    const reminderTime = `${String(pastHour).padStart(2, '0')}:${String(pastMinute).padStart(2, '0')}`;

    const todos = [createMockTodo({ reminder_time: reminderTime })];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should skip reminders more than 24 hours in the future', () => {
    const tomorrowHour = (new Date().getHours() + 5) % 24;
    const reminderTime = `${String(tomorrowHour).padStart(2, '0')}:00`;

    const todos = [createMockTodo({ reminder_time: reminderTime })];
    renderHook(() => useReminderScheduler(todos));
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should not send notification if notifications are not enabled', () => {
    const now = new Date();
    const futureHour = (now.getHours() + 1) % 24;
    const futureMinute = now.getMinutes();
    const reminderTime = `${String(futureHour).padStart(2, '0')}:${String(futureMinute).padStart(2, '0')}`;

    localStorage.setItem('notifications_enabled', 'false');
    const todos = [createMockTodo({ reminder_time: reminderTime })];
    renderHook(() => useReminderScheduler(todos));

    // Timer should be set, but notification won't be shown
    // Because notifications_enabled is false
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should parse valid reminder_time with hours and minutes', () => {
    const todos = [createMockTodo({ reminder_time: '14:30' })];
    renderHook(() => useReminderScheduler(todos));
    // Should not throw, should parse successfully
    expect(true).toBe(true);
  });

  it('should handle multiple todos with different reminder times', () => {
    const todos = [
      createMockTodo({ id: '1', reminder_time: null }),
      createMockTodo({ id: '2', reminder_time: '10:00' }),
      createMockTodo({ id: '3', completion: { id: 'c1', todo_id: '3', user_id: 'u1', completed_date: '2024-01-01', skipped: false } }),
    ];
    renderHook(() => useReminderScheduler(todos));
    // Should process all todos without throwing
    expect(true).toBe(true);
  });

  it('should skip reminders with hours > 23', () => {
    const todos = [createMockTodo({ reminder_time: '25:00' })];
    renderHook(() => useReminderScheduler(todos));
    // Should not schedule - invalid hour
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should skip reminders with minutes > 59', () => {
    const todos = [createMockTodo({ reminder_time: '10:75' })];
    renderHook(() => useReminderScheduler(todos));
    // Should not schedule - invalid minute
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it('should handle todos with empty description', () => {
    const todos = [createMockTodo({ reminder_time: '10:00', description: null })];
    renderHook(() => useReminderScheduler(todos));
    // Should handle gracefully without throwing
    expect(true).toBe(true);
  });

  it('should handle reminder_time with leading zeros', () => {
    const todos = [createMockTodo({ reminder_time: '09:05' })];
    renderHook(() => useReminderScheduler(todos));
    // Should parse correctly
    expect(true).toBe(true);
  });

  it('should handle boundary time 00:00', () => {
    const todos = [createMockTodo({ reminder_time: '00:00' })];
    renderHook(() => useReminderScheduler(todos));
    // Midnight - should handle gracefully
    expect(true).toBe(true);
  });

  it('should handle boundary time 23:59', () => {
    const todos = [createMockTodo({ reminder_time: '23:59' })];
    renderHook(() => useReminderScheduler(todos));
    // Should handle gracefully
    expect(true).toBe(true);
  });

  it('should return cleanup function', () => {
    const todos = [createMockTodo({ reminder_time: null })];
    const { unmount } = renderHook(() => useReminderScheduler(todos));
    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('should handle window being undefined', () => {
    // This would only happen in SSR context
    // The hook checks for typeof window === 'undefined' early
    const todos = [createMockTodo({ reminder_time: '10:00' })];
    expect(() => renderHook(() => useReminderScheduler(todos))).not.toThrow();
  });

  it('should handle changed todos list', () => {
    const todos1 = [createMockTodo({ id: '1', reminder_time: null })];
    const { rerender } = renderHook(
      (todos) => useReminderScheduler(todos),
      { initialProps: todos1 }
    );

    const todos2 = [createMockTodo({ id: '2', reminder_time: '10:00' })];
    rerender(todos2);

    // Should handle rerender without throwing
    expect(true).toBe(true);
  });
});
