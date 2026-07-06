import { env, PSI_CATEGORIES } from "./config.mjs";
import { average, scoreIssue } from "./utils.mjs";

export async function runPageSpeedAudit(targetUrl) {
  const result = {
    ok: false,
    skipped: false,
    reason: "",
    strategy: {},
    issues: [],
  };

  if (!env.pagespeedApiKey) {
    result.skipped = true;
    result.reason = "Missing PAGESPEED_API_KEY";
    return result;
  }

  for (const strategy of ["mobile", "desktop"]) {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", targetUrl);
    endpoint.searchParams.set("strategy", strategy);
    endpoint.searchParams.set("key", env.pagespeedApiKey);
    for (const category of PSI_CATEGORIES) {
      endpoint.searchParams.append("category", category);
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      result.issues.push(scoreIssue("high", "pagespeed", `PageSpeed API failed for ${strategy}`, { status: response.status }));
      continue;
    }

    const json = await response.json();
    const categories = json?.lighthouseResult?.categories ?? {};
    const metrics = json?.loadingExperience?.metrics ?? {};
    result.strategy[strategy] = {
      score: categories.performance?.score ?? null,
      categories: Object.fromEntries(
        Object.entries(categories).map(([key, value]) => [key, value?.score ?? null]),
      ),
      metrics,
    };
  }

  result.ok = Object.keys(result.strategy).length > 0;

  const mobileScore = result.strategy.mobile?.score;
  if (typeof mobileScore === "number" && mobileScore < 0.5) {
    result.issues.push(scoreIssue("critical", "pagespeed", "Mobile PageSpeed performance is poor", { score: mobileScore }));
  }

  const desktopScore = result.strategy.desktop?.score;
  if (typeof desktopScore === "number" && desktopScore < 0.7) {
    result.issues.push(scoreIssue("medium", "pagespeed", "Desktop PageSpeed performance needs improvement", { score: desktopScore }));
  }

  result.averageScore = average([mobileScore, desktopScore]);
  return result;
}
