import { mkdir, writeFile } from "node:fs/promises";

const sources = [
  ["Agriculture", "https://nou.edu.ng/ecourseware-faculty-of-agric/"],
  ["Arts", "https://nou.edu.ng/ecourseware-faculty-of-arts/"],
  ["Computing", "https://nou.edu.ng/ecourseware-faculty-of-computing-2/"],
  ["Education", "https://nou.edu.ng/ecourseware-faculty-of-edu/"],
  ["General Studies", "https://nou.edu.ng/ecourseware-degs/"],
  ["Health Sciences", "https://nou.edu.ng/ecourseware-faculty-of-health-sc/"],
  ["Law", "https://nou.edu.ng/ecourseware-faculty-of-law/"],
  ["Management Sciences", "https://nou.edu.ng/ecourseware-faculty-of-management-sc/"],
  ["Sciences", "https://nou.edu.ng/ecourseware-faculty-of-sciences/"],
  ["Social Sciences", "https://nou.edu.ng/ecourseware-faculty-of-social-sc/"],
];

const outputPath = "data/official-course-materials.json";
const rawDirectory = ".recovery-sources/official-courseware";
await mkdir(rawDirectory, { recursive: true });

const decode = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&#039;|&apos;/g, "'")
  .replace(/&quot;/g, "\"")
  .replace(/&#8211;|&ndash;/g, "–")
  .replace(/&#8212;|&mdash;/g, "—")
  .replace(/<[^>]*>/g, "")
  .replace(/\s+/g, " ")
  .trim();

const normalizeCode = (value) => decode(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
const absoluteUrl = (value) => new URL(value, "https://nou.edu.ng").toString();

function parseRows(html, sourceFaculty, sourceUrl) {
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].flatMap((rowMatch) => {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
    if (cells.length < 2) return [];
    const link = cells[1].match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link || !link[1].includes("coursewarecontent")) return [];
    const code = normalizeCode(cells[0]);
    if (!code) return [];
    return [{
      code,
      displayCode: decode(cells[0]),
      title: decode(link[2]),
      url: absoluteUrl(link[1]),
      creditUnits: decode(cells[2] ?? ""),
      level: decode(cells[3] ?? ""),
      semester: decode(cells[4] ?? ""),
      faculty: decode(cells[5] ?? "") || sourceFaculty,
      sourceFaculty,
      sourceUrl,
    }];
  });
}

const entries = [];
for (const [faculty, url] of sources) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const html = await response.text();
  await writeFile(`${rawDirectory}/${faculty.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`, html);
  const rows = parseRows(html, faculty, url);
  entries.push(...rows);
  console.log(`${faculty}: ${rows.length} official material rows`);
}

const deduplicated = [...new Map(entries.map((entry) => [`${entry.code}|${entry.url}`, entry])).values()]
  .sort((a, b) => a.code.localeCompare(b.code) || a.title.localeCompare(b.title));

const snapshot = {
  source: "https://nou.edu.ng/ecourseware/",
  sourceLabel: "Official NOUN eCourseware",
  retrievedAt: new Date().toISOString(),
  disclaimer: "Links point to official NOUN-hosted eCourseware. NOUN Compass does not host or reproduce these course materials.",
  stats: {
    sourcePages: sources.length,
    rows: entries.length,
    uniqueMaterials: deduplicated.length,
    uniqueCourseCodes: new Set(deduplicated.map((entry) => entry.code)).size,
  },
  materials: deduplicated,
};

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${outputPath}`, snapshot.stats);
