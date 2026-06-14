# BetterMe Testing Guide

Unit/integration tests run on **Vitest** + **React Testing Library**; end-to-end tests run on **Playwright**. Coverage thresholds in `vitest.config.ts` are set to 100% (statements, branches, functions, lines).

## Commands

```bash
# Unit / integration
npm run test            # watch mode
npm run test:ui         # interactive Vitest UI
npm run test:coverage   # one-off run with coverage report (coverage/index.html)
npm run test:watch      # explicit watch mode

# End-to-end
npm run test:e2e        # all Playwright specs
npm run test:e2e:ui     # headed/UI mode
npx playwright test e2e/auth.spec.ts   # single spec
npx playwright test --debug            # debug mode
```

## Layout

```
src/
├── __tests__/                 # unit tests, mirroring src/ structure
│   ├── lib/                   # utilities, validation, calculations, guest storage
│   ├── stores/                # Zustand store
│   ├── hooks/                 # hook logic
│   ├── components/            # component tests
│   └── app/                   # page/route tests
├── test/                      # test infrastructure
│   ├── setup.ts               # global setup (env vars, localStorage, matchMedia mocks)
│   ├── mocks.ts               # mock factories
│   └── test-utils.ts          # renderWithProviders + mock data factories
e2e/                           # Playwright specs (auth, guest-mode, home, comprehensive-workflows)
```

Config: `vitest.config.ts` (jsdom env, `@` → `src` alias, v8 coverage) and `playwright.config.ts` (Chrome, Firefox, Safari, Mobile Chrome).

## Test utilities

```typescript
import { renderWithProviders, createMockTodo, createMockCategory, createMockWeightEntry } from '@/test/test-utils'

const { queryClient } = renderWithProviders(<MyComponent />)
const todo = createMockTodo({ title: 'Custom title' })
```

`renderWithProviders` wraps the component in the app providers (TanStack Query, etc.). The global setup mocks Supabase env vars, `localStorage`/`sessionStorage`, and `window.matchMedia`.

## Patterns

1. **Test behavior, not implementation** — assert on what the user sees/does, not internals.
2. **Semantic queries** — prefer `getByRole` / `getByLabelText` over `getByTestId`.
3. **Real interactions** — use `userEvent`, not `fireEvent`.
4. **Mock external deps** — Supabase, Next router/navigation, `window` objects (see `src/test/mocks.ts`).
5. **Isolate** — reset state in `beforeEach`; cleanup runs after each test via setup.
6. **Group** with `describe`; avoid snapshot tests in favor of specific assertions.
7. **Pure logic first** — validation (`src/lib/validation.ts`) and analytics (`src/lib/analytics-calculations.ts`) are pure functions; test them directly with wide input/edge-case coverage.
8. **Guest vs. authenticated** — data hooks branch on mode; cover both paths.

## Troubleshooting

- **"Cannot find module" in tests** — ensure path aliases in `tsconfig.json` match `vitest.config.ts`; confirm env vars in `src/test/setup.ts`.
- **React warnings during tests** — mock Next.js router/navigation in `src/test/mocks.ts`.
- **Flaky E2E** — wait on `networkidle` for navigation; watch for state-update race conditions; bump timeouts only as a last resort.

## References

- [Vitest](https://vitest.dev/) · [React Testing Library](https://testing-library.com/react) · [Playwright](https://playwright.dev/)
