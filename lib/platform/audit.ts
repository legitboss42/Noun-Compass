import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const SECRET_KEY_PATTERN =
  /(password|secret|token|authorization|cookie|card|cvv|access[_-]?key|service[_-]?role)/i;

export function sanitiseAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitiseAuditValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SECRET_KEY_PATTERN.test(key))
      .map(([key, nestedValue]) => [key, sanitiseAuditValue(nestedValue)]),
  );
}
type AuditEntry = {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  reason?: string | null;
  previousState?: unknown;
  resultingState?: unknown;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(entry: AuditEntry) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");

  const { error } = await admin.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.targetType,
    entity_id: entry.targetId ?? null,
    reason: entry.reason?.slice(0, 1000) || null,
    previous_state: sanitiseAuditValue(entry.previousState ?? null),
    resulting_state: sanitiseAuditValue(entry.resultingState ?? null),
    details: sanitiseAuditValue(entry.metadata ?? {}),
  });
  if (error) throw new Error(`Audit log could not be written: ${error.message}`);
}
