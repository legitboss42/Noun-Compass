import { fetchText, isLocalTarget, parseRobotsDirectives, scoreIssue } from "./utils.mjs";

export async function runRobotsCheck(targetUrl, sitemapUrl) {
  const robotsUrl = new URL("/robots.txt", targetUrl).toString();
  const response = await fetchText(robotsUrl);
  const directives = response.ok ? parseRobotsDirectives(response.text) : [];
  const issues = [];
  const sitemapDirectives = directives.filter((directive) => directive.key === "sitemap");

  if (!response.ok) {
    issues.push(scoreIssue("critical", "robots", `robots.txt request failed with status ${response.status}`, { robotsUrl }));
  }

  if (response.ok && !sitemapDirectives.length) {
    issues.push(scoreIssue("high", "robots", "robots.txt does not declare a sitemap", { robotsUrl }));
  }

  if (response.ok && sitemapUrl && !isLocalTarget(targetUrl) && !sitemapDirectives.some((directive) => directive.value === sitemapUrl)) {
    issues.push(scoreIssue("medium", "robots", "robots.txt sitemap directive does not match the live sitemap URL", { robotsUrl, sitemapUrl }));
  }

  return {
    robotsUrl,
    status: response.status,
    ok: response.ok,
    directives,
    issues,
  };
}
