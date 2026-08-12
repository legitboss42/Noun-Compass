# Documentation Status and Historical Snapshot Convention

This index separates current operating guidance from historical evidence. It
exists because an old audit can remain useful without being true of the current
checkout or production deployment.

## Current operating guidance

Use these documents for present-tense procedures, subject to the repository and
production gates they name:

- `platform-operations.md`
- `admin-dashboard.md`
- `credential-register.md`
- `outbound-email.md`
- `ai-feature-safety.md`
- `checkpoint1-production-prerequisites.md`
- `editorial/next-content-backlog.md`
- `.superpowers/sdd/nouncompass-revenue-remediation/checkpoint3-report.md`

Current article disposition and indexation behavior is code-owned by
`lib/editorial-dispositions.ts`, not by an older Markdown inventory.

## Historical snapshot convention

Unless a document explicitly says it is current operating guidance, treat the
following filename families as **historical snapshots captured on their stated
date or phase**:

- files containing `report`, `audit`, `completion`, `inventory`, or `tracker`;
- files beginning with `phase-` or `final-`;
- dated website-status, redesign, launch-readiness, analytics, and production
  reviews;
- plans and specifications under `docs/superpowers/` after their implementation
  session ends.

Historical snapshots may contain route counts, product names, database models,
deployment observations, AdSense assessments, or test results that later
changed. They are evidence of what was observed then, not confirmation of what
is live now. Verify current code, current tests, production deployment, Search
Console, and third-party configuration separately before making a present-tense
claim.

## Editorial truth boundary at Checkpoint 3

- Original article URLs accounted for: **59 of 59**.
- Current URL-level GSC evidence in this checkout: **unavailable/unverified**.
- Articles with repository-recorded source-review fields: **10**.
- Articles currently source-verified in Checkpoint 3: **0**.
- Articles that may be called AdSense-ready from this review: **0**.

The existing MDX `publishedAt` and `updatedAt` fields were not bulk changed.
They remain unverified metadata until an editor completes and records a current
source review.
