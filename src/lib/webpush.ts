import webpush from "web-push";

function getWebPush() {
  webpush.setVapidDetails(
    "mailto:admin@restaurant.local",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return webpush;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string }
) {
  return getWebPush().sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload)
  );
}

export async function sendBroadcastPush(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string }
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return { succeeded, failed };
}
