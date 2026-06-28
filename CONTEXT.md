# BetterMe

A habit/todo tracker. This glossary fixes the language used across the dashboard,
analytics, and reminders so the same words mean the same thing in code and
conversation.

## Language

**Todo**:
A single trackable item a user wants to do — either a recurring habit or a
one-time task. Lives in the `todos` table.
_Avoid_: Task, habit, item (when precision matters)

**Recurring todo**:
A todo whose appearance is governed by a recurrence rule — `daily`, `interval`
(every N days), `weekly` (chosen weekdays), or `monthly` (chosen days of month,
a day past the month's length clamping to its last day).

**One-time todo**:
A todo with no recurrence that "stays until done": it is shown every day from its
creation until it has a completion, after which it appears only on the day it was
completed.
_Avoid_: Single todo, non-recurring task

**Scheduled** (on a date):
Whether a todo should appear on a given date. A todo is scheduled on date D when
it was created on/before D and either its recurrence rule matches D (recurring) or
it is not yet resolved (one-time). This — not the raw todo count — is the basis
for analytics.

**Completion**:
A record that a todo was marked done (or skipped) on a specific date. Lives in
`todo_completions`, one row per todo per date.

**Skip**:
A completion explicitly marked `skipped` — the todo was neither done nor counted
as missed for that day.

**Completion rate**:
For a date, the share of that date's *scheduled* todos that were completed
(not skipped). Always 0–100% because the numerator is drawn from the same
scheduled set as the denominator.

**Streak day**:
A date with at least one non-skipped completion. The current streak counts back
consecutively from today (or yesterday); the longest streak is the longest such
run in history.

**Guest**:
A user working without an account, whose data lives only in this browser's
localStorage (mirrored by `guest-storage`). Guests use the app fully except
Analytics, which requires a signed-in account.
_Avoid_: Anonymous user, local user
