"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, SkipForward } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { useToggleCompletion, useDeleteTodo } from "@/hooks/use-todos";
import { useAppStore } from "@/stores/app-store";
import type { TodoWithCompletion } from "@/lib/types";
import { cn } from "@/lib/utils";
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

interface TodoCardProps {
  todo: TodoWithCompletion;
}

export function TodoCard({ todo }: TodoCardProps) {
  const toggleCompletion = useToggleCompletion();
  const deleteTodo = useDeleteTodo();
  const setEditTodoId = useAppStore((s) => s.setEditTodoId);

  const isCompleted = !!todo.completion && !todo.completion.skipped;
  const isSkipped = !!todo.completion?.skipped;

  const handleToggle = () => {
    toggleCompletion.mutate({
      todoId: todo.id,
      completed: !todo.completion,
    });
  };

  const handleSkip = () => {
    if (isSkipped) {
      // Unskip
      toggleCompletion.mutate({ todoId: todo.id, completed: false });
    } else {
      toggleCompletion.mutate({ todoId: todo.id, completed: true, skipped: true });
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-4 transition-all",
        isCompleted && "bg-muted/50 opacity-75",
        isSkipped && "bg-muted/30 opacity-60"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        className="mt-0.5"
        disabled={isSkipped}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-medium",
              isCompleted && "line-through text-muted-foreground",
              isSkipped && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </span>
          <CategoryBadge category={todo.category} />
        </div>

        {todo.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {todo.description}
          </p>
        )}

        {todo.reminder_time && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{todo.reminder_time}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSkip}
          title={isSkipped ? "Unskip" : "Skip"}
        >
          <SkipForward className={cn("h-4 w-4", isSkipped && "text-amber-500")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditTodoId(todo.id)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete todo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{todo.title}&rdquo;. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTodo.mutate(todo.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
