import { fetchText, parseXmlLocs, scoreIssue } from "./utils.mjs";

export async function runSitemapCheck(targetUrl) {
  const sitemapUrl = new URL("/sitemap.xml", targetUrl).toString();
  const response = await fetchText(sitemapUrl);
  const urls = response.ok ? parseXmlLocs(response.text) : [];
  const issues = [];

  if (!response.ok) {
    issues.push(scoreIssue("critical", "sitemap", `Sitemap request failed with status ${response.status}`, { sitemapUrl }));
  }

  if (response.ok && urls.length === 0) {
    issues.push(scoreIssue("high", "sitemap", "Sitemap returned no URLs", { sitemapUrl }));
  }

  return {
    sitemapUrl,
    status: response.status,
    ok: response.ok,
    urls,
    issues,
  };
}
