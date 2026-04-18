-- Backfill default categories for users who signed up before the trigger was created.
-- Safe to run multiple times (INSERT ... WHERE NOT EXISTS is idempotent).
-- Run this once in the Supabase SQL Editor after applying schema.sql.

INSERT INTO public.categories (user_id, name, color, icon, is_default, sort_order)
SELECT p.id, c.name, c.color, c.icon, true, c.sort_order
FROM public.profiles p
CROSS JOIN (VALUES
  ('Health',   '#22c55e', 'heart',      0),
  ('Work',     '#3b82f6', 'briefcase',  1),
  ('Personal', '#a855f7', 'user',       2),
  ('Learning', '#f59e0b', 'book-open',  3)
) AS c(name, color, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE user_id = p.id
);
