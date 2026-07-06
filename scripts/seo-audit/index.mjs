import path from "node:path";
import { REPORTS_DIR, TARGET_URL } from "./config.mjs";
import { runAdSenseAndCroCheck } from "./adsense-cro-checker.mjs";
import { runCanonicalCheck } from "./canonical-checker.mjs";
import { crawlSite } from "./crawler.mjs";
import { runLighthouseAudit } from "./lighthouse-audit.mjs";
import { runMetadataCheck } from "./metadata-checker.mjs";
import { runPageSpeedAudit } from "./pagespeed-audit.mjs";
import { generateReports } from "./report-generator.mjs";
import { runRobotsCheck } from "./robots-checker.mjs";
import { runSchemaCheck } from "./schema-checker.mjs";
import { runSearchConsoleAudit } from "./search-console.mjs";
import { runSitemapCheck } from "./sitemap-checker.mjs";
import { ensureDir, scoreIssue, writeJson } from "./utils.mjs";

function collectInternalLinkingIssues(crawl) {
  return crawl.pages
    .filter((page) => page.ok && page.internalLinks.length < 2)
    .map((page) => `${page.url} has weak internal linking in the sampled crawl.`);
}

function collectImageIssues(crawl) {
  return crawl.pages.flatMap((page) =>
    page.images
      .filter((image) => !image.alt || image.loading !== "lazy")
      .map((image) => `${page.url} includes an image with ${!image.alt ? "missing alt text" : "non-lazy loading"}: ${image.src}`),
  );
}

function prioritizeFixes(audit) {
  const allIssues = [...audit.issues]
    .sort((left, right) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[left.severity] - rank[right.severity];
    })
    .map((issue) => `${issue.area}: ${issue.message}`);

  const additional = [
    "Connect the final Search Console property and confirm the service account has property-level access.",
    "Review sampled high-impression, low-CTR pages and rewrite titles/descriptions for stronger click appeal.",
    "Expand thin pages with people-first, original explanations before increasing ad density.",
  ];

  return [...new Set([...allIssues, ...additional])];
}

async function main() {
  const sitemap = await runSitemapCheck(TARGET_URL);
  const robots = await runRobotsCheck(TARGET_URL, sitemap.sitemapUrl);
  const crawl = await crawlSite(TARGET_URL, sitemap.urls);
  const metadata = runMetadataCheck(crawl);
  const canonicals = runCanonicalCheck(crawl);
  const schema = runSchemaCheck(crawl);
  const adsense = runAdSenseAndCroCheck(crawl);
  const pagespeed = await runPageSpeedAudit(TARGET_URL);
  const lighthouse = await runLighthouseAudit(TARGET_URL);
  const searchConsole = await runSearchConsoleAudit(TARGET_URL);

  const issues = [
    ...sitemap.issues,
    ...robots.issues,
    ...metadata.issues,
    ...canonicals.issues,
    ...schema.issues,
    ...adsense.issues,
    ...(pagespeed.issues ?? []),
    ...(lighthouse.issues ?? []),
  ];

  if (!searchConsole.ok && !searchConsole.skipped) {
    issues.push(scoreIssue("high", "search-console", "Search Console API connection failed", { error: searchConsole.error }));
  }

  const audit = {
    targetUrl: TARGET_URL,
    sitemap,
    robots,
    crawl,
    metadata,
    canonicals,
    schema,
    adsense,
    pagespeed,
    lighthouse,
    searchConsole,
    internalLinkingIssues: collectInternalLinkingIssues(crawl),
    imageIssues: collectImageIssues(crawl),
    issues,
  };

  audit.prioritizedFixes = prioritizeFixes(audit);

  await ensureDir(REPORTS_DIR);
  await writeJson(path.join(REPORTS_DIR, "seo-audit-debug.json"), audit);
  const outputs = await generateReports(audit);

  console.log(JSON.stringify({
    targetUrl: TARGET_URL,
    crawledPages: crawl.crawledCount,
    reports: outputs,
    issues: issues.length,
    searchConsoleOk: searchConsole.ok,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
