"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthlyAnalytics } from "@/hooks/use-analytics";
import { format, addMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import { MonthlyHeatmap } from "./monthly-heatmap";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MonthlyInsights() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const currentMonthDate = addMonths(now, monthOffset);
  const currentMonth = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();
  const { data, isLoading } = useMonthlyAnalytics(currentMonth, currentYear);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data ?? [];

  const avgRate =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((sum, d) => sum + d.completionRate, 0) /
            chartData.length
        )
      : 0;

  const totalCompleted = chartData.reduce(
    (sum, d) => sum + d.completedCount,
    0
  );

  const totalTodos = chartData.reduce((sum, d) => sum + d.totalTodos, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRate}%</p>
              <p className="text-xs text-muted-foreground">Avg Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50">
              <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTodos}</p>
              <p className="text-xs text-muted-foreground">Total Habits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            {format(currentMonthDate, "MMMM yyyy")} — Habit Heatmap
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMonthOffset((o) => o - 1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMonthOffset((o) => o + 1)}
              disabled={monthOffset >= 0}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MonthlyHeatmap
            data={chartData}
            month={currentMonth}
            year={currentYear}
          />
        </CardContent>
      </Card>
    </div>
  );
}
