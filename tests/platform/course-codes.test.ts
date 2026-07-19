import assert from "node:assert/strict";
import test from "node:test";
import { isPlausibleCourseCode, normalizeCourseCode, uniqueCourseCodes } from "../../lib/platform/course-codes";

test("course codes normalize consistently", () => {
  assert.equal(normalizeCourseCode(" gst 101 "), "GST101");
  assert.equal(isPlausibleCourseCode("GST101"), true);
  assert.equal(isPlausibleCourseCode("unknown"), false);
  assert.deepEqual(uniqueCourseCodes(["gst 101", "GST101", "gst107"]), ["GST101", "GST107"]);
});
