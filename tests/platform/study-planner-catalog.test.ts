import assert from "node:assert/strict";
import test from "node:test";
import {
  searchStudyPlannerCourses,
  studyPlannerCoursesForCodes,
} from "../../lib/study-planner-catalog";

test("course suggestions prioritize matching course codes", () => {
  const suggestions = searchStudyPlannerCourses("GST10");
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.every((course) => course.code.includes("GST10")));
});

test("registered dashboard codes can be converted into planner courses", () => {
  const courses = studyPlannerCoursesForCodes(["gst101", "GST101", "ZZZ999"]);
  assert.equal(courses.filter((course) => course.code === "GST101").length, 1);
  assert.equal(courses.find((course) => course.code === "ZZZ999")?.title, "Registered course");
});
