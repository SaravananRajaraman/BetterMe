"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStreaks } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Calendar } from "lucide-react";

export function StreakCard() {
  const { data, isLoading } = useStreaks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {data?.currentStreak || 0}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          {(data?.currentStreak || 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              🔥 Keep it going!
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {data?.longestStreak || 0}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Personal best</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Last Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-lg font-semibold">
            {data?.lastCompletedDate || "No activity yet"}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
