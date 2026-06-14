<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# BetterMe

A PWA habit/todo tracker with weight logging, recurring tasks, daily reviews, analytics, and push notifications. Works signed-in (Supabase) or as a guest (localStorage).

**Stack:** Next.js 16 (App Router, **Webpack** — not Turbopack), React 19, TypeScript, Supabase (`@supabase/ssr`), TanStack Query, Zustand, shadcn/ui + Base UI + Tailwind v4, Serwist (PWA), web-push.

## Commands

```bash
npm run dev            # generate-build-info.mjs, then next dev --webpack
npm run build          # generate-build-info.mjs, then next build --webpack
npm run lint           # next lint (eslint-config-next, core-web-vitals + ts)
npm run test           # vitest (watch)
npm run test:coverage  # vitest run --coverage  (100% thresholds configured)
npm run test:e2e       # playwright
```

Note: both `dev` and `build` run `scripts/generate-build-info.mjs` first — `--webpack` is intentional (this project does not use Turbopack).

## Architecture

- **Routing** — App Router with route groups: `src/app/(app)/*` are the authenticated screens (dashboard, weight, analytics, settings), `src/app/(auth)/login` is the login flow, and `src/app/auth/callback/route.ts` handles the OAuth/email callback. Root layout wires fonts + `<Providers>`.
- **Providers** (`src/components/providers.tsx`) — TanStack Query (`staleTime` 60s, `retry` 1), `next-themes`, Sonner toaster, and the service-worker registrar. Client component.
- **Data layer** — TanStack Query hooks in `src/hooks/use-*.ts` (`use-todos`, `use-weight`, `use-analytics`, `use-categories`, `use-notifications`, `use-reminder-scheduler`) wrap Supabase. Use `createClient()` from `src/lib/supabase/client.ts` (browser) or `src/lib/supabase/server.ts` (server components). The full DB shape lives in `src/lib/types.ts` (`Database` type + convenience types) covering 7 tables: `profiles`, `categories`, `todos`, `todo_completions`, `daily_reviews`, `push_subscriptions`, `weight_entries`.
- **Guest mode** — `src/lib/guest-storage.ts` is a localStorage-backed mirror of the Supabase data API. **Every data hook branches on guest vs. authenticated** (`isGuestMode` in the store). When adding or changing a data path, handle *both* sides or you'll break one mode.
- **UI state** — Zustand store `src/stores/app-store.ts` holds only ephemeral UI state (dialog open flags, selected category, edit target, guest-mode flag). Server/remote data belongs in TanStack Query, not here.
- **PWA** — Serwist; source service worker is `src/sw.ts`, compiled to `public/sw.js` by `next.config.ts` (`@serwist/next`, disabled in dev). Push notifications use `web-push` (VAPID keys in env).
- **Schema** — `supabase/schema.sql` (+ `supabase/seed-existing-users.sql`). Keep `src/lib/types.ts` in sync with schema changes.

## Conventions

- **Path alias** — `@/*` → `src/*` (mirrored in `tsconfig.json` and `vitest.config.ts`).
- **Validation** — pure functions in `src/lib/validation.ts` (`validateEmail`, `validatePassword`, `validateTitle`, `validateWeight`, `validateDate`, `validateAuthFormData`). Forms use react-hook-form + zod resolvers.
- **Constants** — default categories and color maps in `src/lib/constants.ts`. Don't hardcode category colors elsewhere.
- **Analytics math** — pure helpers in `src/lib/analytics-calculations.ts` (trends, averages, completion rates, streaks). Keep it pure and testable.

## Testing

Vitest + React Testing Library (unit), Playwright (e2e). Test utilities (`renderWithProviders`, mock factories) live in `src/test/`. Coverage thresholds are set to 100% in `vitest.config.ts`. See [TESTING.md](./TESTING.md) for structure, patterns, and troubleshooting.

## Gotchas

- `.env.local` is required (Supabase URL/anon key + VAPID keys). See `.env.local.example`.
- `src/lib/build-info.ts` is auto-generated on every dev/build and is gitignored — don't edit or commit it.
- Next.js 16 is a breaking release — see the rule at the top of this file before touching Next internals.
- A Supabase SSR helper exists at `src/lib/supabase/middleware.ts`, but there is **no root `middleware.ts` wiring it in** — so middleware-based session refresh is not currently active. Noted as-is; verify before relying on auto session refresh.
