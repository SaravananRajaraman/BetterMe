import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

// Configure VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:betterme@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url } = await request.json();

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found" },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: title || "BetterMe",
      body: body || "You have a reminder!",
      url: url || "/dashboard",
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          payload
        )
      )
    );

    // Clean up expired subscriptions
    const expiredIndices = results
      .map((r, i) => (r.status === "rejected" ? i : -1))
      .filter((i) => i !== -1);

    for (const idx of expiredIndices) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("id", subscriptions[idx].id);
    }

    return NextResponse.json({
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: expiredIndices.length,
    });
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
