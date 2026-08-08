import path from "node:path";
import { google } from "googleapis";
import { REPORTS_DIR, TARGET_URL, env } from "./config.mjs";
import { runSitemapCheck } from "./sitemap-checker.mjs";
import { decodePrivateKey, ensureDir, writeJson, writeText } from "./utils.mjs";

const CONCURRENCY = 4;
const INDEXED_STATES = new Set(["Submitted and indexed", "Indexed, not submitted in sitemap"]);

function buildAuth() {
  return new google.auth.JWT({
    email: env.googleClientEmail,
    key: decodePrivateKey(env.googlePrivateKey),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
}

async function inspectUrl(searchconsole, siteUrl, inspectionUrl) {
  try {
    const res = await searchconsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl, siteUrl },
    });
    const r = res.data.inspectionResult?.indexStatusResult ?? {};
    return {
      url: inspectionUrl,
      ok: true,
      verdict: r.verdict ?? "UNKNOWN",
      coverageState: r.coverageState ?? "Unknown",
      robotsTxtState: r.robotsTxtState ?? null,
      indexingState: r.indexingState ?? null,
      pageFetchState: r.pageFetchState ?? null,
      lastCrawlTime: r.lastCrawlTime ?? null,
      googleCanonical: r.googleCanonical ?? null,
      userCanonical: r.userCanonical ?? null,
    };
  } catch (error) {
    return { url: inspectionUrl, ok: false, error: error?.message ?? String(error) };
  }
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function isIndexed(row) {
  return row.ok && (row.verdict === "PASS" || INDEXED_STATES.has(row.coverageState));
}

function canonicalMismatch(row) {
  if (!row.ok || !row.googleCanonical || !row.userCanonical) {
    return false;
  }
  return row.googleCanonical.replace(/\/$/, "") !== row.userCanonical.replace(/\/$/, "");
}

function groupByState(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.ok ? row.coverageState : `API error: ${row.error}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(row);
  }
  return [...map.entries()].sort((left, right) => right[1].length - left[1].length);
}
function renderReport(result) {
  const { siteUrl, targetUrl, total, indexedCount, notIndexedRows, canonicalMismatches, groups } = result;
  const lines = [];
  lines.push("# Index Coverage Report");
  lines.push("");
  lines.push(`- Target: ${targetUrl}`);
  lines.push(`- Search Console property: ${siteUrl}`);
  lines.push(`- URLs inspected: ${total}`);
  lines.push(`- Indexed: ${indexedCount}`);
  lines.push(`- Not indexed: ${total - indexedCount}`);
  lines.push(`- Canonical mismatches (Google chose a different URL): ${canonicalMismatches.length}`);
  lines.push("");
  lines.push("## Coverage States");
  for (const [state, rows] of groups) {
    lines.push(`- ${state}: ${rows.length}`);
  }
  lines.push("");
  lines.push("## Not Indexed URLs (grouped by reason)");
  if (!notIndexedRows.length) {
    lines.push("- Every inspected URL is indexed.");
  } else {
    const notIndexedGroups = groupByState(notIndexedRows);
    for (const [state, rows] of notIndexedGroups) {
      lines.push("");
      lines.push(`### ${state} (${rows.length})`);
      for (const row of rows) {
        const canon = row.googleCanonical && canonicalMismatch(row)
          ? ` — Google canonical: ${row.googleCanonical}`
          : "";
        lines.push(`- ${row.url}${canon}`);
      }
    }
  }
  lines.push("");
  lines.push("## Canonical Mismatches");
  if (!canonicalMismatches.length) {
    lines.push("- None detected.");
  } else {
    for (const row of canonicalMismatches) {
      lines.push(`- ${row.url}`);
      lines.push(`  - Your canonical: ${row.userCanonical}`);
      lines.push(`  - Google canonical: ${row.googleCanonical}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  if (!env.googleClientEmail || !env.googlePrivateKey || !env.gscSiteUrl) {
    console.error("Missing Search Console service account environment variables in .env.local");
    process.exitCode = 1;
    return;
  }

  const siteUrl = env.gscSiteUrl;
  const sitemap = await runSitemapCheck(TARGET_URL);
  const urls = [...new Set(sitemap.urls)];
  if (!urls.length) {
    console.error(`No sitemap URLs found at ${sitemap.sitemapUrl}`);
    process.exitCode = 1;
    return;
  }

  const auth = buildAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const rows = await mapWithConcurrency(urls, CONCURRENCY, (url) => inspectUrl(searchconsole, siteUrl, url));

  const indexedCount = rows.filter(isIndexed).length;
  const notIndexedRows = rows.filter((row) => !isIndexed(row) && row.ok);
  const errorRows = rows.filter((row) => !row.ok);
  const canonicalMismatches = rows.filter(canonicalMismatch);
  const groups = groupByState(rows);

  const result = {
    targetUrl: TARGET_URL,
    siteUrl,
    total: rows.length,
    indexedCount,
    notIndexedRows,
    errorRows,
    canonicalMismatches,
    groups,
    rows,
  };

  await ensureDir(REPORTS_DIR);
  await writeJson(path.join(REPORTS_DIR, "index-coverage-debug.json"), result);
  const reportPath = path.join(REPORTS_DIR, "index-coverage.md");
  await writeText(reportPath, renderReport(result));

  console.log(JSON.stringify({
    siteUrl,
    inspected: rows.length,
    indexed: indexedCount,
    notIndexed: rows.length - indexedCount,
    apiErrors: errorRows.length,
    canonicalMismatches: canonicalMismatches.length,
    report: reportPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
