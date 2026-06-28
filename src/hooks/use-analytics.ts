"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import type { DailySummary, StreakInfo, Todo, TodoCompletion } from "@/lib/types";
import { computeDailySummary, computeStreaks } from "@/lib/analytics-calculations";

const supabase = createClient();

/**
 * Fetches the active todos plus the completions needed to compute per-day
 * summaries over [start, end]. For one-time todos we also load completions
 * before `start`, so the "stays until done" rule can tell whether a one-time
 * todo was already resolved before the range began.
 */
async function fetchSummaryInputs(
  userId: string,
  start: string,
  end: string
): Promise<{ todos: Todo[]; completions: TodoCompletion[] }> {
  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  const activeTodos = todos ?? [];

  const { data: rangeCompletions } = await supabase
    .from("todo_completions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_date", start)
    .lte("completed_date", end);

  const oneTimeIds = activeTodos
    .filter((t) => !t.is_recurring)
    .map((t) => t.id);

  let priorCompletions: TodoCompletion[] = [];
  if (oneTimeIds.length > 0) {
    const { data } = await supabase
      .from("todo_completions")
      .select("*")
      .eq("user_id", userId)
      .in("todo_id", oneTimeIds)
      .lt("completed_date", start);
    priorCompletions = data ?? [];
  }

  return {
    todos: activeTodos,
    completions: [...priorCompletions, ...(rangeCompletions ?? [])],
  };
}

export function useWeeklyAnalytics(weekStart?: Date) {
  const resolvedWeekStart = weekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(resolvedWeekStart, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["analytics", "weekly", weekStartStr],
    queryFn: async (): Promise<DailySummary[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const weekEnd = endOfWeek(resolvedWeekStart, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: resolvedWeekStart, end: weekEnd });
      const { todos, completions } = await fetchSummaryInputs(
        user.id,
        format(resolvedWeekStart, "yyyy-MM-dd"),
        format(weekEnd, "yyyy-MM-dd")
      );

      return days.map((day) =>
        computeDailySummary(todos, completions, format(day, "yyyy-MM-dd"))
      );
    },
  });
}

export function useMonthlyAnalytics(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = year ?? now.getFullYear();

  return useQuery({
    queryKey: ["analytics", "monthly", y, m],
    queryFn: async (): Promise<DailySummary[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const monthStart = startOfMonth(new Date(y, m));
      const monthEnd = endOfMonth(new Date(y, m));
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const { todos, completions } = await fetchSummaryInputs(
        user.id,
        format(monthStart, "yyyy-MM-dd"),
        format(monthEnd, "yyyy-MM-dd")
      );

      return days.map((day) =>
        computeDailySummary(todos, completions, format(day, "yyyy-MM-dd"))
      );
    },
  });
}

export function useStreaks() {
  return useQuery({
    queryKey: ["analytics", "streaks"],
    queryFn: async (): Promise<StreakInfo> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: completions } = await supabase
        .from("todo_completions")
        .select("completed_date")
        .eq("user_id", user.id)
        .eq("skipped", false)
        .order("completed_date", { ascending: false });

      return computeStreaks((completions ?? []).map((c) => c.completed_date));
    },
  });
}
