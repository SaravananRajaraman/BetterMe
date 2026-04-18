"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
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
import { useAddWeight } from "@/hooks/use-weight";
import { cn } from "@/lib/utils";

const UNIT_KEY = "betterme_preferred_weight_unit";

const weightSchema = z.object({
  weight: z.number().positive("Must be positive").max(999, "Too large"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(200).optional(),
});

type WeightFormData = z.infer<typeof weightSchema>;

interface AddWeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getPreferredUnit(): "kg" | "lbs" {
  if (typeof window === "undefined") return "kg";
  return (localStorage.getItem(UNIT_KEY) as "kg" | "lbs") ?? "kg";
}

export function AddWeightDialog({ open, onOpenChange }: AddWeightDialogProps) {
  const [unit, setUnit] = useState<"kg" | "lbs">(getPreferredUnit);
  const addWeight = useAddWeight();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      weight: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const toggleUnit = (u: "kg" | "lbs") => {
    setUnit(u);
    if (typeof window !== "undefined") localStorage.setItem(UNIT_KEY, u);
  };

  const onSubmit = async (data: WeightFormData) => {
    await addWeight.mutateAsync({
      weight: data.weight,
      unit,
      date: data.date,
      notes: data.notes || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Log Weight</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Weight + unit toggle */}
          <div className="space-y-2">
            <Label>Weight</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                className="flex-1"
                {...register("weight", { valueAsNumber: true })}
              />
              {/* Unit toggle */}
              <div className="flex rounded-md border overflow-hidden">
                {(["kg", "lbs"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => toggleUnit(u)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-colors",
                      unit === u
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {errors.weight && (
              <p className="text-xs text-destructive">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. After workout"
              rows={2}
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Log Weight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
