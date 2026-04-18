"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { TodoWithCompletion } from "@/lib/types";
import { toast } from "sonner";

const supabase = createClient();

export function useTodos(date?: string) {
  const today = date || format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["todos", today],
    queryFn: async (): Promise<TodoWithCompletion[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch active todos
      const { data: todos, error: todosError } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (todosError) throw todosError;

      // Fetch user's categories
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      // Fetch completions for today
      const { data: completions, error: compError } = await supabase
        .from("todo_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed_date", today);

      if (compError) throw compError;

      // Merge todos with their categories and completions
      return (todos || []).map((todo) => ({
        ...todo,
        category: categories?.find((c) => c.id === todo.category_id) || null,
        completion:
          completions?.find((c) => c.todo_id === todo.id) || null,
      }));
    },
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      category_id?: string;
      reminder_time?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: todo, error } = await supabase
        .from("todos")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          category_id: data.category_id || null,
          reminder_time: data.reminder_time || null,
        })
        .select("*, category:categories(*)")
        .single();

      if (error) throw error;
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo created!");
    },
    onError: (error) => {
      toast.error("Failed to create todo: " + error.message);
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string | null;
      category_id?: string | null;
      reminder_time?: string | null;
    }) => {
      const { data: todo, error } = await supabase
        .from("todos")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, category:categories(*)")
        .single();

      if (error) throw error;
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo updated!");
    },
    onError: (error) => {
      toast.error("Failed to update todo: " + error.message);
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete todo: " + error.message);
    },
  });
}

export function useToggleCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      todoId,
      completed,
      skipped = false,
    }: {
      todoId: string;
      completed: boolean;
      skipped?: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = format(new Date(), "yyyy-MM-dd");

      if (completed) {
        const { error } = await supabase.from("todo_completions").insert({
          todo_id: todoId,
          user_id: user.id,
          completed_date: today,
          skipped,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("todo_completions")
          .delete()
          .eq("todo_id", todoId)
          .eq("user_id", user.id)
          .eq("completed_date", today);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
