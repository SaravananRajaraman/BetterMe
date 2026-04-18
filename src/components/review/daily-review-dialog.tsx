"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { useTodos } from "@/hooks/use-todos";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export function DailyReviewDialog() {
  const reviewOpen = useAppStore((s) => s.reviewOpen);
  const setReviewOpen = useAppStore((s) => s.setReviewOpen);
  const { data: todos } = useTodos();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const completed = todos?.filter((t) => t.completion && !t.completion.skipped) || [];
  const skipped = todos?.filter((t) => t.completion?.skipped) || [];
  const missed = todos?.filter((t) => !t.completion) || [];
  const total = todos?.length || 0;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const handleSaveReview = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("daily_reviews").upsert(
        {
          user_id: user.id,
          review_date: format(new Date(), "yyyy-MM-dd"),
          completed_count: completed.length,
          missed_count: missed.length,
          skipped_count: skipped.length,
          notes: notes || null,
        },
        { onConflict: "user_id,review_date" }
      );

      if (error) throw error;

      toast.success("Daily review saved!");
      setReviewOpen(false);
      setNotes("");
    } catch (error) {
      toast.error("Failed to save review");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Daily Review</DialogTitle>
          <DialogDescription>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completion rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-bold text-lg">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
              <span className="text-lg font-bold">{completed.length}</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mb-1" />
              <span className="text-lg font-bold">{missed.length}</span>
              <span className="text-xs text-muted-foreground">Missed</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <SkipForward className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1" />
              <span className="text-lg font-bold">{skipped.length}</span>
              <span className="text-xs text-muted-foreground">Skipped</span>
            </div>
          </div>

          {/* Reflection notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Reflection Notes</Label>
            <Textarea
              id="notes"
              placeholder="How was your day? What went well? What can improve?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Skip
            </Button>
            <Button onClick={handleSaveReview} disabled={saving}>
              {saving ? "Saving..." : "Save Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
