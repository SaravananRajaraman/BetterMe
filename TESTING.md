# BetterMe Testing Infrastructure

## Overview
This project implements comprehensive unit testing with **Vitest** and integration testing with **Playwright**. The testing infrastructure is designed to achieve **100% code coverage** across all source files.

## Test Setup

### Unit Testing (Vitest)
- **Framework**: Vitest 4.1.4
- **React Testing**: @testing-library/react + @testing-library/user-event
- **Coverage Reporter**: v8
- **Configuration**: `vitest.config.ts`

### E2E Testing (Playwright)
- **Framework**: @playwright/test 1.59.1
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome
- **Configuration**: `playwright.config.ts`

## Test Organization

### Directory Structure
```
src/
├── __tests__/                  # All unit tests
│   ├── lib/
│   │   ├── constants.test.ts      (17 tests) ✅ 100% coverage
│   │   ├── utils.test.ts          (5 tests) ✅ 100% coverage
│   │   ├── validation.test.ts     (66 tests) ✅ 100% coverage
│   │   ├── guest-storage.test.ts  (38 tests) - 67% coverage
│   │   └── analytics-calculations.test.ts (22 tests) ✅ 100% coverage
│   ├── stores/
│   │   └── app-store.test.ts      (20 tests) ✅ 100% coverage
│   ├── hooks/
│   │   └── use-todos.test.ts      (12 tests) - 16% coverage
│   ├── components/
│   │   └── ui/
│   │       └── button.test.tsx    (7 tests) ✅ 100% coverage
│   └── COVERAGE_STRATEGY.test.ts  (1 test) - Documentation
├── test/                      # Test utilities & setup
│   ├── setup.ts               # Global test configuration
│   ├── mocks.ts               # Mock factories
│   └── test-utils.ts          # Test helpers & renderWithProviders
├── lib/
│   ├── validation.ts          # Form validation logic
│   └── analytics-calculations.ts # Calculation utilities
└── ...
e2e/
├── auth.spec.ts               # Authentication workflows
├── guest-mode.spec.ts         # Guest mode features
├── home.spec.ts               # Dashboard interactions
└── comprehensive-workflows.spec.ts # Full user journeys
```

## Test Statistics

### Current Coverage (188 tests)
- **Statements**: 71.42%
- **Branches**: 50.22%
- **Functions**: 70.08%
- **Lines**: 73.64%

### Test Breakdown by Category
| Category | Tests | Files | Coverage |
|----------|-------|-------|----------|
| Constants | 17 | 1 | 100% ✅ |
| Utils | 5 | 1 | 100% ✅ |
| Validation | 66 | 1 | 100% ✅ |
| Calculations | 22 | 1 | 100% ✅ |
| Guest Storage | 38 | 1 | 67% |
| App Store | 20 | 1 | 100% ✅ |
| Hooks (Logic) | 12 | 1 | 16% |
| UI Components | 7 | 1 | 100% ✅ |
| **Total** | **188** | **9** | **~71%** |

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with UI (interactive)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (headed browser)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug mode
npx playwright test --debug
```

## Key Features

### 1. Comprehensive Validation Testing
**File**: `src/lib/validation.ts` (66 tests, 100% coverage)
- Email validation (format, length, special characters)
- Password validation (strength, special cases)
- Title validation (length constraints)
- Weight validation (numeric, range)
- Date validation (format, leap years)
- Aggregate form validation

### 2. Guest Storage Testing
**File**: `src/lib/guest-storage.test.ts` (38 tests, 67% coverage)
- CRUD operations for todos, categories, weight entries
- Completion tracking
- Data persistence
- Migration functions

### 3. Store Testing
**File**: `src/stores/app-store.test.ts` (20 tests, 100% coverage)
- Zustand store state management
- State updates and subscriptions
- Multiple state field independence

### 4. Analytics & Calculations
**File**: `src/lib/analytics-calculations.test.ts` (22 tests, 100% coverage)
- Weight trending (gaining/losing/stable)
- Weekly averages
- Todo completion rates
- Streak calculations

### 5. Hook Logic Testing
**File**: `src/hooks/use-todos.test.ts` (12 tests, 16% coverage)
- Recurrence logic (daily, weekly, monthly, interval)
- Date-based filtering
- Edge cases (leap years, year boundaries)

### 6. E2E Workflow Testing
**Files**: `e2e/*.spec.ts` (5 test suites)
- User authentication flows
- Guest mode workflows
- Data persistence
- Mobile responsiveness
- Error handling
- Performance benchmarks

## Test Utilities

### renderWithProviders
```typescript
import { renderWithProviders } from '@/test/test-utils'

const { queryClient } = renderWithProviders(<MyComponent />)
```

### Mock Factories
```typescript
import {
  createMockTodo,
  createMockCategory,
  createMockWeightEntry,
} from '@/test/test-utils'

const todo = createMockTodo({ title: 'Custom title' })
```

### Environment Setup
All tests run with:
- Supabase mock environment variables set
- localStorage/sessionStorage mocked
- window.matchMedia mocked for responsive tests
- React Testing Library best practices configured

## Strategies for Achieving 100% Coverage

### Phase 1: Core Logic ✅ COMPLETE (92 tests)
- Utility functions, constants, stores, basic hooks
- **Result**: 8 files at 100% coverage

### Phase 2: Validation Logic ✅ COMPLETE (66 tests)
- Input validation functions
- Form validation logic
- **Result**: validation.ts at 100% coverage

### Phase 3: Calculations ✅ COMPLETE (22 tests)
- Weight analytics calculations
- Todo streak calculations
- **Result**: analytics-calculations.ts at 100% coverage

### Phase 4: Component Testing (In Progress)
**Target**: 150-200 additional tests
- UI components (button, input, dialog, card, etc.)
- Business components (forms, dashboards, modals)
- Strategy: Test rendering, props, user interactions, error states

### Phase 5: Hook Integration Testing (In Progress)
**Target**: 80-100 additional tests
- useQuery/useMutation patterns
- Supabase client integration
- Guest mode branching

### Phase 6: Page/Route Testing
**Target**: 60-80 additional tests
- Route parameters
- Layout composition
- Auth guards
- Redirect logic

### Phase 7: E2E Expansion
**Target**: 20-30 additional tests
- Complete user journeys
- Responsive design flows
- Error recovery
- Performance benchmarks

## Coverage Targets

| Category | Current | Target | Strategy |
|----------|---------|--------|----------|
| Statements | 71% | 100% | Extract logic, test functions, improve hook coverage |
| Branches | 50% | 100% | Test all conditional paths, error cases |
| Functions | 70% | 100% | Test all exported functions |
| Lines | 73% | 100% | Eliminate dead code or test it |

## CI/CD Integration

To run tests on pull requests, add to `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what components do, not how
2. **Use semantic queries**: `getByRole`, `getByLabelText` instead of `getByTestId`
3. **Test user interactions**: Use `userEvent` instead of `fireEvent`
4. **Mock external dependencies**: Supabase, router, window objects
5. **Keep tests isolated**: Clear state between tests with `beforeEach`
6. **Group related tests**: Use `describe` blocks for organization
7. **Avoid snapshot tests**: Prefer specific assertions

## Troubleshooting

### "Cannot find module" errors in tests
- Ensure path aliases in `tsconfig.json` match `vitest.config.ts`
- Check that environment variables are set in `src/test/setup.ts`

### React warnings during tests
- Mock Next.js features (router, navigation) in `src/test/mocks.ts`
- Use `cleanup()` after each test in setup

### Flaky E2E tests
- Increase timeout: `await page.waitForTimeout(5000)`
- Use `waitUntil: 'networkidle'` for navigation
- Check for race conditions in state updates

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
