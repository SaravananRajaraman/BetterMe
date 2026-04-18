"use client";

import {
  getDaysInMonth,
  getDay,
  startOfMonth,
  parseISO,
  format,
  isToday,
} from "date-fns";
import { useState } from "react";
import type { DailySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MonthlyHeatmapProps {
  data: DailySummary[];
  month: number; // 0-based
  year: number;
}

const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getCellColor(summary: DailySummary | undefined): string {
  if (!summary || summary.totalTodos === 0)
    return "bg-muted hover:bg-muted/80";
  const rate = summary.completionRate;
  if (rate === 0) return "bg-red-200 dark:bg-red-900/50 hover:opacity-80";
  if (rate < 50) return "bg-yellow-200 dark:bg-yellow-800/50 hover:opacity-80";
  if (rate < 75) return "bg-green-200 dark:bg-green-900/50 hover:opacity-80";
  if (rate < 100) return "bg-green-400/70 dark:bg-green-700/60 hover:opacity-80";
  return "bg-green-600 dark:bg-green-500 hover:opacity-80";
}

function getCellTextColor(summary: DailySummary | undefined): string {
  if (!summary || summary.totalTodos === 0) return "text-muted-foreground";
  const rate = summary.completionRate;
  if (rate === 100) return "text-white dark:text-white";
  if (rate >= 75) return "text-green-950 dark:text-green-100";
  return "text-foreground/80";
}

export function MonthlyHeatmap({ data, month, year }: MonthlyHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    day: number;
    summary: DailySummary | undefined;
    x: number;
    y: number;
  } | null>(null);

  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  // getDay returns 0=Sun, convert to Mon-first: 0=Mon … 6=Sun
  const rawStart = getDay(startOfMonth(new Date(year, month, 1)));
  const startOffset = rawStart === 0 ? 6 : rawStart - 1;

  const summaryByDate = Object.fromEntries(data.map((d) => [d.date, d]));

  const totalCells = startOffset + daysInMonth;
  const gridRows = Math.ceil(totalCells / 7);

  return (
    <div className="relative select-none">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-1"
        style={{ gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }}
      >
        {/* Empty offset cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const summary = summaryByDate[dateStr];
          const todayCell = isToday(parseISO(dateStr));

          return (
            <div
              key={day}
              className={cn(
                "relative flex items-center justify-center rounded-md cursor-default transition-opacity",
                "min-h-[36px] aspect-square text-xs font-medium",
                getCellColor(summary),
                getCellTextColor(summary),
                todayCell && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ day, summary, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end flex-wrap">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[
          "bg-muted",
          "bg-red-200 dark:bg-red-900/50",
          "bg-yellow-200 dark:bg-yellow-800/50",
          "bg-green-200 dark:bg-green-900/50",
          "bg-green-400/70 dark:bg-green-700/60",
          "bg-green-600 dark:bg-green-500",
        ].map((cls, i) => (
          <div key={i} className={cn("h-3 w-3 rounded-sm", cls)} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-card border rounded-lg shadow-lg px-3 py-2 text-xs"
          style={{
            left: Math.min(tooltip.x, typeof window !== "undefined" ? window.innerWidth - 160 : tooltip.x),
            top: tooltip.y - 80,
          }}
        >
          <p className="font-semibold">
            {format(
              new Date(year, month, tooltip.day),
              "EEE, MMM d"
            )}
          </p>
          {tooltip.summary && tooltip.summary.totalTodos > 0 ? (
            <>
              <p className="text-muted-foreground">
                {tooltip.summary.completedCount}/{tooltip.summary.totalTodos} completed
              </p>
              <p className="font-medium text-foreground">
                {tooltip.summary.completionRate}%
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No habits</p>
          )}
        </div>
      )}
    </div>
  );
}
