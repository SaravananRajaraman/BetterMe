"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function GuestModeProvider() {
  const setGuestMode = useAppStore((s) => s.setGuestMode);

  useEffect(() => {
    const isGuest = document.cookie
      .split(";")
      .some((c) => c.trim() === "guest_mode=true");
    setGuestMode(isGuest);
  }, [setGuestMode]);

  return null;
}
