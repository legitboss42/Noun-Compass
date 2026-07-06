import path from "node:path";
import { REPORTS_DIR } from "./config.mjs";
import { ensureDir, groupIssues, summarizeList, writeText } from "./utils.mjs";

function renderIssueList(items) {
  if (!items.length) {
    return "- None found in this run.";
  }
  return items.map((item) => `- ${item.message}${item.details?.url ? ` (${item.details.url})` : ""}`).join("\n");
}

function renderMetricRows(rows, keyName) {
  if (!rows?.length) {
    return "- No data available.";
  }
  return rows.map((row) => `- ${row.keys[keyName]} | clicks: ${row.clicks} | impressions: ${row.impressions} | ctr: ${(row.ctr * 100).toFixed(2)}% | position: ${row.position.toFixed(2)}`).join("\n");
}

export async function generateReports(audit) {
  await ensureDir(REPORTS_DIR);
  const grouped = groupIssues(audit.issues);
  const debugPath = path.join(REPORTS_DIR, "seo-audit-debug.json");
  const finalPath = path.join(REPORTS_DIR, "final-seo-audit.md");
  const checklistPath = path.join(REPORTS_DIR, "action-checklist.md");
  const summaryPath = path.join(REPORTS_DIR, "client-summary.md");

  const finalReport = `# Final SEO Audit

## Audit Summary
- Target: ${audit.targetUrl}
- Crawled pages: ${audit.crawl.crawledCount}
- Sitemap URLs: ${audit.sitemap.urls.length}
- Lighthouse average score: ${audit.lighthouse?.averageScore ?? "Unavailable"}
- PageSpeed average score: ${audit.pagespeed?.averageScore ?? "Unavailable"}
- Search Console status: ${audit.searchConsole.ok ? "Connected" : audit.searchConsole.skipped ? `Skipped (${audit.searchConsole.reason})` : `Failed (${audit.searchConsole.error})`}

## Critical Issues
${renderIssueList(grouped.critical)}

## High Priority Issues
${renderIssueList(grouped.high)}

## Medium Priority Issues
${renderIssueList(grouped.medium)}

## Low Priority Issues
${renderIssueList(grouped.low)}

## Technical SEO Issues
${renderIssueList(audit.issues.filter((issue) => ["metadata", "canonical", "robots", "sitemap", "schema", "lighthouse", "pagespeed"].includes(issue.area)))}

## Search Console Feedback
- Property: ${audit.searchConsole.siteUrl ?? audit.searchConsole.reason ?? "Unavailable"}
- Accessible properties: ${(audit.searchConsole.accessibleSites ?? []).map((site) => `${site.siteUrl} (${site.permissionLevel})`).join(", ") || "Unavailable"}
- API error: ${audit.searchConsole.error ?? "None"}

## Indexed Pages
${audit.searchConsole.indexedPages?.length ? audit.searchConsole.indexedPages.map((page) => `- ${page}`).join("\n") : "- Not available from this run."}

## Non-Indexed Pages Where Available
${audit.searchConsole.nonIndexedPages?.length ? audit.searchConsole.nonIndexedPages.map((page) => `- ${page}`).join("\n") : "- Search Console API does not expose this directly in the current implementation."}

## Top Pages By Clicks
${renderMetricRows(audit.searchConsole.topPages, "page")}

## Top Queries By Impressions
${renderMetricRows(audit.searchConsole.topQueries, "query")}

## Low CTR Opportunities
${audit.searchConsole.lowCtrOpportunities?.length ? audit.searchConsole.lowCtrOpportunities.map((row) => `- ${row.keys.page} | ${row.keys.query} | ${(row.ctr * 100).toFixed(2)}% CTR | ${row.impressions} impressions`).join("\n") : "- No data available."}

## Pages Ranking Positions 8-20
${audit.searchConsole.positionOpportunities?.length ? audit.searchConsole.positionOpportunities.map((row) => `- ${row.keys.page} | position ${row.position.toFixed(2)} | impressions ${row.impressions}`).join("\n") : "- No data available."}

## Core Web Vitals
- LCP: ${audit.lighthouse.coreWebVitals?.lcp ?? "Unavailable"}
- CLS: ${audit.lighthouse.coreWebVitals?.cls ?? "Unavailable"}
- INP: ${audit.lighthouse.coreWebVitals?.inp ?? "Unavailable"}

## Metadata Issues
${renderIssueList(audit.metadata.issues)}

## Canonical Issues
${renderIssueList(audit.canonicals.issues)}

## Sitemap Issues
${renderIssueList(audit.sitemap.issues)}

## robots.txt Issues
${renderIssueList(audit.robots.issues)}

## Schema Issues
${renderIssueList(audit.schema.issues)}

## Internal Linking Issues
${audit.internalLinkingIssues.length ? audit.internalLinkingIssues.map((item) => `- ${item}`).join("\n") : "- No major internal linking issues detected in the sampled crawl."}

## Image Optimization Issues
${audit.imageIssues.length ? audit.imageIssues.map((item) => `- ${item}`).join("\n") : "- No major image issues detected in the sampled crawl."}

## AdSense Readiness Checks
${audit.adsense.adsenseChecks.map((item) => `- ${item.page}: ${item.present ? "present" : "missing"}`).join("\n")}

## CRO Recommendations
${audit.adsense.croRecommendations.map((item) => `- ${item}`).join("\n")}

## Exact Next.js Implementation Steps
- Tighten page-level metadata in app/**/page.tsx and shared metadata helpers in lib/metadata.ts.
- Fix canonical mismatches in the page metadata layer before scaling content updates.
- Expand thin informational pages with original, first-hand, student-helpful explanations before adding more monetization.
- Keep app/robots.ts and app/sitemap.ts aligned with the live route set and target canonical URLs.
- Improve image loading and sizing on key landing pages using next/image where practical.

## Final Checklist
- [ ] Confirm Search Console property access with the final service account
- [ ] Save secrets only in .env.local
- [ ] Re-run npm run seo:audit:nouncompass
- [ ] Review reports/action-checklist.md
- [ ] Implement the top critical and high-priority fixes
`;

  const checklist = `# Action Checklist

## Top 10 SEO Fixes To Implement
${summarizeList(audit.prioritizedFixes, 10).map((item, index) => `${index + 1}. ${item}`).join("\n")}
`;

  const clientSummary = `# Client Summary

The audit sampled ${audit.crawl.crawledCount} pages on ${audit.targetUrl} and combined crawl checks, Lighthouse, PageSpeed, and Search Console where credentials were available.

The biggest priorities are:
${summarizeList(audit.prioritizedFixes, 5).map((item) => `- ${item}`).join("\n")}
`;

  await writeText(finalPath, finalReport);
  await writeText(checklistPath, checklist);
  await writeText(summaryPath, clientSummary);

  return { debugPath, finalPath, checklistPath, summaryPath };
}
