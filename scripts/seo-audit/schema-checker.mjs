import { scoreIssue } from "./utils.mjs";

function flattenTypes(node, found = []) {
  if (!node || typeof node !== "object") {
    return found;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      flattenTypes(item, found);
    }
    return found;
  }
  if (node["@type"]) {
    found.push(node["@type"]);
  }
  for (const value of Object.values(node)) {
    flattenTypes(value, found);
  }
  return found;
}

export function runSchemaCheck(crawlResult) {
  const issues = [];
  const findings = [];

  for (const page of crawlResult.pages) {
    if (!page.ok) {
      continue;
    }
    const types = flattenTypes(page.schema).flatMap((value) => Array.isArray(value) ? value : [value]);
    findings.push({
      url: page.url,
      types,
      count: page.schema.length,
    });

    if (!page.schema.length) {
      issues.push(scoreIssue("medium", "schema", "No JSON-LD schema found on page", { url: page.url }));
    }

    if (page.schema.some((entry) => entry?.parseError)) {
      issues.push(scoreIssue("high", "schema", "At least one JSON-LD block could not be parsed", { url: page.url }));
    }
  }

  return { findings, issues };
}
