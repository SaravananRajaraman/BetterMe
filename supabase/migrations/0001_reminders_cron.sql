-- ============================================================================
-- Reminder push scheduling (pg_cron + pg_net)
-- ----------------------------------------------------------------------------
-- Runs every minute and POSTs to the app's reminder dispatcher
-- (/api/notifications/cron), which decides who to notify.
--
-- Before running, replace the two placeholders below with your real values:
--   <SITE_URL>     e.g. https://your-app.vercel.app   (no trailing slash)
--   <CRON_SECRET>  the same value set in the app's CRON_SECRET env var
--
-- NOTE: the managed-Supabase Postgres role cannot `ALTER DATABASE ... SET`, so
-- database-level GUC settings (e.g. app.settings.cron_secret) are not an option
-- here — the URL and secret are inlined into the job definition instead. The
-- secret therefore lives in `cron.job.command` (readable with privileged DB
-- access). For stronger isolation, store it in Supabase Vault and read it via
-- `vault.decrypted_secrets` inside the job body.
--
-- Run this in the Supabase SQL editor after editing the placeholders.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-running is safe: drop any previous schedule with this name first.
select cron.unschedule('send-reminders')
where exists (select 1 from cron.job where jobname = 'send-reminders');

select cron.schedule(
  'send-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url := '<SITE_URL>/api/notifications/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
