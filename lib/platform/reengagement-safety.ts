export function hasDedicatedReengagementUnsubscribeSecret(environment: Record<string, string | undefined>) {
  return Boolean(environment.UNSUBSCRIBE_SECRET?.trim());
}

/** Lifecycle sends must never sign an opt-out link with an unrelated service key. */
export function requireDedicatedReengagementUnsubscribeSecret(environment: Record<string, string | undefined>) {
  const secret = environment.UNSUBSCRIBE_SECRET?.trim();
  if (!secret) throw new Error("Re-engagement email is disabled until UNSUBSCRIBE_SECRET is configured.");
  return secret;
}
