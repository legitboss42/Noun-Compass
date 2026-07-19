export type NewsletterSubscription = {
  email: string;
  source: string;
  consentVersion: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const submissionBuckets = new Map<string, number[]>();

export function normalizeNewsletterEmail(value: unknown) {
  if (typeof value !== "string") throw new Error("Enter a valid email address.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !emailPattern.test(email)) throw new Error("Enter a valid email address.");
  return email;
}

export function enforceNewsletterRateLimit(identifier: string, now = Date.now()) {
  const windowMs = 10 * 60 * 1000;
  const attempts = (submissionBuckets.get(identifier) ?? []).filter((attempt) => now - attempt < windowMs);
  if (attempts.length >= 5) throw new Error("Too many signup attempts. Please try again later.");
  attempts.push(now);
  submissionBuckets.set(identifier, attempts);
}

export async function syncSubscriberToBrevo(email: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  if (!apiKey || !Number.isSafeInteger(listId) || listId <= 0) return { configured: false, synced: false };

  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Brevo contact sync failed with status ${response.status}.`);
  return { configured: true, synced: true };
}
