import { runAdSenseAndCroCheck } from "./adsense-cro-checker.mjs";
import { runCanonicalCheck } from "./canonical-checker.mjs";
import { crawlSite } from "./crawler.mjs";
import { runMetadataCheck } from "./metadata-checker.mjs";
import { runPageSpeedAudit } from "./pagespeed-audit.mjs";
import { runRobotsCheck } from "./robots-checker.mjs";
import { runSchemaCheck } from "./schema-checker.mjs";
import { runSearchConsoleAudit } from "./search-console.mjs";
import { runSitemapCheck } from "./sitemap-checker.mjs";

const targetUrl = process.argv.find((argument) => argument.startsWith("http")) || "https://nouncompass.me";
const crawlOnly = process.argv.includes("--crawl-only");
const sitemap = await runSitemapCheck(targetUrl);
const [robots, pagespeed, searchConsole] = await Promise.all([
  runRobotsCheck(targetUrl, sitemap.sitemapUrl),
  crawlOnly ? Promise.resolve({ ok: false, skipped: true, reason: "Crawl-only diagnostic", strategy: {}, issues: [] }) : runPageSpeedAudit(targetUrl),
  crawlOnly ? Promise.resolve({ ok: false, skipped: true, error: null }) : runSearchConsoleAudit(targetUrl),
]);
const crawl = await crawlSite(targetUrl, sitemap.urls);
const checks = [
  runMetadataCheck(crawl),
  runCanonicalCheck(crawl),
  runSchemaCheck(crawl),
  runAdSenseAndCroCheck(crawl),
];
const issues = [
  ...sitemap.issues,
  ...robots.issues,
  ...checks.flatMap((check) => check.issues ?? []),
  ...(pagespeed.issues ?? []),
];

console.log(JSON.stringify({
  targetUrl,
  sitemap: {
    ok: sitemap.ok,
    status: sitemap.status,
    urlCount: sitemap.urls.length,
  },
  robots: {
    ok: robots.ok,
    status: robots.status,
  },
  crawl: {
    pages: crawl.crawledCount,
    failed: crawl.pages
      .filter((page) => !page.ok)
      .map((page) => ({ url: page.url, status: page.status })),
  },
  issues: issues.map((issue) => ({
    severity: issue.severity,
    area: issue.area,
    message: issue.message,
    details: issue.details,
  })),
  pagespeed: {
    ok: pagespeed.ok,
    skipped: pagespeed.skipped,
    reason: pagespeed.reason,
    average: pagespeed.averageScore,
    strategies: Object.fromEntries(
      Object.entries(pagespeed.strategy).map(([strategy, result]) => [
        strategy,
        { score: result.score, categories: result.categories },
      ]),
    ),
  },
  searchConsole: {
    ok: searchConsole.ok,
    skipped: searchConsole.skipped,
    error: searchConsole.error ?? null,
  },
}, null, 2));
