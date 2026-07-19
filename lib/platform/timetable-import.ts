import { isPlausibleCourseCode, normalizeCourseCode } from "./course-codes";

export type TimetableImportRow = { courseCode: string; courseTitle: string; examDate: string; startsAt: string; venue: string };

export function isOfficialNounSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "nou.edu.ng" || url.hostname.endsWith(".nou.edu.ng"));
  } catch {
    return false;
  }
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let value = ""; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { values.push(value.trim()); value = ""; }
    else value += char;
  }
  values.push(value.trim());
  return values;
}

export function parseTimetableCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const errors: string[] = [];
  if (lines.length < 2) return { rows: [] as TimetableImportRow[], errors: ["CSV must contain a header and at least one row."] };
  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  const required = ["course_code", "course_title", "exam_date", "starts_at", "venue"];
  for (const header of required) if (!headers.includes(header)) errors.push(`Missing required header: ${header}`);
  if (errors.length) return { rows: [] as TimetableImportRow[], errors };
  const seen = new Set<string>();
  const rows: TimetableImportRow[] = [];
  lines.slice(1).forEach((line, offset) => {
    const rowNumber = offset + 2;
    const values = splitCsvLine(line);
    const get = (name: string) => values[headers.indexOf(name)]?.trim() ?? "";
    const courseCode = normalizeCourseCode(get("course_code"));
    const examDate = get("exam_date");
    const startsAt = get("starts_at");
    if (!isPlausibleCourseCode(courseCode)) errors.push(`Row ${rowNumber}: invalid course code.`);
    const parsedDate = new Date(`${examDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== examDate) errors.push(`Row ${rowNumber}: exam_date must be a real date in YYYY-MM-DD format.`);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startsAt)) errors.push(`Row ${rowNumber}: starts_at must be HH:MM in 24-hour time.`);
    if (seen.has(courseCode)) errors.push(`Row ${rowNumber}: duplicate course code ${courseCode}.`);
    seen.add(courseCode);
    rows.push({ courseCode, courseTitle: get("course_title"), examDate, startsAt, venue: get("venue") });
  });
  return { rows, errors };
}
