"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";
import {
  getGuestCategories,
  createGuestCategory,
  updateGuestCategory,
  deleteGuestCategory,
} from "@/lib/guest-storage";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

const supabase = createClient();

export function useCategories() {
  const isGuestMode = useAppStore((s) => s.isGuestMode);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: isGuestMode ? ["guest-categories"] : ["categories"],
    queryFn: async (): Promise<Category[]> => {
      if (isGuestMode) {
        return getGuestCategories();
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Auto-seed default categories for authenticated users who have none
  useEffect(() => {
    if (isGuestMode || query.isLoading || query.data === undefined) return;
    if (query.data.length > 0) return;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("categories").insert(
        DEFAULT_CATEGORIES.map((c, i) => ({
          user_id: user.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          is_default: true,
          sort_order: i,
        }))
      );

      queryClient.invalidateQueries({ queryKey: ["categories"] });
    })();
  }, [isGuestMode, query.isLoading, query.data, queryClient]);

  return query;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useMutation({
    mutationFn: async (data: { name: string; color: string; icon: string }) => {
      if (isGuestMode) {
        return createGuestCategory(data);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: categories } = await supabase
        .from("categories")
        .select("sort_order")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (categories?.[0]?.sort_order ?? -1) + 1;

      const { data: category, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: data.name,
          color: data.color,
          icon: data.icon,
          is_default: false,
          sort_order: nextOrder,
        })
        .select("*")
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-categories"] : ["categories"],
      });
      toast.success("Category created!");
    },
    onError: (error: Error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      color?: string;
      icon?: string;
    }) => {
      if (isGuestMode) {
        return updateGuestCategory(id, data);
      }

      const { data: category, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-categories"] : ["categories"],
      });
      toast.success("Category updated!");
    },
    onError: (error: Error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuestMode) {
        deleteGuestCategory(id);
        return;
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-categories"] : ["categories"],
      });
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-todos"] : ["todos"],
      });
      toast.success("Category deleted!");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
}
