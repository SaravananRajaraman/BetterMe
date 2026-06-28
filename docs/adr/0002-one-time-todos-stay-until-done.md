# One-time todos stay until done

A one-time todo (the default for new todos) has no due-date column, so we define
its visibility from `created_at` plus completion records: it appears every day
from creation until it has a completion, then only on the day it was completed.
We chose this over showing it solely on its creation date (an unfinished task
would silently vanish the next day) and over adding a `due_date` column (a schema
change we didn't need).

## Consequences

- Visibility now depends on *cross-date* completion data, which a single-day query
  doesn't carry — so `useTodos` and `getGuestTodosForDate` additionally load each
  one-time todo's earlier completions, and `computeDailySummary` factors them in.
- In analytics, an unfinished one-time todo counts toward the *scheduled* set (and
  thus the denominator / missed count) on every day until it is resolved — by
  design: it was genuinely outstanding on those days.
