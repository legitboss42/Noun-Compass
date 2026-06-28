import { readFile, writeFile } from "node:fs/promises";

const puredu = JSON.parse(await readFile("data/puredu-fee-snapshot.json", "utf8"));
const nounUpdate = JSON.parse(await readFile("data/nounupdate-fee-snapshot.json", "utf8"));
const official = JSON.parse(await readFile("data/official-course-materials.json", "utf8"));

const normalizeCode = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const normalizeTitle = (value) => value.toLowerCase()
  .replace(/\b(i|ii|iii|iv|v)\b/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function similarity(left, right) {
  const a = new Set(normalizeTitle(left).split(" ").filter((word) => word.length > 2));
  const b = new Set(normalizeTitle(right).split(" ").filter((word) => word.length > 2));
  if (!a.size || !b.size) return 0;
  return [...a].filter((word) => b.has(word)).length / Math.max(a.size, b.size);
}

const materialsByCode = new Map();
for (const material of official.materials) {
  const items = materialsByCode.get(material.code) ?? [];
  items.push(material);
  materialsByCode.set(material.code, items);
}

const combinations = new Map();
for (const result of [...puredu.results, ...nounUpdate.results].filter((item) => item.status === "captured")) {
  const key = `${result.faculty}|${result.program}|${result.level}|${result.semester}`;
  if (!combinations.has(key)) combinations.set(key, result);
}

const programmeStats = new Map();
const unmatched = new Map();
let courseRows = 0;
let matchedRows = 0;

for (const result of combinations.values()) {
  const key = `${result.faculty}|${result.program}`;
  const stats = programmeStats.get(key) ?? { faculty: result.faculty, program: result.program, rows: 0, matched: 0 };
  for (const course of result.courses) {
    courseRows++;
    stats.rows++;
    const materials = materialsByCode.get(normalizeCode(course.code)) ?? [];
    const matched = materials.length === 1 || materials.some((material) => similarity(material.title, course.title) >= 0.6);
    if (matched) {
      matchedRows++;
      stats.matched++;
    } else {
      unmatched.set(`${course.code}|${course.title}`, { code: course.code, title: course.title });
    }
  }
  programmeStats.set(key, stats);
}

const programmes = [...programmeStats.values()].sort((a, b) =>
  (a.matched / a.rows) - (b.matched / b.rows) || a.program.localeCompare(b.program),
);

let report = `# Official Course Material Coverage\n\n`;
report += `Generated from captured semester course rows and the official NOUN eCourseware catalogue.\n\n`;
report += `- Official material links: **${official.stats.uniqueMaterials.toLocaleString()}**\n`;
report += `- Official course codes: **${official.stats.uniqueCourseCodes.toLocaleString()}**\n`;
report += `- Captured programme course rows checked: **${courseRows.toLocaleString()}**\n`;
report += `- Rows with verified official material matches: **${matchedRows.toLocaleString()} (${(matchedRows / courseRows * 100).toFixed(1)}%)**\n`;
report += `- Distinct unmatched code/title pairs: **${unmatched.size.toLocaleString()}**\n\n`;
report += `## Lowest-Coverage Programmes\n\n`;
for (const item of programmes.slice(0, 40)) {
  report += `- **${item.program}** (${item.faculty}): ${item.matched}/${item.rows} rows matched (${(item.matched / item.rows * 100).toFixed(1)}%)\n`;
}
report += `\n## Unmatched Course Code and Title Pairs\n\n`;
for (const item of [...unmatched.values()].sort((a, b) => a.code.localeCompare(b.code) || a.title.localeCompare(b.title))) {
  report += `- **${item.code}:** ${item.title}\n`;
}

await writeFile("docs/course-material-coverage.md", report);
console.log({
  officialLinks: official.stats.uniqueMaterials,
  officialCodes: official.stats.uniqueCourseCodes,
  courseRows,
  matchedRows,
  matchRate: `${(matchedRows / courseRows * 100).toFixed(1)}%`,
  unmatchedPairs: unmatched.size,
});
