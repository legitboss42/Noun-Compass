import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const endpoint = "https://puredu.net/my_fee_analyzer";
const source = JSON.parse(await readFile("data/puredu-curricula.json", "utf8"));
const outputPath = "data/puredu-fee-snapshot.json";
const rawDirectory = ".recovery-sources/puredu-results";
const concurrency = 8;

await mkdir(rawDirectory, { recursive: true });

const decode = (value) => value
  .replace(/&#35;/g, "₦")
  .replace(/&amp;/g, "&")
  .replace(/&#039;|&apos;/g, "'")
  .replace(/&quot;/g, "\"")
  .replace(/<[^>]*>/g, "")
  .trim();

const amount = (value) => Number(value.replace(/[^\d.]/g, "")) || 0;
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function parseResult(html, combo) {
  const rows = [...html.matchAll(/<tr><td[^>]*>(\d+)<\/td><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><td[^>]*>(.*?)<\/td><td>[\s\S]*?<\/td><\/tr>/g)]
    .map((match) => ({
      code: decode(match[2]),
      title: decode(match[3]),
      units: Number(decode(match[4])) || 0,
      status: decode(match[5]),
      courseFee: amount(decode(match[6])),
      examFee: amount(decode(match[7])),
    }));

  const readTotal = (label) => {
    const match = html.match(new RegExp(`${label}:\\s*&#35;([\\d,.]+)`, "i"));
    return match ? amount(match[1]) : 0;
  };

  return {
    ...combo,
    status: rows.length ? "captured" : "empty",
    courses: rows,
    totals: {
      courseFee: readTotal("Total of Course Fee"),
      examFee: readTotal("Total of Exam Fee"),
      semesterFee: readTotal("Semester Fee"),
      allFees: readTotal("Total of All Fees"),
    },
  };
}

async function fetchResult(combo, attempt = 1) {
  const body = new URLSearchParams({
    category: combo.faculty,
    program: combo.program,
    level: combo.level,
    semester: combo.semester,
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
    await writeFile(path.join(rawDirectory, `${slug(combo.program)}-${combo.level}-${combo.semester}.html`), html);
    return parseResult(html, combo);
  } catch (error) {
    if (attempt < 3) return fetchResult(combo, attempt + 1);
    return { ...combo, status: "error", error: String(error), courses: [], totals: { courseFee: 0, examFee: 0, semesterFee: 0, allFees: 0 } };
  }
}

const combinations = source.flatMap((programme) => programme.levels.flatMap((level) => level.semesters.map((semester) => ({
  faculty: programme.faculty,
  program: programme.program,
  level: level.level,
  levelLabel: level.label,
  semester: semester.semester,
  semesterLabel: semester.label,
}))));

const results = [];
let cursor = 0;

async function worker() {
  while (cursor < combinations.length) {
    const combo = combinations[cursor++];
    const result = await fetchResult(combo);
    results.push(result);
    process.stdout.write(`${results.length}/${combinations.length} ${result.status}: ${combo.program} ${combo.level} ${combo.semester}\n`);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

results.sort((a, b) =>
  a.faculty.localeCompare(b.faculty) ||
  a.program.localeCompare(b.program) ||
  a.level.localeCompare(b.level, undefined, { numeric: true }) ||
  a.semester.localeCompare(b.semester, undefined, { numeric: true }));

const captured = results.filter((item) => item.status === "captured");
const snapshot = {
  source: endpoint,
  sourceLabel: "Puredu NOUN Fee Analyzer",
  retrievedAt: new Date().toISOString(),
  disclaimer: "Third-party Puredu snapshot. Confirm all amounts on the official NOUN student portal before payment.",
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
