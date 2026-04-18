"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAppStore } from "@/stores/app-store";
import {
  getGuestLastPromptDate,
  updateGuestLastPromptDate,
} from "@/lib/guest-storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GuestSignupPrompt() {
  const [open, setOpen] = useState(false);
  const isGuestMode = useAppStore((s) => s.isGuestMode);
  const router = useRouter();

  useEffect(() => {
    if (!isGuestMode) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const lastPrompt = getGuestLastPromptDate();

    if (lastPrompt !== today) {
      // Small delay so it doesn't pop up immediately on page load
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isGuestMode]);

  const handleSignUp = () => {
    setOpen(false);
    router.push("/login");
  };

  const handleDismiss = () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      updateGuestLastPromptDate(today);
    } catch (error) {
      console.error("Failed to update last prompt date:", error);
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your data is only on this device</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;re using BetterMe as a guest. Your habits and progress are
            saved in this browser only — clearing your data or switching devices
            will lose everything. Sign up to keep your data safe in the cloud.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>
            Remind me tomorrow
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSignUp}>
            Sign up now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
