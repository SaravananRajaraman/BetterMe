/**
 * Pure time helpers for the reminder cron. Kept free of I/O so they can be
 * unit-tested deterministically.
 */

/**
 * The local calendar date (`yyyy-MM-dd`) and `HH:MM` for a timezone at a given
 * instant. Uses the h23 hour cycle so midnight is `00:MM`, never `24:MM`.
 */
export function localNowParts(
  timeZone: string,
  now: Date
): { date: string; minute: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minute: `${get("hour")}:${get("minute")}`,
  };
}

/**
 * Whether `minute` ("HH:MM") falls within a quiet-hours window. Supports windows
 * that wrap past midnight (e.g. 22:00 → 07:00). Returns false if either bound is
 * missing or the bounds are equal.
 */
export function isWithinQuietHours(
  minute: string,
  start: string | null,
  end: string | null
): boolean {
  if (!start || !end) return false;
  const s = start.slice(0, 5);
  const e = end.slice(0, 5);
  if (s === e) return false;
  if (s < e) return minute >= s && minute < e;
  // window wraps past midnight
  return minute >= s || minute < e;
}
