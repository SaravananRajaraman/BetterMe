"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useWeightEntries } from "@/hooks/use-weight";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { AddWeightDialog } from "./add-weight-dialog";
import { useState } from "react";

export function WeightSummaryCard() {
  const [open, setOpen] = useState(false);
  const { data: entries = [], isLoading } = useWeightEntries(2);

  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;

  const delta =
    latest && previous
      ? Number(latest.weight) - Number(previous.weight)
      : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950/50">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            {latest ? (
              <div>
                <p className="text-2xl font-bold">
                  {Number(latest.weight).toFixed(1)}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    {latest.unit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(latest.date), "EEE, MMM d")}
                </p>
                {delta !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium mt-0.5",
                      delta < 0
                        ? "text-green-600 dark:text-green-400"
                        : delta > 0
                          ? "text-red-500 dark:text-red-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {delta < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : delta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    <span>
                      {delta === 0
                        ? "No change"
                        : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} ${latest.unit} since last entry`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">No entries yet</p>
                <p className="text-xs text-muted-foreground">
                  Log your first weight below
                </p>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setOpen(true)} className="shrink-0">
            Log Weight
          </Button>
        </CardContent>
      </Card>

      <AddWeightDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
