-- ============================================================================
-- Reminder push scheduling (pg_cron + pg_net)
-- ----------------------------------------------------------------------------
-- Runs every minute and POSTs to the app's reminder dispatcher
-- (/api/notifications/cron), which decides who to notify. Secrets are read from
-- database settings so they are NOT committed here.
--
-- One-time setup (run once, with your real values — e.g. in the SQL editor):
--   alter database postgres set "app.settings.site_url"   = 'https://your-app.vercel.app';
--   alter database postgres set "app.settings.cron_secret" = 'your-CRON_SECRET';
--
-- Then run this file.
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
    url := current_setting('app.settings.site_url') || '/api/notifications/cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
