import type { ContentStatus } from "./types";

export function requireActionConfirmation(actual: string, expected: string) {
  if (actual.trim() !== expected) {
    throw new Error(`Type ${expected} exactly to confirm this action.`);
  }
}
export function requireAdminReason(reason: string) {
  const normalised = reason.trim();
  if (normalised.length < 5) {
    throw new Error("Add a clear reason with at least 5 characters.");
  }
  return normalised.slice(0, 1000);
}

export function calculateExtendedMembershipEnd(
  currentEnd: string | null,
  days: number,
  now = new Date(),
) {
  if (!Number.isInteger(days) || days < 1 || days > 730) {
    throw new Error("Membership extension must be between 1 and 730 days.");
  }
  const current = currentEnd ? new Date(currentEnd) : now;
  const base = Number.isNaN(current.getTime()) || current < now ? now : current;
  return new Date(base.getTime() + days * 86_400_000).toISOString();
}

export function canRemoveSuperAdmin({
  actorId,
  targetId,
  superAdminCount,
}: {
  actorId: string;
  targetId: string;
  superAdminCount: number;
}) {
  return actorId !== targetId && superAdminCount > 1;
}

export function isQuestionStatusTransitionAllowed(
  current: ContentStatus,
  next: ContentStatus,
) {
  return (
    (current === "draft" && next === "review") ||
    (current === "review" && next === "published") ||
    (current === "published" && next === "retired")
  );
}

const supportTransitions: Record<string, readonly string[]> = {
  open: ["in-progress", "waiting-on-student", "resolved", "closed"],
  "in-progress": ["waiting-on-student", "resolved", "closed"],
  "waiting-on-student": ["in-progress", "resolved", "closed"],
  resolved: ["open", "closed"],
  closed: ["open"],
};

export function isSupportStatusTransitionAllowed(current: string, next: string) {
  return supportTransitions[current]?.includes(next) ?? false;
}
