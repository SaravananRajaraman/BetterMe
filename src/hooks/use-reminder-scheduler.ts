"use client";

import { useEffect } from "react";
import type { TodoWithCompletion } from "@/lib/types";

function isNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("notifications_enabled") === "true" &&
    Notification.permission === "granted"
  );
}

/**
 * Schedules browser Notification calls for each todo that has a reminder_time
 * set to a future time today. Only fires when notifications are enabled via
 * the settings toggle. Cleans up all pending timeouts on unmount or when
 * todos change.
 *
 * NOTE: this is a best-effort, in-tab fallback — it only fires while the tab is
 * open. For signed-in users, server-side Web Push (the /api/notifications/cron
 * dispatcher) is the primary delivery path and works with the app closed. Both
 * use the same notification `tag` (`todo-<id>`), so if they overlap the OS
 * replaces rather than stacks them. Guests, who can't be push-subscribed, rely
 * on this path alone.
 */
export function useReminderScheduler(todos: TodoWithCompletion[] | undefined) {
  useEffect(() => {
    if (!todos || typeof window === "undefined" || !("Notification" in window)) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    todos.forEach((todo) => {
      if (!todo.reminder_time) return;
      if (todo.completion) return; // already completed or skipped today

      const [hours, minutes] = todo.reminder_time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      const now = new Date();
      const reminderDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
      );
      const msUntil = reminderDate.getTime() - now.getTime();

      // Only schedule if reminder is in the future within this calendar day
      if (msUntil <= 0 || msUntil > 86_400_000) return;

      const id = setTimeout(() => {
        if (!isNotificationsEnabled()) return;
        new Notification(todo.title, {
          body: todo.description || "Time for your habit!",
          icon: "/icons/icon-192x192.png",
          tag: `todo-${todo.id}`,
        });
      }, msUntil);

      timeouts.push(id);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [todos]);
}
