import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeterministicStudyPlan,
  normalizeStudyPlannerGenerationInput,
  parseAiStudyPlan,
  timeToMinutes,
  type StudyPlannerGenerationInput,
} from "../../lib/platform/study-planner-ai-core";
import type { StudyPlannerCourse } from "../../lib/study-planner-catalog";

const registeredCourses: StudyPlannerCourse[] = [
  {
    code: "GST101",
    title: "Use of English and Communication Skills",
    units: 2,
    materialAvailable: true,
    source: "curriculum",
    faculties: ["General Studies"],
  },
  {
    code: "MTH101",
    title: "Elementary Mathematics I",
    units: 3,
    materialAvailable: true,
    source: "curriculum",
    faculties: ["Sciences"],
  },
];

const rawInput: StudyPlannerGenerationInput = {
  courses: registeredCourses.map((course) => ({ ...course, difficulty: "standard" })),
  days: [
    { day: "Monday", workday: true, startTime: "19:00", hours: 2 },
    { day: "Saturday", workday: false, startTime: "09:00", hours: 2 },
  ],
  studentType: "returning",
  rhythm: "balanced",
  sessionLengthMinutes: 60,
};

test("AI planner accepts only courses registered in the student's dashboard", () => {
  assert.throws(
    () => normalizeStudyPlannerGenerationInput({
      ...rawInput,
      courses: [{
        code: "FAKE999",
        title: "Unknown",
        units: 3,
        materialAvailable: false,
        difficulty: "standard",
      }],
    }, registeredCourses),
    /limited to courses registered/i,
  );
});

test("AI planner requires enough availability to cover every selected course", () => {
  assert.throws(
    () => normalizeStudyPlannerGenerationInput({
      ...rawInput,
      days: [{ day: "Monday", workday: true, startTime: "19:00", hours: 1 }],
    }, registeredCourses),
    /increase your available study hours/i,
  );
});

test("deterministic fallback covers every course without exceeding availability", () => {
  const input = normalizeStudyPlannerGenerationInput(rawInput, registeredCourses);
  const plan = buildDeterministicStudyPlan(input);
  assert.ok(plan.courseBreakdown.every((course) => course.sessions >= 1));
  for (const day of plan.days) {
    const availability = input.days.find((item) => item.day === day.day)!;
    const latest = timeToMinutes(availability.startTime) + availability.hours * 60;
    for (const session of day.sessions) {
      const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(session.end)!;
      const hour = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
      assert.ok((hour * 60) + Number(match[2]) <= latest);
    }
  }
});

test("valid AI JSON is normalized into a saved timetable", () => {
  const input = normalizeStudyPlannerGenerationInput(rawInput, registeredCourses);
  const plan = parseAiStudyPlan(`Reasoning omitted. {"weeklyGoal":"Complete two focused blocks","sessions":[{"day":"Monday","start":"19:00","durationMinutes":60,"courseCode":"GST101","focus":"Active recall","reason":"Start the week steadily"},{"day":"Saturday","start":"09:00","durationMinutes":60,"courseCode":"MTH101","focus":"Worked examples","reason":"Use a flexible morning"}],"recommendations":["Review each block briefly"]}`, input, "test-model");
  assert.equal(plan.generationSource, "ai");
  assert.equal(plan.model, "test-model");
  assert.equal(plan.courseBreakdown.length, 2);
  assert.equal(plan.totalHours, 2);
});

test("AI output is rejected when it overlaps, uses unknown courses, or ignores session length", () => {
  const input = normalizeStudyPlannerGenerationInput(rawInput, registeredCourses);
  assert.throws(() => parseAiStudyPlan(JSON.stringify({
    sessions: [
      { day: "Monday", start: "19:00", durationMinutes: 60, courseCode: "GST101" },
      { day: "Monday", start: "19:30", durationMinutes: 60, courseCode: "MTH101" },
    ],
  }), input, "test-model"), /overlapping/i);
  assert.throws(() => parseAiStudyPlan(JSON.stringify({
    sessions: [
      { day: "Monday", start: "19:00", durationMinutes: 60, courseCode: "GST101" },
      { day: "Saturday", start: "09:00", durationMinutes: 60, courseCode: "FAKE999" },
    ],
  }), input, "test-model"), /unknown course/i);
  assert.throws(() => parseAiStudyPlan(JSON.stringify({
    sessions: [
      { day: "Monday", start: "19:00", durationMinutes: 90, courseCode: "GST101" },
      { day: "Saturday", start: "09:00", durationMinutes: 90, courseCode: "MTH101" },
    ],
  }), input, "test-model"), /selected session length/i);
});
