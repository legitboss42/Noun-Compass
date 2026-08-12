export function hasDedicatedReengagementUnsubscribeSecret(environment: Record<string, string | undefined>) {
  return Boolean(environment.UNSUBSCRIBE_SECRET?.trim());
}
