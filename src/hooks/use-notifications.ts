"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

const NOTIFICATIONS_KEY = "notifications_enabled";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    setIsEnabled(stored === "true" && Notification.permission === "granted");
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return false;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      toast.error("Please allow notifications in your browser settings");
      return;
    }
    localStorage.setItem(NOTIFICATIONS_KEY, "true");
    setIsEnabled(true);
    toast.success("Notifications enabled!");
  }, [requestPermission]);

  const disable = useCallback(() => {
    localStorage.removeItem(NOTIFICATIONS_KEY);
    setIsEnabled(false);
    toast.success("Notifications disabled");
  }, []);

  return {
    permission,
    isEnabled,
    enable,
    disable,
  };
}


