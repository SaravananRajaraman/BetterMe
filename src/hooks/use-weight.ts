"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";
import type { WeightEntry } from "@/lib/types";
import {
  getGuestWeightEntries,
  upsertGuestWeightEntry,
  deleteGuestWeightEntry,
} from "@/lib/guest-storage";

const supabase = createClient();

export function useWeightEntries(limit = 90) {
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useQuery({
    queryKey: isGuestMode ? ["guest-weight-entries"] : ["weight-entries"],
    queryFn: async (): Promise<WeightEntry[]> => {
      if (isGuestMode) {
        return getGuestWeightEntries(limit);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLatestWeight() {
  const { data, ...rest } = useWeightEntries(1);
  return { data: data?.[0] ?? null, ...rest };
}

export function useAddWeight() {
  const queryClient = useQueryClient();
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useMutation({
    mutationFn: async (entry: {
      weight: number;
      unit: "kg" | "lbs";
      date: string;
      notes?: string;
    }) => {
      if (isGuestMode) {
        return upsertGuestWeightEntry(entry);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("weight_entries")
        .upsert(
          {
            user_id: user.id,
            weight: entry.weight,
            unit: entry.unit,
            date: entry.date,
            notes: entry.notes ?? null,
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-weight-entries"] : ["weight-entries"],
      });
      toast.success("Weight logged!");
    },
    onError: (error) => {
      toast.error("Failed to log weight: " + error.message);
    },
  });
}

export function useDeleteWeight() {
  const queryClient = useQueryClient();
  const isGuestMode = useAppStore((s) => s.isGuestMode);

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuestMode) {
        deleteGuestWeightEntry(id);
        return;
      }
      const { error } = await supabase
        .from("weight_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isGuestMode ? ["guest-weight-entries"] : ["weight-entries"],
      });
      toast.success("Entry deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });
}
