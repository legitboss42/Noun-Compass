import { isPlausibleCourseCode, normalizeCourseCode } from "./course-codes";

export type QuestionImportRow = {
  courseCode: string;
  topic: string;
  learningObjective: string;
  difficulty: 1 | 2 | 3;
  sample: boolean;
  sourceUnit: string;
  sourcePage: string | null;
  prompt: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correctLabel: "A" | "B" | "C" | "D";
  explanation: string;
};

function splitCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += char;
  }
  values.push(value.trim());
  return values;
}

const requiredHeaders = [
  "course_code",
  "topic",
  "learning_objective",
  "difficulty",
  "sample",
  "source_unit",
  "source_page",
  "prompt",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_label",
  "explanation",
];

export function parseQuestionCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const errors: string[] = [];
  if (lines.length < 2) return { rows: [] as QuestionImportRow[], errors: ["CSV must contain a header and at least one question."] };
  if (lines.length > 501) return { rows: [] as QuestionImportRow[], errors: ["Import at most 500 questions at a time."] };

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  for (const header of requiredHeaders) if (!headers.includes(header)) errors.push(`Missing required header: ${header}`);
  if (errors.length) return { rows: [] as QuestionImportRow[], errors };

  const seenPrompts = new Set<string>();
  const rows: QuestionImportRow[] = [];
  lines.slice(1).forEach((line, offset) => {
    const rowNumber = offset + 2;
    const values = splitCsvLine(line);
    const get = (name: string) => values[headers.indexOf(name)]?.trim() ?? "";
    const courseCode = normalizeCourseCode(get("course_code"));
    const difficulty = Number(get("difficulty"));
    const sampleValue = get("sample").toLowerCase();
    const correctLabel = get("correct_label").toUpperCase();
    const prompt = get("prompt");
    const explanation = get("explanation");
    const normalizedPrompt = prompt.toLowerCase().replace(/\s+/g, " ").trim();
    const options = (["A", "B", "C", "D"] as const).map((label) => ({ label, text: get(`option_${label.toLowerCase()}`) }));

    if (!isPlausibleCourseCode(courseCode)) errors.push(`Row ${rowNumber}: invalid course_code.`);
    if (get("topic").length < 2) errors.push(`Row ${rowNumber}: topic is required.`);
    if (get("learning_objective").length < 5) errors.push(`Row ${rowNumber}: learning_objective is too short.`);
    if (![1, 2, 3].includes(difficulty)) errors.push(`Row ${rowNumber}: difficulty must be 1, 2, or 3.`);
    if (!["true", "false", "yes", "no", "1", "0"].includes(sampleValue)) errors.push(`Row ${rowNumber}: sample must be true or false.`);
    if (!get("source_unit")) errors.push(`Row ${rowNumber}: source_unit is required.`);
    if (prompt.length < 12) errors.push(`Row ${rowNumber}: prompt must contain at least 12 characters.`);
    if (options.some((option) => !option.text)) errors.push(`Row ${rowNumber}: four answer options are required.`);
    if (!["A", "B", "C", "D"].includes(correctLabel)) errors.push(`Row ${rowNumber}: correct_label must be A, B, C, or D.`);
    if (explanation.length < 20) errors.push(`Row ${rowNumber}: explanation must contain at least 20 characters.`);
    if (seenPrompts.has(normalizedPrompt)) errors.push(`Row ${rowNumber}: duplicate prompt in this import.`);
    seenPrompts.add(normalizedPrompt);

    rows.push({
      courseCode,
      topic: get("topic"),
      learningObjective: get("learning_objective"),
      difficulty: (difficulty || 1) as 1 | 2 | 3,
      sample: ["true", "yes", "1"].includes(sampleValue),
      sourceUnit: get("source_unit"),
      sourcePage: get("source_page") || null,
      prompt,
      options,
      correctLabel: (correctLabel || "A") as "A" | "B" | "C" | "D",
      explanation,
    });
  });

  return { rows, errors };
}

