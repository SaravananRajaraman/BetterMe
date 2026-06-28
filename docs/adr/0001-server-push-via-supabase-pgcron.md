# Server-side reminder push driven by Supabase pg_cron

Reminders must fire even when the app is closed, which an in-tab `setTimeout`
cannot do. We send Web Push from the server, scheduled by **Supabase `pg_cron` +
`pg_net`** calling a protected `/api/cron/send-reminders` route every minute,
rather than Vercel Cron (whose free tier only runs once per day — per-minute
delivery would require Vercel Pro) or a standalone Supabase Edge Function (a
separate Deno runtime with duplicated logic). pg_cron is free at per-minute
granularity and keeps the sender logic in the Next app.

## Consequences

- The cron route uses the Supabase **service-role key** (RLS would otherwise hide
  other users' todos/subscriptions) and is gated by a shared `CRON_SECRET`. Both
  are new required env vars.
- `pg_cron` and `pg_net` must be enabled on the Supabase project.
- Guests have no `user_id`, so they cannot be push-subscribed; they keep the
  in-tab scheduler as a best-effort fallback.
