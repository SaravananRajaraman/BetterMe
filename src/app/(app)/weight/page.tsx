"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WeightSummaryCard } from "@/components/weight/weight-summary-card";
import { WeightChart } from "@/components/weight/weight-chart";
import { AddWeightDialog } from "@/components/weight/add-weight-dialog";
import { useWeightEntries, useDeleteWeight } from "@/hooks/use-weight";

export default function WeightPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: entries = [], isLoading } = useWeightEntries(90);
  const deleteEntry = useDeleteWeight();

  const recentEntries = entries.slice(0, 10);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weight Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your weight over time
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Log Weight
        </Button>
      </div>

      {/* Summary card */}
      <WeightSummaryCard />

      {/* Chart */}
      <WeightChart />

      {/* Recent entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No entries yet. Log your first weight!
            </p>
          ) : (
            <div className="divide-y">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {Number(entry.weight).toFixed(1)} {entry.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), "EEE, MMM d, yyyy")}
                      {entry.notes && ` · ${entry.notes}`}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove the{" "}
                          {Number(entry.weight).toFixed(1)} {entry.unit} entry
                          for {format(parseISO(entry.date), "MMM d, yyyy")}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteEntry.mutate(entry.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddWeightDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
