import { scoreIssue } from "./utils.mjs";

export function runMetadataCheck(crawlResult) {
  const issues = [];
  const findings = [];

  for (const page of crawlResult.pages) {
    if (!page.ok) {
      continue;
    }

    findings.push({
      url: page.url,
      titleLength: page.title.length,
      descriptionLength: page.description.length,
      h1: page.h1,
    });

    if (!page.title) {
      issues.push(scoreIssue("critical", "metadata", "Missing title tag", { url: page.url }));
    } else if (page.title.length < 30 || page.title.length > 65) {
      issues.push(scoreIssue("medium", "metadata", "Title length is outside the ideal range", { url: page.url, title: page.title }));
    }

    if (!page.description) {
      issues.push(scoreIssue("high", "metadata", "Missing meta description", { url: page.url }));
    } else if (page.description.length < 70 || page.description.length > 160) {
      issues.push(scoreIssue("low", "metadata", "Meta description length is outside the ideal range", { url: page.url }));
    }

    if (!page.h1) {
      issues.push(scoreIssue("high", "metadata", "Missing H1", { url: page.url }));
    }
  }

  return { findings, issues };
}
