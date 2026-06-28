"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

const NOTIFICATIONS_KEY = "notifications_enabled";

/** Convert a base64url VAPID public key into the Uint8Array the Push API wants. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  // Back the array with a concrete ArrayBuffer so the type is
  // Uint8Array<ArrayBuffer> — what PushManager.subscribe's BufferSource expects.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Register a Web Push subscription and persist it server-side so the reminder
 * cron can reach this device while the app is closed. Best-effort: failures
 * (e.g. guest mode, no service worker) are swallowed — in-tab reminders still
 * work as a fallback.
 */
async function registerPushSubscription() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }));
    const json = subscription.toJSON();
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });
  } catch (error) {
    console.error("Push subscription failed:", error);
  }
}

/** Tear down the Web Push subscription and remove it server-side. Best-effort. */
async function unregisterPushSubscription() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await fetch("/api/notifications/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  } catch (error) {
    console.error("Push unsubscription failed:", error);
  }
}

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
    await registerPushSubscription();
    localStorage.setItem(NOTIFICATIONS_KEY, "true");
    setIsEnabled(true);
    toast.success("Notifications enabled!");
  }, [requestPermission]);

  const disable = useCallback(async () => {
    await unregisterPushSubscription();
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
