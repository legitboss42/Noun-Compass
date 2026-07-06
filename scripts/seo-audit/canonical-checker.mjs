import { normalizeUrl, scoreIssue } from "./utils.mjs";

export function runCanonicalCheck(crawlResult) {
  const issues = [];
  const findings = [];

  for (const page of crawlResult.pages) {
    if (!page.ok) {
      continue;
    }

    const normalizedCanonical = page.canonical ? normalizeUrl(page.canonical, page.url) : "";
    findings.push({
      url: page.url,
      canonical: normalizedCanonical,
    });

    if (!normalizedCanonical) {
      issues.push(scoreIssue("high", "canonical", "Missing canonical tag", { url: page.url }));
    } else if (normalizedCanonical !== page.url) {
      issues.push(scoreIssue("medium", "canonical", "Canonical does not match the crawled URL", { url: page.url, canonical: normalizedCanonical }));
    }
  }

  return { findings, issues };
}
