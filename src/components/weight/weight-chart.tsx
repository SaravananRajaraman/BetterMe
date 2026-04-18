"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeightEntries } from "@/hooks/use-weight";
import { format, parseISO, subDays } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WeightEntry } from "@/lib/types";

const RANGES = [
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "All", days: 0 },
] as const;

function filterByRange(entries: WeightEntry[], days: number): WeightEntry[] {
  if (days === 0) return entries;
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoff);
}

export function WeightChart() {
  const [range, setRange] = useState<0 | 30 | 90>(30);
  const { data: entries = [], isLoading } = useWeightEntries(365);

  const filtered = filterByRange(entries, range).slice().reverse(); // oldest first for chart

  const unit = filtered[0]?.unit ?? "kg";

  const chartData = filtered.map((e) => ({
    date: format(parseISO(e.date), "MMM d"),
    weight: Number(e.weight),
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[240px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Weight Trend</CardTitle>
        <div className="flex gap-1 rounded-lg border p-0.5 bg-muted/50">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRange(r.days as 0 | 30 | 90)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                range === r.days
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
            Log at least 2 entries to see a trend
          </div>
        ) : (
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: -10, right: 8, top: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                  width={40}
                  domain={["auto", "auto"]}
                  label={{
                    value: unit,
                    position: "insideLeft",
                    angle: -90,
                    offset: 10,
                    style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} ${unit}`, "Weight"]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
