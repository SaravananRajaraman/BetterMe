import {
  format,
  subDays,
  parseISO,
  differenceInDays,
  differenceInCalendarDays,
  getDay,
  getDate,
  getDaysInMonth,
} from "date-fns";
import type { Todo, TodoCompletion, DailySummary, StreakInfo } from "@/lib/types";

/**
 * Pure analytics + scheduling helpers shared by the dashboard and the analytics
 * screen. Keep this module free of React / Supabase so it stays unit-testable.
 */

/**
 * Whether a recurring todo's *recurrence rule* matches a given date.
 *
 * This concerns recurrence only — it does not consider the todo's creation date
 * or completion state. For "should this todo appear on this day" use
 * {@link isTodoScheduledOnDate}, which layers those rules on top.
 *
 * Non-recurring (one-time) todos return `true` here; their day-to-day visibility
 * is decided by {@link isTodoScheduledOnDate}.
 */
export function shouldShowTodoOnDate(todo: Todo, date: string): boolean {
  if (!todo.is_recurring) return true; // one-time visibility handled elsewhere
  switch (todo.recurrence_type ?? "daily") {
    case "interval": {
      const diff = differenceInCalendarDays(
        parseISO(date),
        parseISO(todo.created_at)
      );
      return diff >= 0 && diff % (todo.recurrence_interval ?? 1) === 0;
    }
    case "weekly": {
      const dow = getDay(parseISO(date)); // 0=Sun…6=Sat
      return (todo.recurrence_days ?? []).includes(dow);
    }
    case "monthly": {
      const d = parseISO(date);
      const dom = getDate(d); // 1-31
      const daysInMonth = getDaysInMonth(d);
      // A target day that overruns this month (e.g. 31 in February) clamps to
      // the month's last day so the habit still appears once that month.
      return (todo.recurrence_days ?? []).some(
        (target) =>
          target === dom || (target > daysInMonth && dom === daysInMonth)
      );
    }
    default:
      return true; // "daily" — shows every day
  }
}

/**
 * Whether a todo should appear on a given date, accounting for recurrence,
 * creation date, and (for one-time todos) completion state.
 *
 * - Recurring: created on/before the date AND matches the recurrence rule.
 * - One-time: created on/before the date AND not yet resolved — it "stays until
 *   done", remaining visible every day until it has a completion on an earlier
 *   date, after which it only shows on the day it was completed.
 *
 * @param todoCompletions completion rows for *this* todo (any date).
 */
export function isTodoScheduledOnDate(
  todo: Todo,
  date: string,
  todoCompletions: TodoCompletion[]
): boolean {
  if (differenceInCalendarDays(parseISO(date), parseISO(todo.created_at)) < 0) {
    return false; // not created yet
  }
  if (todo.is_recurring) {
    return shouldShowTodoOnDate(todo, date);
  }
  // One-time: hide once it has been resolved on an earlier date.
  return !todoCompletions.some((c) => c.completed_date < date);
}

/**
 * Summarise a single day's completion stats. The denominator is the set of todos
 * *scheduled* on that day; the numerator counts only completions for todos in
 * that scheduled set, so the rate is always 0–100%.
 */
export function computeDailySummary(
  todos: Todo[],
  completions: TodoCompletion[],
  day: string
): DailySummary {
  const completionsByTodo = new Map<string, TodoCompletion[]>();
  for (const c of completions) {
    const list = completionsByTodo.get(c.todo_id);
    if (list) list.push(c);
    else completionsByTodo.set(c.todo_id, [c]);
  }

  const scheduledIds = new Set(
    todos
      .filter((t) =>
        isTodoScheduledOnDate(t, day, completionsByTodo.get(t.id) ?? [])
      )
      .map((t) => t.id)
  );

  const dayCompletions = completions.filter(
    (c) => c.completed_date === day && scheduledIds.has(c.todo_id)
  );
  const completedCount = dayCompletions.filter((c) => !c.skipped).length;
  const skippedCount = dayCompletions.filter((c) => c.skipped).length;
  const total = scheduledIds.size;
  const missedCount = Math.max(0, total - completedCount - skippedCount);

  return {
    date: day,
    totalTodos: total,
    completedCount,
    skippedCount,
    missedCount,
    completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
  };
}

/**
 * Compute current/longest streaks from the set of dates that had at least one
 * non-skipped completion. A streak day is any day with a completion.
 */
export function computeStreaks(completionDates: string[]): StreakInfo {
  if (completionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  const uniqueDates = [...new Set(completionDates)].sort((a, b) =>
    b.localeCompare(a)
  );
  const lastCompletedDate = uniqueDates[0];

  // Current streak — only counts if the most recent completion is today/yesterday.
  let currentStreak = 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    let checkDate = uniqueDates[0] === today ? new Date() : subDays(new Date(), 1);
    for (const dateStr of uniqueDates) {
      const expected = format(checkDate, "yyyy-MM-dd");
      if (dateStr === expected) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Longest streak — longest run of consecutive days anywhere in the history.
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parseISO(uniqueDates[i - 1]);
    const curr = parseISO(uniqueDates[i]);
    if (differenceInDays(prev, curr) === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak, lastCompletedDate };
}
