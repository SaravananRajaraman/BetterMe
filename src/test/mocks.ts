import { vi } from 'vitest'

/**
 * Mock for Next.js Router (next/router)
 * Used for pages-based routing
 */
export const mockNextRouter = {
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  reload: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}

/**
 * Mock for Next.js Navigation (next/navigation)
 * Used for app-based routing with hooks
 */
export const mockUseRouter = vi.fn(() => ({
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  refresh: vi.fn().mockResolvedValue(true),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  pathname: '/',
}))

export const mockUsePathname = vi.fn(() => '/')

export const mockUseSearchParams = vi.fn(() => new URLSearchParams())

/**
 * Mock for Supabase Client
 */
export const mockSupabaseClient = {
  auth: {
    onAuthStateChange: vi.fn((callback) => ({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

/**
 * Mock for Supabase Server Client
 */
export const mockSupabaseServerClient = mockSupabaseClient

/**
 * Mock for React Query (TanStack Query)
 */
export const mockUseQuery = vi.fn((options) => ({
  data: undefined,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  isFetching: false,
  status: 'idle',
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  isPending: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: true,
  refetch: vi.fn(),
}))

export const mockUseMutation = vi.fn((options) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  data: undefined,
  error: null,
  isPending: false,
  isError: false,
  isSuccess: false,
  isIdle: true,
  status: 'idle',
  failureCount: 0,
  failureReason: null,
  reset: vi.fn(),
}))

/**
 * Mock for Zustand Store
 */
export const createMockStore = <T extends Record<string, any>>(
  initialState: T
) => ({
  getState: vi.fn(() => initialState),
  setState: vi.fn((partial) => {
    Object.assign(initialState, typeof partial === 'function' ? partial(initialState) : partial)
  }),
  subscribe: vi.fn(),
  destroy: vi.fn(),
  ...initialState,
})

/**
 * Helper to mock Next.js router in tests
 */
export const createMockNextRouter = (overrides = {}) => ({
  ...mockNextRouter,
  ...overrides,
})

/**
 * Helper to mock Supabase client in tests
 */
export const createMockSupabaseClient = (overrides = {}) => ({
  ...mockSupabaseClient,
  ...overrides,
})
