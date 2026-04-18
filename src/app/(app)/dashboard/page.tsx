"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, ClipboardCheck, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { TodoList } from "@/components/todos/todo-list";
import { AddTodoDialog } from "@/components/todos/add-todo-dialog";
import { CategoryManagerDialog } from "@/components/todos/category-manager-dialog";
import { DailyReviewDialog } from "@/components/review/daily-review-dialog";
import { useTodos } from "@/hooks/use-todos";
import { useCategories } from "@/hooks/use-categories";
import { useAppStore } from "@/stores/app-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const { data: todos } = useTodos();
  const { data: categories } = useCategories();
  const setAddTodoOpen = useAppStore((s) => s.setAddTodoOpen);
  const setReviewOpen = useAppStore((s) => s.setReviewOpen);
  const selectedCategoryId = useAppStore((s) => s.selectedCategoryId);
  const setSelectedCategoryId = useAppStore((s) => s.setSelectedCategoryId);

  const total = todos?.length || 0;
  const completed =
    todos?.filter((t) => t.completion && !t.completion.skipped).length || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReviewOpen(true)}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Review</span>
          </Button>
          <Button size="sm" onClick={() => setAddTodoOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Todo</span>
          </Button>
        </div>
      </div>

      {/* Progress card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today&apos;s Progress</span>
            <span className="text-sm text-muted-foreground">
              {completed} / {total} completed
            </span>
          </div>
          <Progress value={completionRate} className="h-2.5" />
          <p className="text-right text-xs text-muted-foreground mt-1">
            {completionRate}%
          </p>
        </CardContent>
      </Card>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories && categories.length > 0 && (
          <>
            <Badge
              variant={selectedCategoryId === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategoryId(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                className={cn("cursor-pointer")}
                onClick={() =>
                  setSelectedCategoryId(
                    selectedCategoryId === cat.id ? null : cat.id
                  )
                }
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </Badge>
            ))}
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-auto shrink-0"
          onClick={() => setCategoryManagerOpen(true)}
          title="Manage categories"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Todo list */}
      <TodoList />

      {/* Dialogs */}
      <AddTodoDialog />
      <DailyReviewDialog />
      <CategoryManagerDialog
        open={categoryManagerOpen}
        onOpenChange={setCategoryManagerOpen}
      />
    </div>
  );
}
