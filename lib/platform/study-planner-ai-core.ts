import type { StudyPlannerCourse } from "@/lib/study-planner-catalog";

export type StudyCourseDifficulty = "unsure" | "standard" | "challenging";
export type StudyStudentType = "new" | "returning";
export type StudyRhythm = "balanced" | "weekend-heavy" | "short-daily";

export type StudyPlannerSelectedCourse = Pick<
  StudyPlannerCourse,
  "code" | "title" | "units" | "materialAvailable"
> & { difficulty: StudyCourseDifficulty };

export type StudyDayAvailability = {
  day: string;
  workday: boolean;
  startTime: string;
  hours: number;
};

export type StudyPlannerGenerationInput = {
  courses: StudyPlannerSelectedCourse[];
  days: StudyDayAvailability[];
  studentType: StudyStudentType;
  rhythm: StudyRhythm;
  sessionLengthMinutes: number;
};

export type StudyPlannedSession = {
  start: string;
  end: string;
  label: string;
  type: "course" | "buffer";
  course?: StudyPlannerSelectedCourse;
  reason?: string;
};

export type StudyPlanResult = {
  totalHours: number;
  sessionLengthMinutes: number;
  courseBreakdown: Array<StudyPlannerSelectedCourse & { sessions: number; plannedHours: number }>;
  days: Array<{ day: string; workday: boolean; sessions: StudyPlannedSession[] }>;
  notes: string[];
  weeklyGoal: string;
  generationSource: "ai" | "deterministic";
  model?: string;
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALLOWED_SESSION_LENGTHS = [30, 45, 60, 90, 120];

function cleanText(value: unknown, max = 220) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function normalizeCourseCode(value: unknown) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function timeToMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;
  return (hours * 60) + minutes;
}

export function minutesToLabel(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.min((24 * 60) - 1, Math.round(totalMinutes)));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function normalizeStudyPlannerGenerationInput(
  input: StudyPlannerGenerationInput,
  registeredCourses: StudyPlannerCourse[],
): StudyPlannerGenerationInput {
  const registeredByCode = new Map(registeredCourses.map((course) => [normalizeCourseCode(course.code), course]));
  const requestedDifficulties = new Map(
    (Array.isArray(input?.courses) ? input.courses : []).map((course) => [normalizeCourseCode(course.code), course.difficulty]),
  );
  const courses = [...requestedDifficulties.entries()].map(([code, difficulty]) => {
    const course = registeredByCode.get(code);
    if (!course) throw new Error("AI timetable generation is limited to courses registered in your dashboard.");
    return {
      code: course.code,
      title: cleanText(course.title, 180) || "Registered course",
      units: typeof course.units === "number" ? course.units : null,
      materialAvailable: Boolean(course.materialAvailable),
      difficulty: (["unsure", "standard", "challenging"] as const).includes(difficulty as StudyCourseDifficulty)
        ? difficulty as StudyCourseDifficulty
        : "unsure" as const,
    };
  });
  if (!courses.length) throw new Error("Add at least one registered course before generating a timetable.");

  const sourceDays = Array.isArray(input?.days) ? input.days : [];
  const days = WEEKDAYS.map((day) => {
    const source = sourceDays.find((item) => item?.day === day);
    const startTime = typeof source?.startTime === "string" ? source.startTime : "18:00";
    if (!Number.isFinite(timeToMinutes(startTime))) throw new Error(`Choose a valid start time for ${day}.`);
    const hours = Number(source?.hours ?? 0);
    return {
      day,
      workday: Boolean(source?.workday),
      startTime,
      hours: Number.isFinite(hours) ? Math.max(0, Math.min(12, Math.round(hours * 2) / 2)) : 0,
    };
  });
  if (!days.some((day) => day.hours > 0)) throw new Error("Add study availability for at least one day.");

  const sessionLengthMinutes = ALLOWED_SESSION_LENGTHS.includes(Number(input?.sessionLengthMinutes))
    ? Number(input.sessionLengthMinutes)
    : 60;
  const availableSlots = days.reduce(
    (sum, day) => sum + Math.floor((day.hours * 60) / sessionLengthMinutes),
    0,
  );
  if (availableSlots < courses.length) {
    throw new Error("Increase your available study hours so every registered course can receive at least one session.");
  }
  const studentType: StudyStudentType = input?.studentType === "returning" ? "returning" : "new";
  const rhythm: StudyRhythm = (["balanced", "weekend-heavy", "short-daily"] as const).includes(input?.rhythm)
    ? input.rhythm
    : "balanced";
  return { courses, days, studentType, rhythm, sessionLengthMinutes };
}

function difficultyWeight(value: StudyCourseDifficulty) {
  if (value === "challenging") return 1.35;
  if (value === "standard") return 1;
  return 1.05;
}

export function buildDeterministicStudyPlan(input: StudyPlannerGenerationInput): StudyPlanResult {
  const activeDays = input.days
    .map((day) => ({ ...day, slots: Math.floor((day.hours * 60) / input.sessionLengthMinutes) }))
    .filter((day) => day.slots > 0);
  if (!input.courses.length || !activeDays.length) throw new Error("There is not enough course or availability data to build a timetable.");

  const totalSlots = activeDays.reduce((sum, day) => sum + day.slots, 0);
  const reviewSlots = totalSlots > input.courses.length + 1 ? Math.max(1, Math.floor(totalSlots * 0.12)) : 0;
  const studySlots = Math.max(input.courses.length, totalSlots - reviewSlots);
  const weighted = input.courses.map((course) => ({
    ...course,
    weight: (course.units ?? 2) * difficultyWeight(course.difficulty) * (input.studentType === "new" ? 1.05 : 1),
    sessions: 1,
  }));
  for (let assigned = weighted.length; assigned < studySlots; assigned += 1) {
    weighted.sort((left, right) => (right.weight / right.sessions) - (left.weight / left.sessions));
    weighted[0].sessions += 1;
  }

  const rankedDays = [...activeDays].sort((left, right) => {
    if (input.rhythm === "weekend-heavy" && left.workday !== right.workday) return Number(left.workday) - Number(right.workday);
    if (input.rhythm === "short-daily" && left.workday !== right.workday) return Number(right.workday) - Number(left.workday);
    return input.days.findIndex((day) => day.day === left.day) - input.days.findIndex((day) => day.day === right.day);
  });
  const remaining = new Map(weighted.map((course) => [course.code, course.sessions]));
  const planned = new Map(input.days.map((day) => [day.day, { day: day.day, workday: day.workday, sessions: [] as StudyPlannedSession[] }]));
  let previousCode = "";
  let remainingReview = reviewSlots;

  for (const day of rankedDays) {
    let currentMinutes = timeToMinutes(day.startTime);
    const dayEndMinutes = currentMinutes + (day.hours * 60);
    for (let slot = 0; slot < day.slots; slot += 1) {
      if (currentMinutes + input.sessionLengthMinutes > dayEndMinutes) break;
      const candidates = weighted
        .filter((course) => (remaining.get(course.code) ?? 0) > 0)
        .sort((left, right) => (remaining.get(right.code) ?? 0) - (remaining.get(left.code) ?? 0));
      const chosen = candidates.find((course) => course.code !== previousCode) ?? candidates[0];
      if (!chosen && remainingReview > 0) {
        planned.get(day.day)?.sessions.push({
          start: minutesToLabel(currentMinutes),
          end: minutesToLabel(currentMinutes + input.sessionLengthMinutes),
          label: "Weekly review and catch-up",
          type: "buffer",
          reason: "Keeps unfinished work from disrupting the next study week.",
        });
        remainingReview -= 1;
        currentMinutes += input.sessionLengthMinutes;
        continue;
      }
      if (!chosen) continue;
      planned.get(day.day)?.sessions.push({
        start: minutesToLabel(currentMinutes),
        end: minutesToLabel(currentMinutes + input.sessionLengthMinutes),
        label: `${chosen.code}: focused reading and active recall`,
        type: "course",
        course: chosen,
        reason: chosen.difficulty === "challenging" ? "Extra attention for a challenging course." : "Balanced weekly course coverage.",
      });
      remaining.set(chosen.code, (remaining.get(chosen.code) ?? 1) - 1);
      previousCode = chosen.code;
      currentMinutes += input.sessionLengthMinutes;
    }
  }

  const resultDays = input.days.map((day) => planned.get(day.day) ?? { day: day.day, workday: day.workday, sessions: [] });
  const directSessions = resultDays.flatMap((day) => day.sessions).filter((session) => session.course);
  return {
    totalHours: Number(((resultDays.flatMap((day) => day.sessions).length * input.sessionLengthMinutes) / 60).toFixed(1)),
    sessionLengthMinutes: input.sessionLengthMinutes,
    courseBreakdown: input.courses.map((course) => {
      const sessions = directSessions.filter((session) => session.course?.code === course.code).length;
      return { ...course, sessions, plannedHours: Number(((sessions * input.sessionLengthMinutes) / 60).toFixed(1)) };
    }),
    days: resultDays,
    notes: [
      "The reliable planner was used to keep every session inside your stated availability.",
      "Confirm official TMA and examination dates before changing your priorities.",
    ],
    weeklyGoal: "Maintain balanced progress across every registered course without exceeding your available study hours.",
    generationSource: "deterministic",
  };
}

export function stripAiJsonFences(value: string) {
  const unfenced = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstObject = unfenced.indexOf("{");
  const lastObject = unfenced.lastIndexOf("}");
  return firstObject >= 0 && lastObject > firstObject
    ? unfenced.slice(firstObject, lastObject + 1)
    : unfenced;
}

export function parseAiStudyPlan(
  content: string,
  input: StudyPlannerGenerationInput,
  model: string,
): StudyPlanResult {
  const parsed = JSON.parse(stripAiJsonFences(content)) as {
    weeklyGoal?: unknown;
    recommendations?: unknown;
    sessions?: unknown;
  };
  if (!Array.isArray(parsed.sessions)) throw new Error("AI response did not include study sessions.");
  const courses = new Map(input.courses.map((course) => [course.code, course]));
  const availability = new Map(input.days.map((day) => [day.day, day]));
  const occupied = new Map<string, Array<[number, number]>>();
  const daySessions = new Map(input.days.map((day) => [day.day, [] as StudyPlannedSession[]]));
  const durationByCourse = new Map<string, number>();

  for (const raw of parsed.sessions.slice(0, 60)) {
    const session = raw as Record<string, unknown>;
    const day = cleanText(session.day, 12);
    const courseCode = normalizeCourseCode(session.courseCode);
    const course = courses.get(courseCode);
    const available = availability.get(day);
    const start = cleanText(session.start, 5);
    const startMinutes = timeToMinutes(start);
    const durationMinutes = Number(session.durationMinutes);
    if (!course || !available || !Number.isFinite(startMinutes)) throw new Error("AI response included an unknown course, day, or time.");
    if (!ALLOWED_SESSION_LENGTHS.includes(durationMinutes) || durationMinutes !== input.sessionLengthMinutes) {
      throw new Error("AI response did not follow the selected session length.");
    }
    const earliest = timeToMinutes(available.startTime);
    const latest = earliest + (available.hours * 60);
    const endMinutes = startMinutes + durationMinutes;
    if (available.hours <= 0 || startMinutes < earliest || endMinutes > latest) throw new Error("AI response placed a session outside the student's availability.");
    const overlaps = (occupied.get(day) ?? []).some(([from, to]) => startMinutes < to && endMinutes > from);
    if (overlaps) throw new Error("AI response included overlapping study sessions.");
    occupied.set(day, [...(occupied.get(day) ?? []), [startMinutes, endMinutes]]);
    durationByCourse.set(courseCode, (durationByCourse.get(courseCode) ?? 0) + durationMinutes);
    daySessions.get(day)?.push({
      start: minutesToLabel(startMinutes),
      end: minutesToLabel(endMinutes),
      label: `${course.code}: ${cleanText(session.focus, 120) || "focused reading and active recall"}`,
      type: "course",
      course,
      reason: cleanText(session.reason, 180) || "Selected to balance this week's registered courses.",
    });
  }
  if (input.courses.some((course) => !durationByCourse.has(course.code))) throw new Error("AI response did not cover every registered course.");
  const totalMinutes = [...durationByCourse.values()].reduce((sum, value) => sum + value, 0);
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.map((item) => cleanText(item, 220)).filter(Boolean).slice(0, 5)
    : [];
  return {
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    sessionLengthMinutes: input.sessionLengthMinutes,
    courseBreakdown: input.courses.map((course) => {
      const minutes = durationByCourse.get(course.code) ?? 0;
      const sessions = input.days.flatMap((day) => daySessions.get(day.day) ?? []).filter((item) => item.course?.code === course.code).length;
      return { ...course, sessions, plannedHours: Number((minutes / 60).toFixed(1)) };
    }),
    days: input.days.map((day) => ({
      day: day.day,
      workday: day.workday,
      sessions: (daySessions.get(day.day) ?? []).sort((left, right) => left.start.localeCompare(right.start)),
    })),
    notes: [
      ...recommendations,
      "This AI plan uses only registered-course and availability data; confirm official deadlines separately.",
    ],
    weeklyGoal: cleanText(parsed.weeklyGoal, 280) || "Build steady progress across every registered course.",
    generationSource: "ai",
    model,
  };
}
