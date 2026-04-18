import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

// Configure VAPID once at module load
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:betterme@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Returns a "HH:MM" string for the current wall-clock time in a given IANA
 * timezone, e.g. "09:30".
 */
function currentTimeInZone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    // Fall back to UTC if the stored timezone is invalid
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  }
}

/**
 * Returns true when `currentTime` falls inside quiet hours
 * [start, end). Handles overnight ranges (e.g. 22:00 – 07:00).
 */
function isInQuietHours(
  currentTime: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start || !end) return false;
  if (start === end) return false;

  // Compare as "HH:MM" strings — lexicographic order works for 24-h time
  if (start < end) {
    return currentTime >= start && currentTime < end;
  }
  // Overnight range (e.g. 22:00 – 07:00)
  return currentTime >= start || currentTime < end;
}

/**
 * GET  /api/notifications/cron
 * POST /api/notifications/cron
 *
 * Called every minute by Vercel Cron (configured in vercel.json).
 * Vercel automatically adds `Authorization: Bearer <CRON_SECRET>`.
 *
 * Also supports GET so Vercel's health-check ping works without a body.
 */
export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Supabase service-role client (bypasses RLS) ───────────────────────────
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Find todos whose reminder_time matches "right now" in each user's TZ ──
  // Fetch active todos with reminders and enabled profiles separately, then
  // join in JS to avoid Supabase foreign-key inference issues.
  const [{ data: todos, error: todosError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("todos")
        .select("id, title, user_id, reminder_time")
        .eq("is_active", true)
        .not("reminder_time", "is", null),
      supabase
        .from("profiles")
        .select(
          "id, timezone, quiet_hours_start, quiet_hours_end, notifications_enabled"
        )
        .eq("notifications_enabled", true),
    ]);

  if (todosError || profilesError) {
    console.error("[cron] DB error:", todosError?.message ?? profilesError?.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!todos || todos.length === 0 || !profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // Build a lookup map: userId → profile
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // ── Match todos whose reminder fires this minute ──────────────────────────
  const dueNow = todos.filter((todo) => {
    const profile = profileMap.get(todo.user_id);
    if (!profile) return false;

    const tz = profile.timezone || "UTC";
    const localTime = currentTimeInZone(tz);

    if (todo.reminder_time !== localTime) return false;

    if (
      isInQuietHours(
        localTime,
        profile.quiet_hours_start,
        profile.quiet_hours_end
      )
    ) {
      return false;
    }

    return true;
  });

  if (dueNow.length === 0) {
    return NextResponse.json({ sent: 0, skipped: todos.length });
  }

  // ── Fetch push subscriptions for affected users ───────────────────────────
  const userIds = [...new Set(dueNow.map((t) => t.user_id))];

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, skipped: dueNow.length });
  }

  const subsByUser = subscriptions.reduce<
    Record<string, typeof subscriptions>
  >((acc, sub) => {
    (acc[sub.user_id] ??= []).push(sub);
    return acc;
  }, {});

  // ── Send notifications ─────────────────────────────────────────────────────
  let sent = 0;
  const expiredIds: string[] = [];

  for (const todo of dueNow) {
    const userSubs = subsByUser[todo.user_id] ?? [];

    const payload = JSON.stringify({
      title: todo.title,
      body: "Time for your habit!",
      url: "/dashboard",
      tag: `reminder-${todo.id}`,
    });

    const results = await Promise.allSettled(
      userSubs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
          },
          payload
        )
      )
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        const statusCode = (result.reason as { statusCode?: number })
          ?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          expiredIds.push(userSubs[idx].id);
        } else {
          console.warn(
            `[cron] Push failed for sub ${userSubs[idx].id}:`,
            result.reason
          );
        }
      }
    });
  }

  // ── Clean up expired subscriptions ────────────────────────────────────────
  if (expiredIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }

  return NextResponse.json({
    sent,
    expired: expiredIds.length,
    skipped: todos.length - dueNow.length,
  });
}
