import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

/**
 * Create a new QueryClient for tests
 * Each test gets a fresh client to avoid cross-test contamination
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

/**
 * Custom render function that wraps components with necessary providers
 */
export const renderWithProviders = (
  ui: ReactNode,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderOptions & {
    queryClient?: QueryClient
  } = {}
) => {
  const Wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

/**
 * Mock Supabase useQuery response
 */
export const mockSupabaseQuery = (data: any, error: any = null) => ({
  data,
  error,
  isLoading: false,
  isError: !!error,
  isSuccess: !error,
  isFetching: false,
  status: error ? 'error' : 'success',
})

/**
 * Mock Supabase useMutation response
 */
export const mockSupabaseMutation = () => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  isIdle: true,
  status: 'idle' as const,
  data: undefined,
  error: null,
  reset: vi.fn(),
})

/**
 * Create mock data for todos
 */
export const createMockTodo = (overrides = {}) => ({
  id: 'todo-1',
  user_id: 'user-1',
  title: 'Test Todo',
  description: null,
  category_id: null,
  reminder_time: null,
  is_recurring: false,
  recurrence_type: 'daily' as const,
  recurrence_interval: 1,
  recurrence_days: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

/**
 * Create mock data for categories
 */
export const createMockCategory = (overrides = {}) => ({
  id: 'cat-1',
  user_id: 'user-1',
  name: 'Health',
  color: '#22c55e',
  icon: 'heart',
  is_default: true,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

/**
 * Create mock data for weight entries
 */
export const createMockWeightEntry = (overrides = {}) => ({
  id: 'weight-1',
  user_id: 'user-1',
  weight: 70,
  unit: 'kg' as const,
  date: '2024-01-01',
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

/**
 * Create mock data for todo completions
 */
export const createMockTodoCompletion = (overrides = {}) => ({
  id: 'completion-1',
  todo_id: 'todo-1',
  user_id: 'user-1',
  completed_date: '2024-01-01',
  completed_at: '2024-01-01T12:00:00Z',
  skipped: false,
  ...overrides,
})
