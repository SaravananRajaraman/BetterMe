import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTodoScheduledOnDate } from "@/lib/analytics-calculations";
import { sendPush } from "@/lib/push/send";
import { localNowParts, isWithinQuietHours } from "@/lib/push/reminder-window";
import type { PushSubscription, Todo } from "@/lib/types";

/**
 * Reminder dispatcher, invoked every minute by Supabase pg_cron (see
 * supabase/migrations/0001_reminders_cron.sql). For each opted-in user whose
 * local clock has reached a todo's reminder time, sends a Web Push to their
 * subscriptions — provided the todo is scheduled today, not yet completed, and
 * outside the user's quiet hours. Authorized via the shared CRON_SECRET.
 */
export async function POST(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, timezone, quiet_hours_start, quiet_hours_end")
    .eq("notifications_enabled", true);
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = profiles.map((p) => p.id);

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("is_active", true)
    .not("reminder_time", "is", null)
    .in("user_id", userIds);

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  const todosByUser = groupBy(todos ?? [], (t) => t.user_id);
  const subsByUser = groupBy(subs ?? [], (s) => s.user_id);

  let sent = 0;
  const staleEndpoints: string[] = [];

  for (const profile of profiles) {
    const userTodos = todosByUser.get(profile.id);
    const userSubs = subsByUser.get(profile.id);
    if (!userTodos || !userSubs || userSubs.length === 0) continue;

    const { date: localDate, minute } = localNowParts(
      profile.timezone ?? "UTC",
      now
    );
    if (isWithinQuietHours(minute, profile.quiet_hours_start, profile.quiet_hours_end)) {
      continue;
    }

    const dueTodos = userTodos.filter(
      (t) => (t.reminder_time ?? "").slice(0, 5) === minute
    );
    if (dueTodos.length === 0) continue;

    const { data: completions } = await supabase
      .from("todo_completions")
      .select("*")
      .eq("user_id", profile.id)
      .in(
        "todo_id",
        dueTodos.map((t) => t.id)
      )
      .lte("completed_date", localDate);
    const comps = completions ?? [];

    for (const todo of dueTodos) {
      const todoComps = comps.filter((c) => c.todo_id === todo.id);
      // Scheduled today, and not already done/skipped today.
      if (!isTodoScheduledOnDate(todo, localDate, todoComps)) continue;
      if (todoComps.some((c) => c.completed_date === localDate)) continue;

      for (const sub of userSubs) {
        const result = await sendPush(sub, {
          title: todo.title,
          body: todo.description || "Time for your habit!",
          url: "/dashboard",
          // Same tag as the in-tab scheduler so the OS replaces rather than
          // stacks if both happen to fire.
          tag: `todo-${todo.id}`,
        });
        if (result === "sent") sent++;
        else if (result === "gone") staleEndpoints.push(sub.endpoint);
      }
    }
  }

  if (staleEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ sent });
}

function groupBy<T extends Todo | PushSubscription>(
  rows: T[],
  key: (row: T) => string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  return map;
}
