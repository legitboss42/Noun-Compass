/**
 * Shared quota arithmetic for the AI features.
 *
 * Every AI feature reserves allowance *before* calling the provider, because a
 * reservation is the only thing that can stop two concurrent requests from
 * spending the same slot. The cost of that ordering is that a request which
 * never produces an answer has already taken the slot, and until now nothing
 * gave it back: one provider outage spent a free account's entire day.
 *
 * So allowance is charged on delivery, not on attempt. A failed request is
 * refunded — but only so far. A provider that returns an empty or unparseable
 * completion has still generated and billed those tokens, so unlimited refunds
 * would mean unlimited spend against a counter that never advances. Each window
 * therefore also carries a small number of extra attempts, and once those are
 * gone the window is closed whatever the outcomes were.
 */

export const USER_ATTEMPT_GRACE = 3;

/**
 * The platform-wide daily cap is a spend ceiling rather than a fairness rule, so
 * it scales with the cap itself instead of taking the per-account constant.
 *
 * Both values are mirrored as defaults on claim_ai_feature_request, so the
 * governed features do not have to send them and a deploy that reaches
 * production ahead of the migration still resolves against the old function.
 */
export function globalAttemptGrace(globalLimit: number) {
  return Math.max(10, Math.round(globalLimit * 0.1));
}

export type QuotaCounts = {
  /** Requests that produced an answer, or are still in flight. */
  chargeable: number;
  /** Every request started in the window, delivered or not. */
  attempts: number;
};

export function withinQuota(counts: QuotaCounts, limit: number, grace = USER_ATTEMPT_GRACE) {
  return counts.chargeable < limit && counts.attempts < limit + grace;
}

/**
 * True when the window is closed only because too much failed. The student's
 * allowance is intact, so saying "you have used it up" would be a lie.
 */
export function blockedByFailures(counts: QuotaCounts, limit: number, grace = USER_ATTEMPT_GRACE) {
  return counts.chargeable < limit && counts.attempts >= limit + grace;
}

export function quotaRejectionMessage(input: {
  userCount: number;
  userLimit: number;
  globalCount: number;
  globalLimit: number;
}) {
  if (input.globalCount >= input.globalLimit) {
    return "AI features have reached today's platform-wide limit. Please try again after midnight Lagos time.";
  }
  if (input.userCount >= input.userLimit) {
    return "Your AI allowance for this feature has been reached. It resets at midnight Lagos time.";
  }
  return "Too many AI requests failed on this account today. Your allowance was not spent on them, so please try again after midnight Lagos time.";
}
