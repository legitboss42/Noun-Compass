import { scoreIssue } from "./utils.mjs";

export function runAdSenseAndCroCheck(crawlResult) {
  const issues = [];
  const adsenseChecks = [];
  const croRecommendations = [];
  const requiredPages = ["/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"];
  const urls = new Set(crawlResult.pages.map((page) => new URL(page.url).pathname));

  for (const pagePath of requiredPages) {
    const present = urls.has(pagePath);
    adsenseChecks.push({ page: pagePath, present });
    if (!present) {
      issues.push(scoreIssue("critical", "adsense", `Required trust page is missing: ${pagePath}`));
    }
  }

  const thinPages = crawlResult.pages.filter((page) => page.ok && page.headings.length < 2 && page.description.length < 80);
  if (thinPages.length) {
    issues.push(scoreIssue("medium", "adsense", "Some pages appear thin or under-explained", { urls: thinPages.slice(0, 10).map((page) => page.url) }));
  }

  const pagesWithoutClearNextStep = crawlResult.pages.filter(
    (page) => page.ok && !page.internalLinks.some((href) => /contact|fees|tools|admission|student-guides/.test(href)),
  );
  if (pagesWithoutClearNextStep.length) {
    croRecommendations.push("Add stronger internal CTAs from informational pages to tools, fee pages, and contact paths.");
  }

  croRecommendations.push("Place monetization after core explanations, not above the fold on trust-critical pages.");
  croRecommendations.push("Use intent-matched callouts on high-value pages like fees, admission, results, and portal guides.");
  croRecommendations.push("Strengthen lead capture with clear help offers on pages where students are likely to get stuck.");

  return {
    adsenseChecks,
    croRecommendations,
    issues,
  };
}
