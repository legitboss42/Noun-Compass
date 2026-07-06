import path from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { LIGHTHOUSE_CATEGORIES, TEMP_DIR } from "./config.mjs";
import { average, ensureDir, scoreIssue } from "./utils.mjs";

export async function runLighthouseAudit(targetUrl) {
  await ensureDir(TEMP_DIR);
  const userDataDir = path.join(TEMP_DIR, "lighthouse-profile");
  await ensureDir(userDataDir);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", `--user-data-dir=${userDataDir}`, "--no-first-run", "--no-default-browser-check"],
  });

  try {
    const runner = await lighthouse(targetUrl, {
      port: chrome.port,
      output: "json",
      onlyCategories: LIGHTHOUSE_CATEGORIES,
      logLevel: "error",
    });

    const categories = runner?.lhr?.categories ?? {};
    const audits = runner?.lhr?.audits ?? {};
    const scores = Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [key, value?.score ?? null]),
    );
    const issues = [];

    if (typeof scores.performance === "number" && scores.performance < 0.5) {
      issues.push(scoreIssue("critical", "lighthouse", "Lighthouse performance score is poor", { score: scores.performance }));
    }

    return {
      ok: true,
      scores,
      averageScore: average(Object.values(scores)),
      coreWebVitals: {
        lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
        cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
        inp: audits["interaction-to-next-paint"]?.displayValue ?? null,
      },
      issues,
    };
  } finally {
    try {
      await chrome.kill();
    } catch (error) {
      if (error?.code !== "EPERM") {
        throw error;
      }
    }
  }
}
