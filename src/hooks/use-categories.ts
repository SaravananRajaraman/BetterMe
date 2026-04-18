"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";
import { getGuestCategories } from "@/lib/guest-storage";

const supabase = createClient();

export function useCategories() {
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useQuery({
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
}
