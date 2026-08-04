import { google } from "googleapis";
import { env } from "./config.mjs";
import { decodePrivateKey } from "./utils.mjs";

// Standalone Search Console PERFORMANCE report.
// Pulls real clicks/impressions/CTR/position with month-over-month trend.
// Usage: node scripts/seo-audit/performance-report.mjs

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function rows(res, keys) {
  return (res.data.rows ?? []).map((row) => ({
    ...Object.fromEntries(keys.map((k, i) => [k, row.keys?.[i] ?? ""])),
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

function totals(rowset) {
  const clicks = rowset.reduce((s, r) => s + r.clicks, 0);
  const impressions = rowset.reduce((s, r) => s + r.impressions, 0);
  const ctr = impressions ? clicks / impressions : 0;
  const position = rowset.length
    ? rowset.reduce((s, r) => s + r.position * r.impressions, 0) / (impressions || 1)
    : 0;
  return { clicks, impressions, ctr, position };
}

async function main() {
  if (!env.googleClientEmail || !env.googlePrivateKey || !env.gscSiteUrl) {
    console.error("Missing GSC env vars (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY / GSC_SITE_URL).");
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: decodePrivateKey(env.googlePrivateKey),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const sc = google.searchconsole({ version: "v1", auth });
  const siteUrl = env.gscSiteUrl;

  const q = (body) => sc.searchanalytics.query({ siteUrl, requestBody: body });

  // Windows: current 28d, previous 28d, and a 90d window for the growth curve.
  const cur = { startDate: fmt(daysAgo(28)), endDate: fmt(daysAgo(1)) };
  const prev = { startDate: fmt(daysAgo(56)), endDate: fmt(daysAgo(29)) };
  const long = { startDate: fmt(daysAgo(90)), endDate: fmt(daysAgo(1)) };

  const [
    sites,
    curDate, prevDate,
    byDate90,
    topPages, topQueries,
    byDevice, byCountry,
    pageQuery,
  ] = await Promise.all([
    sc.sites.list(),
    q({ ...cur, dimensions: ["date"], rowLimit: 500 }),
    q({ ...prev, dimensions: ["date"], rowLimit: 500 }),
    q({ ...long, dimensions: ["date"], rowLimit: 500 }),
    q({ ...cur, dimensions: ["page"], rowLimit: 100 }),
    q({ ...cur, dimensions: ["query"], rowLimit: 100 }),
    q({ ...cur, dimensions: ["device"], rowLimit: 25 }),
    q({ ...cur, dimensions: ["country"], rowLimit: 25 }),
    q({ ...cur, dimensions: ["page", "query"], rowLimit: 1000 }),
  ]);

  const curT = totals(rows(curDate, ["date"]));
  const prevT = totals(rows(prevDate, ["date"]));
  const pages = rows(topPages, ["page"]);
  const queries = rows(topQueries, ["query"]);
  const pq = rows(pageQuery, ["page", "query"]);

  const pct = (a, b) => (b ? ((a - b) / b) * 100 : a > 0 ? 100 : 0);
  const arrow = (n) => (n > 0 ? "▲" : n < 0 ? "▼" : "•");

  console.log("\n=== NOUN Compass — Search Console Performance ===");
  console.log(`Property: ${siteUrl}`);
  console.log(`Accessible: ${(sites.data.siteEntry ?? []).map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(", ") || "none"}`);
  console.log(`Current window:  ${cur.startDate} → ${cur.endDate}`);
  console.log(`Previous window: ${prev.startDate} → ${prev.endDate}\n`);

  console.log("--- Totals (last 28d vs previous 28d) ---");
  const line = (label, c, p, isPct = false, invert = false) => {
    const change = pct(c, p);
    const v = isPct ? `${(c * 100).toFixed(2)}%` : c.toFixed(isPct ? 2 : c < 100 ? 1 : 0);
    const pv = isPct ? `${(p * 100).toFixed(2)}%` : p.toFixed(isPct ? 2 : p < 100 ? 1 : 0);
    const a = invert ? arrow(-change) : arrow(change);
    console.log(`${label.padEnd(14)} ${String(v).padStart(9)}  (prev ${pv})  ${a} ${change.toFixed(1)}%`);
  };
  line("Clicks", curT.clicks, prevT.clicks);
  line("Impressions", curT.impressions, prevT.impressions);
  line("CTR", curT.ctr, prevT.ctr, true);
  line("Avg position", curT.position, prevT.position, false, true);

  console.log("\n--- Weekly growth curve (last ~90 days) ---");
  const dr = rows(byDate90, ["date"]).sort((a, b) => a.date.localeCompare(b.date));
  const weeks = {};
  for (const r of dr) {
    const wk = r.date.slice(0, 8) + Math.ceil(Number(r.date.slice(8)) / 7);
    weeks[wk] ??= { start: r.date, clicks: 0, impressions: 0 };
    weeks[wk].clicks += r.clicks;
    weeks[wk].impressions += r.impressions;
  }
  for (const w of Object.values(weeks)) {
    console.log(`week of ${w.start}:  ${String(w.clicks).padStart(5)} clicks  ${String(w.impressions).padStart(7)} impressions`);
  }

  console.log("\n--- Top pages by clicks (28d) ---");
  for (const r of pages.slice(0, 15)) {
    console.log(`${String(r.clicks).padStart(4)}c ${String(r.impressions).padStart(6)}i  pos ${r.position.toFixed(1).padStart(5)}  ${r.page}`);
  }

  console.log("\n--- Top queries by clicks (28d) ---");
  for (const r of [...queries].sort((a, b) => b.clicks - a.clicks).slice(0, 20)) {
    console.log(`${String(r.clicks).padStart(4)}c ${String(r.impressions).padStart(6)}i  pos ${r.position.toFixed(1).padStart(5)}  ctr ${(r.ctr * 100).toFixed(1)}%  ${r.query}`);
  }

  console.log("\n--- Striking distance: queries at position 8–20 (quick wins) ---");
  const striking = queries
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  for (const r of striking) {
    console.log(`pos ${r.position.toFixed(1).padStart(5)}  ${String(r.impressions).padStart(6)}i ${String(r.clicks).padStart(3)}c  ${r.query}`);
  }

  console.log("\n--- High-impression, low-CTR pages (title/meta opportunities) ---");
  const lowCtr = pq
    .filter((r) => r.impressions >= 30 && r.ctr < 0.02 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);
  for (const r of lowCtr) {
    console.log(`${String(r.impressions).padStart(6)}i ctr ${(r.ctr * 100).toFixed(1)}% pos ${r.position.toFixed(1)}  "${r.query}" → ${r.page}`);
  }

  console.log("\n--- By device (28d) ---");
  for (const r of rows(byDevice, ["device"])) {
    console.log(`${r.device.padEnd(8)} ${String(r.clicks).padStart(5)}c ${String(r.impressions).padStart(7)}i  ctr ${(r.ctr * 100).toFixed(1)}%`);
  }

  console.log("\n--- Top countries (28d) ---");
  for (const r of rows(byCountry, ["country"]).slice(0, 8)) {
    console.log(`${r.country.padEnd(6)} ${String(r.clicks).padStart(5)}c ${String(r.impressions).padStart(7)}i`);
  }

  console.log(`\nIndexed/appearing pages (28d): ${pages.length}`);
  console.log("");
}

main().catch((e) => {
  console.error("GSC performance pull failed:", e?.message ?? e);
  process.exit(1);
});
