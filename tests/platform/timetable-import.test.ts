import assert from "node:assert/strict";
import test from "node:test";
import { parseTimetableCsv } from "../../lib/platform/timetable-import";

test("valid timetable CSV is normalized", () => {
  const result = parseTimetableCsv("course_code,course_title,exam_date,starts_at,venue\ngst 101,English,2026-10-01,08:30,Lagos");
  assert.deepEqual(result.errors, []);
  assert.equal(result.rows[0].courseCode, "GST101");
});

test("duplicates and malformed dates are rejected", () => {
  const result = parseTimetableCsv("course_code,course_title,exam_date,starts_at,venue\nGST101,English,01/10/2026,8:30,Lagos\nGST101,English,2026-10-01,08:30,Lagos");
  assert.equal(result.errors.length, 3);
});
