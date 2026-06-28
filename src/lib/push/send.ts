import webpush from "web-push";
import type { PushSubscription as DbPushSubscription } from "@/lib/types";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export type PushResult = "sent" | "gone" | "error";

/**
 * Deliver a push to a single subscription. Returns `"gone"` when the push
 * service reports the subscription is no longer valid (HTTP 404/410), so the
 * caller can prune the stale row.
 */
export async function sendPush(
  sub: Pick<DbPushSubscription, "endpoint" | "keys_p256dh" | "keys_auth">,
  payload: PushPayload
): Promise<PushResult> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
      },
      JSON.stringify(payload)
    );
    return "sent";
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) return "gone";
    return "error";
  }
}
