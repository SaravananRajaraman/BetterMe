"use client";

import { useForm } from "react-hook-form";
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

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  category_id: z.string().optional(),
  reminder_time: z.string().optional(),
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
    formState: { errors, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      reminder_time: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingTodo) {
      setValue("title", editingTodo.title);
      setValue("description", editingTodo.description || "");
      setValue("category_id", editingTodo.category_id || "");
      setValue("reminder_time", editingTodo.reminder_time || "");
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

  const onSubmit = async (data: TodoFormData) => {
    if (isEditing && editTodoId) {
      await updateTodo.mutateAsync({
        id: editTodoId,
        title: data.title,
        description: data.description || null,
        category_id: data.category_id || null,
        reminder_time: data.reminder_time || null,
      });
    } else {
      await createTodo.mutateAsync({
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        reminder_time: data.reminder_time,
      });
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
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
