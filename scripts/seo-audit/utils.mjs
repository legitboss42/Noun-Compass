import fs from "node:fs/promises";
import path from "node:path";

export function normalizeUrl(value, base) {
  try {
    const url = new URL(value, base);
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function isLocalTarget(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "localhost"
      || hostname === "127.0.0.1"
      || hostname === "::1"
      || hostname.endsWith(".local");
  } catch {
    return false;
  }
}

export function sameOrigin(left, right) {
  try {
    return new URL(left).origin === new URL(right).origin;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function writeText(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data, "utf8");
}

export function decodePrivateKey(value) {
  return value?.replace(/\\n/g, "\n") ?? "";
}

export function scoreIssue(severity, area, message, details = {}) {
  return { severity, area, message, details };
}

export function groupIssues(issues) {
  return {
    critical: issues.filter((issue) => issue.severity === "critical"),
    high: issues.filter((issue) => issue.severity === "high"),
    medium: issues.filter((issue) => issue.severity === "medium"),
    low: issues.filter((issue) => issue.severity === "low"),
  };
}

export async function fetchText(url, init = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      text: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function summarizeList(items, max = 10) {
  return items.slice(0, max);
}

export function average(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function median(numbers) {
  const valid = numbers.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!valid.length) {
    return null;
  }
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 === 0 ? (valid[mid - 1] + valid[mid]) / 2 : valid[mid];
}

export function parseXmlLocs(xmlText) {
  return [...xmlText.matchAll(/<loc>(.*?)<\/loc>/gsi)].map((match) => match[1].trim());
}

export function parseRobotsDirectives(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const directives = [];
  for (const line of lines) {
    if (!line || line.startsWith("#")) {
      continue;
    }
    const [key, ...rest] = line.split(":");
    if (!key || !rest.length) {
      continue;
    }
    directives.push({ key: key.trim().toLowerCase(), value: rest.join(":").trim() });
  }
  return directives;
}
