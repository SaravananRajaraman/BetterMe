"use client";

import { useTodos } from "@/hooks/use-todos";
import { useAppStore } from "@/stores/app-store";
import { TodoCard } from "./todo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";

function TodoSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-4 rounded mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodoList() {
  const { data: todos, isLoading, error } = useTodos();
  const selectedCategoryId = useAppStore((s) => s.selectedCategoryId);

  if (isLoading) return <TodoSkeleton />;

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load todos</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  const filteredTodos = selectedCategoryId
    ? todos?.filter((t) => t.category_id === selectedCategoryId)
    : todos;

  if (!filteredTodos || filteredTodos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">No todos yet</p>
        <p className="text-xs mt-1">Add your first daily habit to get started</p>
      </div>
    );
  }

  // Separate completed and incomplete
  const incomplete = filteredTodos.filter((t) => !t.completion);
  const completed = filteredTodos.filter(
    (t) => t.completion && !t.completion.skipped
  );
  const skipped = filteredTodos.filter((t) => t.completion?.skipped);

  return (
    <div className="space-y-6">
      {/* Remaining todos */}
      {incomplete.length > 0 && (
        <div className="space-y-2">
          {incomplete.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {/* Completed todos */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Completed ({completed.length})
          </p>
          {completed.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {/* Skipped todos */}
      {skipped.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Skipped ({skipped.length})
          </p>
          {skipped.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
