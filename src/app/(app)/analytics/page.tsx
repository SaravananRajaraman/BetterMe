"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { MonthlyInsights } from "@/components/analytics/monthly-insights";
import { StreakCard } from "@/components/analytics/streak-card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and build consistency
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklyChart />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyInsights />
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <StreakCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
