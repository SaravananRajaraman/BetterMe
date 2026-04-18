"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function GuestModeProvider() {
  const setGuestMode = useAppStore((s) => s.setGuestMode);

  useEffect(() => {
    const isGuest = document.cookie
      .split(";")
      .some((c) => {
        const [key, val] = c.trim().split("=");
        return key === "guest_mode" && val === "true";
      });
    setGuestMode(isGuest);
  }, [setGuestMode]);

  return null;
}
