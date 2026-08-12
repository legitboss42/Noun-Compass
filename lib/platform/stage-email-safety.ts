import { hasDedicatedReengagementUnsubscribeSecret } from "./reengagement-safety";

export class StageEmailConfigurationError extends Error {
  readonly code = "missing_unsubscribe_secret" as const;

  constructor() {
    super("Stage email delivery blocked: missing_unsubscribe_secret. No notifications were created.");
    this.name = "StageEmailConfigurationError";
  }
}

/**
 * Run this before constructing a notification delivery batch. The callback
 * boundary makes it impossible for callers to start an insert/dedupe mutation
 * before the dedicated unsubscribe secret has been checked.
 */
export async function preflightStageBatch<T>(
  environment: Record<string, string | undefined>,
  startDelivery: () => Promise<T>,
): Promise<T> {
  if (!hasDedicatedReengagementUnsubscribeSecret(environment)) {
    throw new StageEmailConfigurationError();
  }
  return startDelivery();
}
