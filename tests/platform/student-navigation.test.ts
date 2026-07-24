import assert from "node:assert/strict";
import test from "node:test";
import { getStudentNavigationKey } from "../../lib/platform/student-navigation";

test("dashboard activates the dashboard mobile nav item", () => {
  assert.equal(getStudentNavigationKey("/dashboard", true), "dashboard");
});

test("practice and public exam-prep routes activate exams", () => {
  assert.equal(getStudentNavigationKey("/dashboard/practice", true), "exams");
  assert.equal(getStudentNavigationKey("/dashboard/practice/session", true), "exams");
  assert.equal(getStudentNavigationKey("/exam-prep/GST101", true), "exams");
});

test("study planner has its own active item", () => {
  assert.equal(getStudentNavigationKey("/tools/study-planner", true), "planner");
});

test("account routes do not swallow the dashboard route", () => {
  assert.equal(getStudentNavigationKey("/dashboard", true), "dashboard");
  assert.equal(getStudentNavigationKey("/dashboard/profile", true), "account");
  assert.equal(getStudentNavigationKey("/membership", true), "account");
});
