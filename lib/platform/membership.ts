const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateMembershipEnd(
  paidAt: Date,
  currentEnd: Date | null,
  durationDays = 180,
) {
  const base = currentEnd && currentEnd.getTime() > paidAt.getTime() ? currentEnd : paidAt;
  return new Date(base.getTime() + durationDays * DAY_MS);
}

export function membershipIsActive(status: string | null | undefined, endsAt: string | null | undefined, now = new Date()) {
  if (status !== "active" || !endsAt) return false;
  return new Date(endsAt).getTime() > now.getTime();
}
