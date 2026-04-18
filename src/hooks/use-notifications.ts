"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
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

  const subscribe = useCallback(async () => {
    try {
      const granted = await requestPermission();
      if (!granted) return false;

      const registration = await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn("VAPID public key not configured");
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      // Save subscription to database
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const subJson = subscription.toJSON();
      const p256dh = subJson.keys?.p256dh;
      const auth = subJson.keys?.auth;

      if (!p256dh || !auth) {
        toast.error("Failed to enable notifications: invalid subscription keys");
        return false;
      }

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys_p256dh: p256dh,
          keys_auth: auth,
        },
        { onConflict: "user_id,endpoint" }
      );

      if (error) throw error;

      setIsSubscribed(true);
      toast.success("Notifications enabled!");
      return true;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications");
      return false;
    }
  }, [requestPermission]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("endpoint", subscription.endpoint);
        }
      }

      setIsSubscribed(false);
      toast.success("Notifications disabled");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable notifications");
    }
  }, []);

  return {
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}
