# SEO/Content Program Design — NOUN Compass
**Date:** 2026-08-05  
**Owner:** Victor Chinukwue  
**Status:** Approved for implementation

## Context

NOUN Compass launched ~7 weeks ago and has initial Search Console traction:
- **50 clicks, 3,896 impressions** in the last 28d (Jul 7 – Aug 3)
- **100 pages indexed** and appearing in search
- **Position ~9 average** — many pages rank near page 1 but don't earn clicks
- **CTR 1.28%** — low for the positions we hold
- **Traffic pattern:** fees/results/NELFUND queries, 88% mobile, 86% Nigeria

The site has strong fundamentals (59 articles averaging 1,200–2,500 words, comprehensive policy pages, functional tools) but faces two blockers:
1. **AdSense rejection** — "low value content" flags prevent monetization via display ads
2. **Striking-distance pages** — several pages rank pos 9–19 but need a push to crack page 1

This design structures a **Heavy ongoing program** (multi-week, weekly micro-ships) to systematically address both blockers and build sustained organic growth.

## Goals & Constraints

**Priority order** (shapes phase sequencing):
1. **C — Striking distance → page 1:** Push pos 9–19 pages onto page 1 where clicks multiply
2. **D — Monetization readiness:** Clear AdSense approval blockers, unlock display-ad revenue
3. **A — CTR harvest:** Rewrite titles/meta for pages that rank but don't earn clicks
4. **B — New content:** Data-driven expansion into proven demand gaps

**Revenue model:** Hybrid dual-funnel
- AdSense on free informational pages (fees, results, portal guides, NELFUND articles)
- Membership upsells on premium tool pages (`/tools/*`, `/practice`, study planner, AI assistant)

**Cadence:** Weekly micro-ships — 2-3 pages/week, measure every 7–10 days, adapt based on GSC data

**Effort budget:** Heavy — ongoing multi-week program with repeatable measurement loops, not a one-off round

**Operating principle:** Delegated execution — Claude pulls GSC data, drafts changes, applies them, verifies, commits, and reports back. User stays in review/approval seat.

## Architecture

### Sequential Phases (C → D → A → B)

The program follows the stated priority order with built-in checkpoints:

**Weeks 1-3:** Phase C (striking distance)  
**Weeks 4-5:** Phase D (AdSense approval readiness)  
**Week 6:** Phase A (CTR harvest batch sweep)  
**Weeks 7+:** Phase B (data-driven content expansion) + ongoing measurement loop

**2-week checkpoint (Week 2 end):** Re-run `performance-report.mjs`. If ≥2 target pages moved up ≥2 positions, continue Phase C. If flat/down, pivot to either deep content rewrites (A-style) or write supporting articles (B task pulled forward).

**Overlap optimization:** `/fees` and `/tools/cgpa-calculator` appear in both Phase C (rankings) and Phase D (approval readiness). The Week 1 content-depth work serves both goals — we do it once, it counts twice.

## Phase C Detail — Striking Distance → Page 1 (Weeks 1-3)

**Thesis:** Pages ranking pos 9–19 are close — small, targeted improvements can crack page 1.

### Target Set (from GSC, ranked by opportunity)

| Page | Query | Impressions (28d) | Position |
|---|---|---|---|
| `/fees` | fees checker | 81 | 9.1 |
| `/tools/cgpa-calculator` | noun cgpa calculator | 23 | 19.3 |
| `how-to-pay-noun-school-fees` | how to pay noun school fees | 19 | 8.7 |
| `how-to-fund-noun-wallet` (article) | how to fund my noun wallet | 16 | 9.4 |
| `/portal` | noun portal | 16 | 11.6 |

### Per-Page Playbook (applied to 2-3 pages/week)

1. **Content depth** — Expand to fully answer the query + adjacent "People Also Ask" questions. Page 1 results typically cover the topic more completely than page 2 ones.

2. **Internal links IN** — Add 2-3 contextual links *from* strong-ranking pages (like `how-to-check-noun-results`, the #1 page with 415 impressions) *to* the target. Link equity flows to the page you're pushing.

3. **Schema** — Add FAQ schema for articles, or the right structured data for tools (SoftwareApplication for `/fees` — already has `toolSchema`, extend pattern to others). Rich results improve CTR *and* signal relevance.

4. **Title/meta** — Front-load exact query, add year/status modifiers (`2026`, `Free`), stay under ~45 chars so it survives the `| NOUN Compass` template suffix without truncating. Already done for `/fees` and `/tools/cgpa-calculator` in the prior round; extend to the rest.

5. **Internal links OUT** — Link from the target to related pages, building topical clusters Google reads as authority.

### Measurement & Checkpoint

**Week 2 end:** Re-run `performance-report.mjs` and apply the decision rule:
- **If ≥2 target pages moved up ≥2 positions** → thesis validated, continue Phase C into Week 3
- **If all pages flat/down** → pivot: the issue isn't proximity. Either do deep content rewrites (A-style quality pass) or pull a B task forward (write the supporting articles these pages need to link to)

This checkpoint is the escape hatch — it prevents committing 3 weeks to a strategy that isn't working.

## Phase D Detail — AdSense Approval Readiness (Weeks 4-5)

**Status:** Account not yet approved; getting "low value content" rejections.

**Goal:** Remove known approval blockers so we can pass review and unlock the AdSense funnel. Ad *placement* design happens *after* approval — no point designing slot positions if the account stays rejected.

### What "Low Value Content" Flags (and how NOUN Compass maps to each)

1. **Thin pages with little unique content**  
   - ✅ **Articles:** 59 total, shortest is 930 words, most are 1,200–2,500 words — good depth  
   - ⚠️ **Tool pages:** `/fees`, `/tools/cgpa-calculator`, `/tools/result-checker`, `/tools/study-planner` are interactive-first with minimal above-the-fold text. To a crawler, that reads thin.

2. **Auto-generated or scraped content**  
   - ⚠️ **NELFUND cluster:** 8 articles; if they share boilerplate structure/intros, can trigger this even when hand-written  
   - ⚠️ **AI templating:** article production tracker shows "AI Images Complete" for 19 Phase 1 articles (images are fine), but if body text also reads AI-templated (repetitive intros, identical structure), that's a flag.

3. **Pages that exist only to show ads** (no genuine utility)  
   - ✅ **Safe:** Tools are functional, articles solve real problems, there's a membership model (proves non-ad intent).

4. **Insufficient unique/valuable content vs ads**  
   - Not yet applicable (no ads placed), but will matter post-approval: if we add 3 ad slots to a 1,000-word article, that's borderline. The Phase C content-depth work directly de-risks this.

### The Week 4-5 Playbook

**Week 4 — Tool-page text expansion**  
Target: `/fees`, `/tools/cgpa-calculator`, `/tools/result-checker`, `/tools/study-planner`

For each:
- Add **300–500 words of explanatory content above the tool** — what it does, why it matters, how to interpret results, common mistakes. This is "first-screen substance" so the crawler sees value before hitting the interactive gate.
- Move the account-gate messaging (`Sign in to build your fee estimate`) **below** that intro text, not immediately after the H1.
- Add a **"How to use this tool"** expandable section below the tool (another 200–300 words) — step-by-step guide, edge cases, disclaimers.

*Why this works:* Google's crawler doesn't interact with the tool. It only sees static HTML. Right now it sees a headline + a sign-in wall. After this, it sees 500+ words of helpful content, then a tool, then another 200 words. That reads substantive.

**Week 5 — NELFUND cluster differentiation audit**  
The 8 NELFUND articles need to feel distinct, not templated.

Actions:
- Read all 8 side-by-side and flag any boilerplate intros/structure
- Rewrite the intros to vary sentence structure, hook, and tone (same info, different voice)
- Ensure each has a unique **first-person student scenario** or concrete example (not generic "students may face…" across all 8)

*Why this works:* Reviewers look for copy-paste patterns. Varying the first 2–3 paragraphs and adding one concrete example per article breaks the template signal.

### Outcome

By end of Week 5, submit for AdSense review with:
- Substantive tool pages that pass the "value without interaction" test
- Differentiated NELFUND articles that don't read auto-generated
- The 59 existing articles (already good depth) as the content foundation

**Ad placement design happens *after* approval.** Once approved, we return to the dual-funnel placement strategy:
- **AdSense on articles:** in-content slots at natural break points (after intro, mid-article, before FAQ), never above H1, fixed-height to protect CLS
- **Membership upsells on tools:** contextual CTAs at usage limits (e.g., "You've used your 3 free CGPA saves — upgrade for unlimited")

**Routing rule (to be enforced post-approval):**
- Article / guide / info page → AdSense funnel, no membership hard-sell
- Tool / practice / AI page → Membership funnel, no AdSense

## Phase A Detail — CTR Harvest (Week 6)

**Context:** By Week 6, you've pushed striking-distance pages onto page 1 (Phase C) and cleared AdSense approval blockers (Phase D). Now harvest clicks from pages that already rank but earn low CTR.

### Target

Pages with ≥20 impressions in the last 28d but CTR <2% and position ≤15 (they're visible, people just aren't clicking).

### The Batch Operation (one sweep, not per-page)

1. Re-run `performance-report.mjs` to pull fresh GSC data
2. Export the "high-impression, low-CTR" list (the script already identifies these)
3. Rewrite titles + meta descriptions for the top 10–15, following the formula:
   - Front-load the exact query
   - Add year/status modifier when relevant (`2026`, `Free`, `Official`)
   - Stay under ~45 chars so the title survives the `| NOUN Compass` suffix
   - Description: include a concrete benefit or outcome in the first clause

### Why Week 6, Not Week 1?

Two reasons:
- The Phase C content-depth work naturally improves some CTRs as a side effect (more complete pages earn more clicks even without title changes). You want to measure *that* lift first, then harvest what's left.
- GSC data lags 2–3 days. By Week 6, you have clean data on what the C-phase changes actually did.

### Effort & Measurement

**Effort:** Batch rewrite — 10–15 title/description pairs in one sitting, ~2–3 hours. Not a weekly cadence; a one-shot sweep.

**Measurement:** Re-check CTR in Week 7's performance report. Expect 20–40% CTR improvement on rewritten pages (e.g., 1.2% → 1.7–2.0%). If a page's CTR stays flat after the rewrite, that's a signal the *content* doesn't match the promise in the title — which feeds into Phase B.

## Phase B + The Measurement Loop (Weeks 7+)

### Phase B — New Content (data-driven expansion)

Not a blind content push — **data-driven expansion**. By Week 7, GSC tells us exactly where demand exists that we're not serving:

- **Query gaps:** search terms showing impressions on pages that don't fully answer them → write the dedicated article
- **Cluster completion:** NELFUND cluster (8 articles) and any topic where you rank for a head term but lack supporting long-tail articles → fill the gaps so internal linking builds topical authority
- **Supporting content for Phase C:** if a striking-distance page stalled because it had nothing authoritative to link to, write that supporting piece

**Cadence:** 1-2 new articles/week, each targeting a query GSC already shows latent demand for. No writing into the void.

### The Measurement Loop (the backbone of the program)

This is what makes it "Heavy/ongoing" rather than a one-off. Every week, same ritual:

1. **Monday:** Run `performance-report.mjs` → pull clicks, impressions, positions, CTR, week-over-week deltas
2. **Read the deltas** against the current phase's success metric:
   - Phase C week → did target pages move up in position?
   - Phase A week → did rewritten pages gain CTR?
   - Phase B week → are new articles getting indexed + earning impressions?
3. **Pick the week's 2-3 targets** based on what the data says needs attention
4. **Execute** (draft → apply → verify → commit)
5. **Report:** a short weekly summary — what shipped, what moved, what's next

**The Monday re-check is already scheduled** (from the first round's task #5 — "Set up 1-week performance re-check").

### Program-Level Success Metrics

How we know it's working over the multi-week arc:

- **Phase C win:** ≥3 target pages reach page 1 (position ≤10) within 3 weeks
- **Phase D win:** AdSense approval granted
- **Phase A win:** overall site CTR rises from 1.28% toward 2.5%+
- **Phase B win:** monthly impressions grow past ~6,000 (from current 3,896) with sustained click growth
- **North star:** monthly clicks from 50 → 150+ within the program's first 8 weeks

### Escape Hatches

- **2-week Phase C checkpoint** — pivot if rankings don't move
- **Weekly data review** — reprioritize if a phase underperforms
- **The C→D→A→B order is a *default*, not a cage** — if AdSense rejection persists, Phase D jumps the queue

## Implementation Transition

This spec is approved. Next step: invoke `writing-plans` skill to create the detailed implementation plan for Week 1 (the first Phase C sprint).

---

**Approved by:** Victor Chinukwue  
**Date:** 2026-08-05
