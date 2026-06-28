import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const checkerUrl = "https://nounupdate.com/fee-check";
const endpoint = "https://nounupdate.com/fee-check-display.php";
const outputPath = "data/nounupdate-fee-snapshot.json";
const rawDirectory = ".recovery-sources/nounupdate-results";
const concurrency = 6;

await mkdir(rawDirectory, { recursive: true });

const decode = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&#039;|&apos;/g, "'")
  .replace(/&quot;/g, "\"")
  .replace(/&mdash;|&#8212;/g, "—")
  .replace(/<[^>]*>/g, "")
  .replace(/\s+/g, " ")
  .trim();

const amount = (value) => Number(value.replace(/[^\d.]/g, "")) || 0;
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function readTotal(html, label) {
  const match = html.match(new RegExp(`${label}[\\s\\S]*?<td[^>]*>([^<]+)<\\/td>`, "i"));
  return match ? amount(decode(match[1])) : 0;
}

function parseResult(html, combination) {
  const rows = [...html.matchAll(
    /<tr class="[^"]*">\s*<td data-label="Code"><strong>(.*?)<\/strong><\/td>\s*<td data-label="Title"[^>]*>(.*?)<\/td>\s*<td data-label="Status">([\s\S]*?)<\/td>\s*<td data-label="Units">(.*?)<\/td>\s*<td data-label="Course Fee"[^>]*>(.*?)<\/td>\s*<td data-label="Exam Fee"[^>]*>(.*?)<\/td>/g,
  )].map((match) => {
    const status = decode(match[3]);
    return {
      code: decode(match[1]),
      title: decode(match[2]),
      units: Number(decode(match[4])) || 0,
      status: status.toLowerCase().startsWith("compulsory") ? "C" : status.toLowerCase().startsWith("elective") ? "E" : status,
      courseFee: amount(decode(match[5])),
      examFee: amount(decode(match[6])),
    };
  });

  return {
    ...combination,
    status: rows.length ? "captured" : "empty",
    courses: rows,
    totals: {
      courseFee: readTotal(html, "Total Course Registration Fees"),
      examFee: readTotal(html, "Total Exam Fees"),
      semesterFee: readTotal(html, "Semester Registration Fees"),
      allFees: readTotal(html, "Grand Total Payable"),
    },
  };
}

async function fetchResult(combination, attempt = 1) {
  const body = new URLSearchParams({
    category: combination.faculty,
    program: combination.program,
    level: combination.level,
    semester: combination.semesterLabel,
    entry_mode: "UTME",
    submit: "Submit",
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    await writeFile(path.join(rawDirectory, `${slug(combination.program)}-${combination.level}-${combination.semester}.html`), html);
    return parseResult(html, combination);
  } catch (error) {
    if (attempt < 3) return fetchResult(combination, attempt + 1);
    return {
      ...combination,
      status: "error",
      error: String(error),
      courses: [],
      totals: { courseFee: 0, examFee: 0, semesterFee: 0, allFees: 0 },
    };
  }
}

const checkerHtml = await (await fetch(checkerUrl)).text();
const dataMatch = checkerHtml.match(/const data = (\{[\s\S]*?\n\});/);
if (!dataMatch) throw new Error("Could not locate NOUN Update programme data.");

const context = {};
vm.createContext(context);
vm.runInContext(`data = ${dataMatch[1]}`, context);

const combinations = Object.entries(context.data).flatMap(([faculty, programmes]) =>
  Object.entries(programmes).flatMap(([program, levels]) =>
    Object.entries(levels).flatMap(([level, semesters]) =>
      Object.keys(semesters).map((semesterLabel) => ({
        faculty,
        program,
        level,
        levelLabel: `${level} level`,
        semester: semesterLabel === "First" ? "1" : semesterLabel === "Second" ? "2" : semesterLabel,
        semesterLabel,
      })),
    ),
  ),
);

const results = [];
let cursor = 0;

async function worker() {
  while (cursor < combinations.length) {
    const combination = combinations[cursor++];
    const result = await fetchResult(combination);
    results.push(result);
    process.stdout.write(`${results.length}/${combinations.length} ${result.status}: ${combination.program} ${combination.level} ${combination.semesterLabel}\n`);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

results.sort((a, b) =>
  a.faculty.localeCompare(b.faculty) ||
  a.program.localeCompare(b.program) ||
  a.level.localeCompare(b.level, undefined, { numeric: true }) ||
  a.semester.localeCompare(b.semester, undefined, { numeric: true }),
);

const captured = results.filter((item) => item.status === "captured");
const snapshot = {
  source: endpoint,
  sourceLabel: "NOUN Update Fee Checker",
  retrievedAt: new Date().toISOString(),
  disclaimer: "Third-party NOUN Update snapshot. Confirm all amounts on the official NOUN student portal before payment.",
  assumptions: "Requests use Normal Entry (UTME) and no matriculation number. Returning-student semester fees may vary by matriculation year.",
  stats: {
    combinations: results.length,
    captured: captured.length,
    empty: results.filter((item) => item.status === "empty").length,
    errors: results.filter((item) => item.status === "error").length,
    courseRows: captured.reduce((sum, item) => sum + item.courses.length, 0),
  },
  results,
};

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${outputPath}`, snapshot.stats);
