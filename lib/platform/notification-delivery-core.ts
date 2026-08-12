export type DeliveryErrorOperation =
  | "candidateSelection"
  | "notificationInsert"
  | "emailedAtUpdate"
  | "emailSend";

export type DeliveryError = {
  operation: DeliveryErrorOperation;
  code: string;
  category: "databaseFailed" | "failed";
};

export type NotificationDeliveryResult = {
  candidates: number;
  emailed: number;
  failed: number;
  deduped: number;
  databaseFailed: number;
  errors: DeliveryError[];
};

export type DeliveryCandidate = { userId: string; email: string | null };

export type NotificationPayload = {
  kind: string;
  title: string;
  body: string;
  actionUrl: string;
};

// Supabase and provider adapters can attach diagnostic fields such as `message`
// alongside `code`. Treat their error values as unknown at this boundary and
// deliberately extract only the safe, structured code below.
type DatabaseError = unknown;

export type NotificationDeliveryDatabase<T extends DeliveryCandidate> = {
  insertNotification(candidate: T, notification: NotificationPayload): Promise<{ error: DatabaseError }>;
  markEmailed(candidate: T): Promise<{ error: DatabaseError; persisted: boolean }>;
};

function safeCode(error: DatabaseError) {
  const record = typeof error === "object" && error !== null ? error as Record<string, unknown> : null;
  const code = typeof record?.code === "string" ? record.code : "database_error";
  return /^[A-Za-z0-9_]{1,48}$/.test(code) ? code : "database_error";
}

export function operationalDatabaseError(
  operation: Exclude<DeliveryErrorOperation, "emailSend">,
  error: DatabaseError,
): DeliveryError {
  return { operation, code: safeCode(error), category: "databaseFailed" };
}

/**
 * Safe audit details for a failed candidate-selection operation. This accepts
 * unknown data because it can be called from an exception boundary, but never
 * carries provider messages, recipient data, or any unrecognised field onward.
 */
export function selectionFailureAuditMetadata(detail: unknown) {
  const record = typeof detail === "object" && detail !== null ? detail as Record<string, unknown> : null;
  return {
    operation: "candidateSelection",
    code: safeCode({ code: record?.code }),
    category: "databaseFailed",
    database_failed: 1 as const,
  };
}

function providerError(): DeliveryError {
  return { operation: "emailSend", code: "provider_failed", category: "failed" };
}

/**
 * Delivers notification-backed email without exposing recipient data in result
 * details. A notification insert claims the daily send; only its unique
 * violation is a benign dedupe. `emailed` means provider acceptance, even when
 * the subsequent emailed_at write cannot be confirmed. That cooldown-persistence
 * failure increments `databaseFailed` separately and never exposes recipient data.
 */
export async function deliverNotificationBatch<T extends DeliveryCandidate>(args: {
  candidates: T[];
  database: NotificationDeliveryDatabase<T>;
  makeNotification(candidate: T): NotificationPayload;
  sendEmail(candidate: T): Promise<void>;
}): Promise<NotificationDeliveryResult> {
  const result: NotificationDeliveryResult = {
    candidates: args.candidates.length,
    emailed: 0,
    failed: 0,
    deduped: 0,
    databaseFailed: 0,
    errors: [],
  };

  for (const candidate of args.candidates) {
    if (!candidate.email) {
      result.failed += 1;
      result.errors.push(providerError());
      continue;
    }

    let insert: { error: DatabaseError };
    try {
      insert = await args.database.insertNotification(candidate, args.makeNotification(candidate));
    } catch (error) {
      result.databaseFailed += 1;
      result.errors.push(operationalDatabaseError("notificationInsert", error as DatabaseError));
      continue;
    }
    if (insert.error) {
      if (safeCode(insert.error) === "23505") {
        result.deduped += 1;
      } else {
        result.databaseFailed += 1;
        result.errors.push(operationalDatabaseError("notificationInsert", insert.error));
      }
      continue;
    }

    try {
      await args.sendEmail(candidate);
      result.emailed += 1;
    } catch {
      result.failed += 1;
      result.errors.push(providerError());
      continue;
    }

    let update: { error: DatabaseError; persisted: boolean };
    try {
      update = await args.database.markEmailed(candidate);
    } catch (error) {
      result.databaseFailed += 1;
      result.errors.push(operationalDatabaseError("emailedAtUpdate", error as DatabaseError));
      continue;
    }
    if (update.error) {
      if (safeCode(update.error) === "23505") {
        result.deduped += 1;
      } else {
        result.databaseFailed += 1;
        result.errors.push(operationalDatabaseError("emailedAtUpdate", update.error));
      }
    } else if (!update.persisted) {
      result.databaseFailed += 1;
      result.errors.push(operationalDatabaseError("emailedAtUpdate", { code: "not_persisted" }));
    }
  }

  return result;
}
