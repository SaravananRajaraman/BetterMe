"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  parseISO,
} from "date-fns";
import type { DailySummary, StreakInfo } from "@/lib/types";

const supabase = createClient();

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: ["analytics", "weekly"],
    queryFn: async (): Promise<DailySummary[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      // Get all todos count
      const { count: totalTodos } = await supabase
        .from("todos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);

      // Get completions for the week
      const { data: completions } = await supabase
        .from("todo_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_date", format(weekStart, "yyyy-MM-dd"))
        .lte("completed_date", format(weekEnd, "yyyy-MM-dd"));

      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayCompletions =
          completions?.filter((c) => c.completed_date === dateStr) || [];
        const completedCount = dayCompletions.filter((c) => !c.skipped).length;
        const skippedCount = dayCompletions.filter((c) => c.skipped).length;
        const total = totalTodos || 0;
        const missedCount = Math.max(0, total - completedCount - skippedCount);

        return {
          date: dateStr,
          totalTodos: total,
          completedCount,
          skippedCount,
          missedCount,
          completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        };
      });
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

      const { count: totalTodos } = await supabase
        .from("todos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: completions } = await supabase
        .from("todo_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_date", format(monthStart, "yyyy-MM-dd"))
        .lte("completed_date", format(monthEnd, "yyyy-MM-dd"));

      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayCompletions =
          completions?.filter((c) => c.completed_date === dateStr) || [];
        const completedCount = dayCompletions.filter((c) => !c.skipped).length;
        const skippedCount = dayCompletions.filter((c) => c.skipped).length;
        const total = totalTodos || 0;
        const missedCount = Math.max(0, total - completedCount - skippedCount);

        return {
          date: dateStr,
          totalTodos: total,
          completedCount,
          skippedCount,
          missedCount,
          completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        };
      });
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

      // Get all unique completion dates, ordered descending
      const { data: completions } = await supabase
        .from("todo_completions")
        .select("completed_date")
        .eq("user_id", user.id)
        .eq("skipped", false)
        .order("completed_date", { ascending: false });

      if (!completions || completions.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
      }

      // Get unique dates
      const uniqueDates = [
        ...new Set(completions.map((c) => c.completed_date)),
      ].sort((a, b) => b.localeCompare(a));

      const lastCompletedDate = uniqueDates[0];

      // Calculate current streak
      let currentStreak = 0;
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

      // Start from today or yesterday
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

      // Calculate longest streak
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
    },
  });
}
