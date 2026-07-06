import { load as loadHtml } from "cheerio";
import { CRAWL_LIMIT } from "./config.mjs";
import { fetchText, normalizeUrl, sameOrigin } from "./utils.mjs";

function extractJsonLd($) {
  return $("script[type='application/ld+json']")
    .map((_, element) => $(element).html()?.trim() ?? "")
    .get()
    .filter(Boolean)
    .map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return { parseError: true, raw: value.slice(0, 500) };
      }
    });
}

export async function crawlSite(targetUrl, sitemapUrls = []) {
  const queue = [...new Set([targetUrl, ...sitemapUrls].filter(Boolean))];
  const visited = new Set();
  const pages = [];

  while (queue.length && pages.length < CRAWL_LIMIT) {
    const current = queue.shift();
    const normalized = normalizeUrl(current, targetUrl);
    if (!normalized || visited.has(normalized) || !sameOrigin(normalized, targetUrl)) {
      continue;
    }

    visited.add(normalized);
    const response = await fetchText(normalized);
    const page = {
      url: normalized,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      title: "",
      description: "",
      h1: "",
      canonical: "",
      robots: "",
      headings: [],
      internalLinks: [],
      images: [],
      schema: [],
    };

    if (response.ok && response.headers["content-type"]?.includes("text/html")) {
      const $ = loadHtml(response.text);
      page.title = $("title").first().text().trim();
      page.description = $("meta[name='description']").attr("content")?.trim() ?? "";
      page.h1 = $("h1").first().text().trim();
      page.canonical = $("link[rel='canonical']").attr("href")?.trim() ?? "";
      page.robots = $("meta[name='robots']").attr("content")?.trim() ?? "";
      page.headings = $("h1, h2, h3").map((_, el) => $(el).text().trim()).get().filter(Boolean);
      page.internalLinks = $("a[href]")
        .map((_, el) => normalizeUrl($(el).attr("href"), normalized))
        .get()
        .filter((href) => href && sameOrigin(href, targetUrl));
      page.images = $("img")
        .map((_, el) => ({
          src: normalizeUrl($(el).attr("src"), normalized),
          alt: $(el).attr("alt")?.trim() ?? "",
          loading: $(el).attr("loading")?.trim() ?? "",
        }))
        .get()
        .filter((image) => image.src);
      page.schema = extractJsonLd($);
    }

    pages.push(page);

    for (const href of page.internalLinks) {
      if (!visited.has(href) && queue.length + pages.length < CRAWL_LIMIT * 3) {
        queue.push(href);
      }
    }
  }

  return {
    crawledCount: pages.length,
    pages,
  };
}
