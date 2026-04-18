"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTodo, useUpdateTodo, useTodos } from "@/hooks/use-todos";
import { useCategories } from "@/hooks/use-categories";
import { useAppStore } from "@/stores/app-store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const RECURRENCE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "interval", label: "Every N Days" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  category_id: z.string().optional(),
  reminder_time: z.string().optional(),
  recurrence_type: z.enum(["daily", "interval", "weekly", "monthly"]),
  recurrence_interval: z.number().int().min(2).max(365).optional(),
  recurrence_days: z.array(z.number()).optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

export function AddTodoDialog() {
  const addTodoOpen = useAppStore((s) => s.addTodoOpen);
  const setAddTodoOpen = useAppStore((s) => s.setAddTodoOpen);
  const editTodoId = useAppStore((s) => s.editTodoId);
  const setEditTodoId = useAppStore((s) => s.setEditTodoId);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const { data: categories } = useCategories();
  const { data: todos } = useTodos();

  const isEditing = !!editTodoId;
  const editingTodo = todos?.find((t) => t.id === editTodoId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      reminder_time: "",
      recurrence_type: "daily",
      recurrence_interval: 2,
      recurrence_days: [],
    },
  });

  const recurrenceType = watch("recurrence_type");
  const recurrenceDays = watch("recurrence_days") ?? [];

  // Populate form when editing
  useEffect(() => {
    if (editingTodo) {
      setValue("title", editingTodo.title);
      setValue("description", editingTodo.description || "");
      setValue("category_id", editingTodo.category_id || "");
      setValue("reminder_time", editingTodo.reminder_time || "");
      setValue("recurrence_type", editingTodo.recurrence_type ?? "daily");
      setValue("recurrence_interval", editingTodo.recurrence_interval ?? 2);
      setValue("recurrence_days", editingTodo.recurrence_days ?? []);
    } else {
      reset();
    }
  }, [editingTodo, setValue, reset]);

  const isOpen = addTodoOpen || isEditing;

  const handleClose = () => {
    setAddTodoOpen(false);
    setEditTodoId(null);
    reset();
  };

  const toggleDay = (day: number) => {
    const current = recurrenceDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setValue("recurrence_days", updated);
  };

  const onSubmit = async (data: TodoFormData) => {
    const recurrencePayload = {
      recurrence_type: data.recurrence_type,
      recurrence_interval:
        data.recurrence_type === "interval" ? (data.recurrence_interval ?? 2) : 1,
      recurrence_days:
        data.recurrence_type === "weekly" || data.recurrence_type === "monthly"
          ? (data.recurrence_days ?? [])
          : null,
    };

    if (isEditing && editTodoId) {
      await updateTodo.mutateAsync({
        id: editTodoId,
        title: data.title,
        description: data.description || null,
        category_id: data.category_id || null,
        reminder_time: data.reminder_time || null,
        ...recurrencePayload,
      });
    } else {
      await createTodo.mutateAsync({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        reminder_time: data.reminder_time,
        ...recurrencePayload,
      });
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Todo" : "Add New Todo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Morning meditation"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={(value) => setValue("category_id", value ?? undefined)}
              defaultValue={editingTodo?.category_id || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_time">Reminder Time (optional)</Label>
            <Input
              id="reminder_time"
              type="time"
              {...register("reminder_time")}
            />
          </div>

          {/* Repeat / Recurrence */}
          <div className="space-y-3">
            <Label>Repeat</Label>

            {/* Type selector */}
            <Controller
              name="recurrence_type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-1 rounded-lg border p-1 bg-muted/50">
                  {RECURRENCE_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => field.onChange(rt.value)}
                      className={cn(
                        "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        field.value === rt.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              )}
            />

            {/* Interval sub-field */}
            {recurrenceType === "interval" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Every</span>
                <Input
                  type="number"
                  min={2}
                  max={365}
                  className="w-20 h-8 text-center"
                  {...register("recurrence_interval", { valueAsNumber: true })}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            )}

            {/* Weekly day picker */}
            {recurrenceType === "weekly" && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Pick days</p>
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={cn(
                        "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors border",
                        recurrenceDays.includes(idx)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground hover:bg-accent border-border"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly day-of-month picker */}
            {recurrenceType === "monthly" && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">On day of month</p>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        // Monthly: single day selection
                        const current = recurrenceDays;
                        setValue(
                          "recurrence_days",
                          current.includes(day) ? [] : [day]
                        );
                      }}
                      className={cn(
                        "rounded-md py-1 text-xs font-medium transition-colors border",
                        recurrenceDays.includes(day)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground hover:bg-accent border-border"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update"
                  : "Add Todo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
