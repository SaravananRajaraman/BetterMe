"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { MonthlyInsights } from "@/components/analytics/monthly-insights";
import { StreakCard } from "@/components/analytics/streak-card";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and build consistency
        </p>
      </div>

      {isGuestMode ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Sign in to unlock analytics</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Weekly trends, monthly insights, and streaks are available once
                you create an account. Your guest data stays on this device.
              </p>
            </div>
            <Link href="/login" className={cn(buttonVariants())}>
              Sign in
            </Link>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
