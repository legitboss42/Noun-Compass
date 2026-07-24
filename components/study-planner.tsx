"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { savePremiumStudyPlan, updateStudyPlannerReminders } from "@/app/tools/study-planner/actions";
import type { StudyPlannerCourse } from "@/lib/study-planner-catalog";
import styles from "./study-planner.module.css";

type PlannerStats = {
  totalSuggestionCodes: number;
  recognizedCourseCodes: number;
  recognizedWithMaterials: number;
  recognizedWithoutMaterials: number;
};

type SelectedCourse = {
  code: string;
  title: string;
  units: number | null;
  materialAvailable: boolean;
  difficulty: "unsure" | "standard" | "challenging";
};

type DayAvailability = {
  day: string;
  workday: boolean;
  startTime: string;
  hours: number;
};

type SuggestionResponse = {
  suggestions: StudyPlannerCourse[];
  stats: PlannerStats;
};

type PlannedSession = {
  start: string;
  end: string;
  label: string;
  type: "course" | "buffer";
  course?: SelectedCourse;
};

type PlannedDay = {
  day: string;
  workday: boolean;
  sessions: PlannedSession[];
};

type PlanResult = {
  totalHours: number;
  sessionLengthMinutes: number;
  courseBreakdown: Array<SelectedCourse & { sessions: number; plannedHours: number }>;
  days: PlannedDay[];
  notes: string[];
};

const defaultDays: DayAvailability[] = [
  { day: "Monday", workday: true, startTime: "19:00", hours: 2 },
  { day: "Tuesday", workday: true, startTime: "19:00", hours: 2 },
  { day: "Wednesday", workday: true, startTime: "19:00", hours: 2 },
  { day: "Thursday", workday: true, startTime: "19:00", hours: 2 },
  { day: "Friday", workday: true, startTime: "19:00", hours: 1.5 },
  { day: "Saturday", workday: false, startTime: "09:00", hours: 4 },
  { day: "Sunday", workday: false, startTime: "16:00", hours: 3 },
];

const plannerStorageKey = "noun-compass-study-planner-v1";
const dayIndexes = new Map([
  ["Sunday", 0],
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saturday", 6],
]);

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseManualCourse(value: string): SelectedCourse | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const codeMatch = trimmed.match(/\b([A-Za-z]{2,}\s*\d{2,})\b/);
  const code = normalizeCode(codeMatch?.[1] ?? trimmed.split(/\s+/)[0] ?? trimmed);
  const title = codeMatch ? trimmed.replace(codeMatch[0], "").trim() || trimmed : trimmed;
  if (!code) return null;
  return {
    code,
    title,
    units: null,
    materialAvailable: false,
    difficulty: "unsure",
  };
}

function difficultyWeight(value: SelectedCourse["difficulty"]) {
  if (value === "challenging") return 1.35;
  if (value === "standard") return 1;
  return 1.05;
}

function minutesToLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  const normalizedMinute = String(minutes).padStart(2, "0");
  return `${normalizedHour}:${normalizedMinute} ${suffix}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
}

function labelToMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  const hour = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  const normalizedHour = meridiem === "AM" ? hour % 12 : (hour % 12) + 12;
  return normalizedHour * 60 + minutes;
}

function nextDateForDay(day: string, from: Date) {
  const target = dayIndexes.get(day) ?? from.getDay();
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((target - from.getDay() + 7) % 7));
  return date;
}

function buildCalendarPayload(result: PlanResult) {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Lagos";
  const sessions = result.days.flatMap((day) =>
    day.sessions.map((session) => {
      const startMinutes = labelToMinutes(session.start);
      const endMinutes = labelToMinutes(session.end);
      const sessionDate = nextDateForDay(day.day, now);
      const startsAt = new Date(sessionDate);
      startsAt.setMinutes(startMinutes);
      if (startsAt.getTime() <= now.getTime()) startsAt.setDate(startsAt.getDate() + 7);
      const endsAt = new Date(startsAt);
      endsAt.setMinutes(endsAt.getMinutes() + Math.max(30, endMinutes - startMinutes));

      return {
        title: session.course ? `${session.course.code} study block` : session.label,
        courseCode: session.course?.code,
        courseTitle: session.course?.title,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      };
    }),
  );

  return JSON.stringify({ timezone, reminderMinutesBefore: 60, sessions });
}

function buildPlan({
  courses,
  days,
  studentType,
  rhythm,
  sessionLengthMinutes,
}: {
  courses: SelectedCourse[];
  days: DayAvailability[];
  studentType: "new" | "returning";
  rhythm: "balanced" | "weekend-heavy" | "short-daily";
  sessionLengthMinutes: number;
}): PlanResult | null {
  const activeDays = days
    .map((day) => ({ ...day, slots: Math.floor((day.hours * 60) / sessionLengthMinutes) }))
    .filter((day) => day.slots > 0);
  if (!courses.length || !activeDays.length) return null;

  const totalSlots = activeDays.reduce((sum, day) => sum + day.slots, 0);
  if (!totalSlots) return null;

  const reviewSlots = totalSlots >= 8 ? 1 : 0;
  const studySlots = Math.max(courses.length, totalSlots - reviewSlots);

  const weighted = courses.map((course) => {
    const unitWeight = course.units ?? 2;
    const studentWeight = studentType === "new" ? 1.08 : 1;
    return {
      ...course,
      weight: unitWeight * difficultyWeight(course.difficulty) * studentWeight,
      sessions: 1,
    };
  });

  let remainingSlots = Math.max(0, studySlots - weighted.length);
  while (remainingSlots > 0) {
    weighted.sort((left, right) => (right.weight / right.sessions) - (left.weight / left.sessions));
    weighted[0].sessions += 1;
    remainingSlots -= 1;
  }

  const rankedDays = [...activeDays].sort((left, right) => {
    const weekendLeft = Number(left.day === "Saturday" || left.day === "Sunday");
    const weekendRight = Number(right.day === "Saturday" || right.day === "Sunday");
    if (rhythm === "weekend-heavy" && weekendLeft !== weekendRight) return weekendRight - weekendLeft;
    if (rhythm === "short-daily" && left.workday !== right.workday) return Number(left.workday) - Number(right.workday);
    return right.slots - left.slots;
  });

  const remainingByCode = new Map(weighted.map((course) => [course.code, course.sessions]));
  const plans = new Map<string, PlannedDay>(rankedDays.map((day) => [day.day, { day: day.day, workday: day.workday, sessions: [] }]));
  const breakMinutes = 15;

  for (const day of rankedDays) {
    let currentMinutes = timeToMinutes(day.startTime);
    let previousCode = "";
    const maxSlots = day.slots;

    for (let index = 0; index < maxSlots; index += 1) {
      const availableCourses = weighted
        .filter((course) => (remainingByCode.get(course.code) ?? 0) > 0)
        .sort((left, right) => (remainingByCode.get(right.code) ?? 0) - (remainingByCode.get(left.code) ?? 0));

      const chosen = availableCourses.find((course) => course.code !== previousCode) ?? availableCourses[0];
      if (!chosen) {
        if (reviewSlots > 0 && index === maxSlots - 1) {
          plans.get(day.day)?.sessions.push({
            start: minutesToLabel(currentMinutes),
            end: minutesToLabel(currentMinutes + sessionLengthMinutes),
            label: "Revision and catch-up buffer",
            type: "buffer",
          });
        }
        break;
      }

      const remaining = remainingByCode.get(chosen.code) ?? 0;
      remainingByCode.set(chosen.code, Math.max(0, remaining - 1));
      plans.get(day.day)?.sessions.push({
        start: minutesToLabel(currentMinutes),
        end: minutesToLabel(currentMinutes + sessionLengthMinutes),
        label: `${chosen.code} reading block`,
        type: "course",
        course: chosen,
      });
      previousCode = chosen.code;
      currentMinutes += sessionLengthMinutes + breakMinutes;
    }
  }

  const totalHours = activeDays.reduce((sum, day) => sum + day.hours, 0);
  const notes = [
    studentType === "new"
      ? "This plan assumes you are still discovering which courses feel difficult, so the timetable stays balanced and leaves revision room."
      : "This plan gives extra weight to the courses you marked as challenging and spreads them across the week.",
    reviewSlots > 0
      ? "One buffer block is reserved for revision, catch-up reading, or TMA preparation."
      : "Your current weekly hours are tight, so every available slot is used for direct course reading.",
    "Treat this as a planning timetable. Confirm your actual registered courses, TMA deadlines, and official material versions before relying on it.",
  ];

  return {
    totalHours,
    sessionLengthMinutes,
    courseBreakdown: weighted.map((course) => ({
      ...course,
      sessions: course.sessions,
      plannedHours: Number(((course.sessions * sessionLengthMinutes) / 60).toFixed(1)),
    })),
    days: days.map((day) => plans.get(day.day) ?? { day: day.day, workday: day.workday, sessions: [] }),
    notes,
  };
}

export function StudyPlanner({
  error,
  notice,
  premium,
  remindersEnabled,
  savedCalendarSessionCount,
  signedIn,
  stats,
}: {
  error?: string;
  notice?: string;
  premium: boolean;
  remindersEnabled: boolean;
  savedCalendarSessionCount: number;
  signedIn: boolean;
  stats: PlannerStats;
}) {
  const [studentType, setStudentType] = useState<"new" | "returning">(() => {
    if (typeof window === "undefined") return "new";
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (!saved) return "new";
      const parsed = JSON.parse(saved) as { studentType?: "new" | "returning" };
      return parsed.studentType ?? "new";
    } catch {
      return "new";
    }
  });
  const [rhythm, setRhythm] = useState<"balanced" | "weekend-heavy" | "short-daily">(() => {
    if (typeof window === "undefined") return "balanced";
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (!saved) return "balanced";
      const parsed = JSON.parse(saved) as { rhythm?: "balanced" | "weekend-heavy" | "short-daily" };
      return parsed.rhythm ?? "balanced";
    } catch {
      return "balanced";
    }
  });
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState(() => {
    if (typeof window === "undefined") return 90;
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (!saved) return 90;
      const parsed = JSON.parse(saved) as { sessionLengthMinutes?: number };
      return parsed.sessionLengthMinutes ?? 90;
    } catch {
      return 90;
    }
  });
  const [courseQuery, setCourseQuery] = useState("");
  const [courseSuggestions, setCourseSuggestions] = useState<StudyPlannerCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as { selectedCourses?: SelectedCourse[] };
      return parsed.selectedCourses ?? [];
    } catch {
      return [];
    }
  });
  const [days, setDays] = useState<DayAvailability[]>(() => {
    if (typeof window === "undefined") return defaultDays;
    try {
      const saved = window.localStorage.getItem(plannerStorageKey);
      if (!saved) return defaultDays;
      const parsed = JSON.parse(saved) as { days?: DayAvailability[] };
      return parsed.days ?? defaultDays;
    } catch {
      return defaultDays;
    }
  });
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(plannerStorageKey, JSON.stringify({
      studentType,
      rhythm,
      sessionLengthMinutes,
      selectedCourses,
      days,
    }));
  }, [studentType, rhythm, sessionLengthMinutes, selectedCourses, days]);

  useEffect(() => {
    const trimmed = courseQuery.trim();
    if (trimmed.length < 2) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/tools/study-planner/courses?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        const data = await response.json() as SuggestionResponse;
        setCourseSuggestions(data.suggestions.filter((item) => !selectedCourses.some((course) => course.code === item.code)));
      } catch {
        setCourseSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [courseQuery, selectedCourses]);

  const totalAvailableHours = useMemo(() => Number(days.reduce((sum, day) => sum + day.hours, 0).toFixed(1)), [days]);
  const calendarPlanJson = useMemo(() => result ? buildCalendarPayload(result) : "", [result]);

  const handleCourseQueryChange = (value: string) => {
    setCourseQuery(value);
    if (value.trim().length < 2) {
      setCourseSuggestions([]);
      setLoadingSuggestions(false);
    }
  };

  const addCourse = (course: SelectedCourse) => {
    if (selectedCourses.some((item) => item.code === course.code)) return;
    setSelectedCourses((current) => [...current, course]);
    setCourseQuery("");
    setCourseSuggestions([]);
    setResult(null);
  };

  const addSuggestedCourse = (course: StudyPlannerCourse) => {
    addCourse({
      code: course.code,
      title: course.title,
      units: course.units,
      materialAvailable: course.materialAvailable,
      difficulty: "unsure",
    });
  };

  const addManualCourse = () => {
    const parsed = parseManualCourse(courseQuery);
    if (!parsed) return;
    addCourse(parsed);
  };

  const updateCourse = (code: string, difficulty: SelectedCourse["difficulty"]) => {
    setSelectedCourses((current) => current.map((course) => course.code === code ? { ...course, difficulty } : course));
    setResult(null);
  };

  const removeCourse = (code: string) => {
    setSelectedCourses((current) => current.filter((course) => course.code !== code));
    setResult(null);
  };

  const updateDay = (dayName: string, field: keyof Omit<DayAvailability, "day">, value: string | number | boolean) => {
    setDays((current) => current.map((day) => day.day === dayName ? { ...day, [field]: value } : day));
    setResult(null);
  };

  const generatePlan = () => {
    const plan = buildPlan({ courses: selectedCourses, days, studentType, rhythm, sessionLengthMinutes });
    setResult(plan);
  };

  const canGenerate = selectedCourses.length > 0 && days.some((day) => day.hours > 0);

  return (
    <div className={styles.planner}>
      {error ? <p className="form-message form-message-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-message form-message-success" role="status">{notice}</p> : null}

      <section className={styles.introCard}>
        <span className="eyebrow">Study planner</span>
        <h2>Build a weekly NOUN reading timetable around your real availability</h2>
        <p>This first version is built for distance-learning students who work and study. Add your courses, tell the planner when you are actually free, and generate a timetable that spreads the reading load across the week.</p>
        <div className={styles.statsRow}>
          <div><strong>{stats.recognizedCourseCodes.toLocaleString()}</strong><span>recognized course codes in the suggestion catalog</span></div>
          <div><strong>{stats.recognizedWithMaterials.toLocaleString()}</strong><span>recognized course codes with downloadable official-source materials</span></div>
          <div><strong>{stats.recognizedWithoutMaterials.toLocaleString()}</strong><span>recognized course codes currently without a downloadable material match</span></div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>01</span>
          <div>
            <h3>Study profile</h3>
            <p>Choose the setup that most closely matches how you study right now.</p>
          </div>
        </div>
        <div className={styles.fieldGrid}>
          <label>
            <span>Student mode</span>
            <select value={studentType} onChange={(event) => setStudentType(event.target.value as "new" | "returning")}>
              <option value="new">New to these courses</option>
              <option value="returning">I already know my course pressure</option>
            </select>
          </label>
          <label>
            <span>Study rhythm</span>
            <select value={rhythm} onChange={(event) => setRhythm(event.target.value as "balanced" | "weekend-heavy" | "short-daily")}>
              <option value="balanced">Balanced across the week</option>
              <option value="weekend-heavy">Lighter weekdays, heavier weekends</option>
              <option value="short-daily">Short daily sessions where possible</option>
            </select>
          </label>
          <label>
            <span>Session length</span>
            <select value={sessionLengthMinutes} onChange={(event) => setSessionLengthMinutes(Number(event.target.value))}>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>02</span>
          <div>
            <h3>Add courses</h3>
            <p>Type a course code or title. Suggestions come from the course data already available on NounCompass.</p>
          </div>
        </div>
        <div className={styles.courseSearch}>
          <label className={styles.searchInputWrap}>
            <span className="sr-only">Search course code or title</span>
            <input value={courseQuery} onChange={(event) => handleCourseQueryChange(event.target.value)} placeholder="Try GST107, MTH101, accounting, public health..." />
          </label>
          <button type="button" className="button" onClick={addManualCourse}>Add course</button>
        </div>
        {(loadingSuggestions || courseSuggestions.length > 0 || courseQuery.trim().length >= 2) && (
          <div className={styles.suggestionBox}>
            {loadingSuggestions && <p>Loading suggestions...</p>}
            {!loadingSuggestions && courseSuggestions.map((course) => (
              <button type="button" key={course.code} className={styles.suggestionItem} onClick={() => addSuggestedCourse(course)}>
                <span><strong>{course.code}</strong> {course.title}</span>
                <small>{course.materialAvailable ? "Material available" : "No material match yet"}</small>
              </button>
            ))}
            {!loadingSuggestions && courseQuery.trim().length >= 2 && courseSuggestions.length === 0 && (
              <p>No close match found yet. You can still add the course manually.</p>
            )}
          </div>
        )}
        {!!selectedCourses.length && (
          <div className={styles.courseList}>
            {selectedCourses.map((course) => (
              <div key={course.code} className={styles.courseItem}>
                <div>
                  <strong>{course.code}</strong>
                  <p>{course.title}</p>
                  <span>{course.units ? `${course.units} unit${course.units > 1 ? "s" : ""}` : "Units not confirmed yet"} | {course.materialAvailable ? <Link href={`/course-materials?q=${encodeURIComponent(course.code)}`}>Course material found</Link> : "No material match yet"}</span>
                </div>
                <label>
                  <span className="sr-only">Difficulty for {course.code}</span>
                  <select value={course.difficulty} onChange={(event) => updateCourse(course.code, event.target.value as SelectedCourse["difficulty"])}>
                    <option value="unsure">Not sure yet</option>
                    <option value="standard">Feels standard</option>
                    <option value="challenging">Likely challenging</option>
                  </select>
                </label>
                <button type="button" onClick={() => removeCourse(course.code)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelNumber}>03</span>
          <div>
            <h3>Weekly availability</h3>
            <p>Tell the planner when you can realistically study. Workdays are tagged so the schedule can stay more realistic.</p>
          </div>
        </div>
        <div className={styles.availabilityTable}>
          <div className={styles.availabilityHead}><span>Day</span><span>Workday?</span><span>Start time</span><span>Hours available</span></div>
          {days.map((day) => (
            <div key={day.day} className={styles.availabilityRow}>
              <strong>{day.day}</strong>
              <label><input type="checkbox" checked={day.workday} onChange={(event) => updateDay(day.day, "workday", event.target.checked)} /><span>{day.workday ? "Yes" : "No"}</span></label>
              <input type="time" value={day.startTime} onChange={(event) => updateDay(day.day, "startTime", event.target.value)} />
              <input type="number" min="0" max="12" step="0.5" value={day.hours} onChange={(event) => updateDay(day.day, "hours", Number(event.target.value) || 0)} />
            </div>
          ))}
        </div>
        <div className={styles.availabilitySummary}>
          <strong>{totalAvailableHours.toFixed(1)} study hours currently available each week</strong>
          <span>Adjust the numbers until they reflect real life, not an ideal week.</span>
        </div>
      </section>

      <div className={styles.actionRow}>
        <button type="button" className="button" onClick={generatePlan} disabled={!canGenerate}>Generate study timetable</button>
        <button type="button" className={styles.secondaryButton} onClick={() => window.print()} disabled={!result}>Print timetable</button>
      </div>

      <section className={styles.calendarPanel} aria-labelledby="planner-calendar-title">
        <div>
          <span className="eyebrow">Calendar and reminders</span>
          <h2 id="planner-calendar-title">Add sessions to your calendar</h2>
          <p>
            Semester Pass members can save the generated sessions, download a calendar file, and receive reminder notifications before each study block.
          </p>
        </div>
        {!signedIn ? (
          <Link className="button" href="/account/sign-in?next=/tools/study-planner">Sign in to save sessions</Link>
        ) : !premium ? (
          <Link className="button" href="/membership">Unlock with Semester Pass</Link>
        ) : (
          <div className={styles.calendarActions}>
            <form action={savePremiumStudyPlan}>
              <input type="hidden" name="planJson" value={calendarPlanJson} />
              <button className="button" type="submit" disabled={!result}>Save calendar sessions</button>
            </form>
            <a className={styles.secondaryButton} href="/api/tools/study-planner/calendar">Download .ics calendar</a>
            <form action={updateStudyPlannerReminders} className={styles.reminderToggle}>
              <label>
                <input name="remindersEnabled" type="checkbox" defaultChecked={remindersEnabled} />
                <span>Reminder notifications</span>
              </label>
              <button type="submit">Update</button>
            </form>
            <small>
              {savedCalendarSessionCount
                ? `${savedCalendarSessionCount} upcoming session${savedCalendarSessionCount === 1 ? "" : "s"} saved.`
                : "Generate and save a timetable before exporting."}
            </small>
          </div>
        )}
      </section>

      {result && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <span className="eyebrow">Your timetable</span>
              <h2>Your weekly NOUN reading plan</h2>
            </div>
            <div className={styles.resultMeta}>
              <strong>{result.totalHours.toFixed(1)} hours/week</strong>
              <span>{result.sessionLengthMinutes}-minute sessions</span>
            </div>
          </div>

          <div className={styles.breakdownGrid}>
            {result.courseBreakdown.map((course) => (
              <article key={course.code} className={styles.breakdownCard}>
                <strong>{course.code}</strong>
                <h3>{course.title}</h3>
                <p>{course.sessions} session{course.sessions > 1 ? "s" : ""} · {course.plannedHours.toFixed(1)} planned hours</p>
                <span>{course.materialAvailable ? <Link href={`/course-materials?q=${encodeURIComponent(course.code)}`}>Open course materials</Link> : "No material match yet"}</span>
              </article>
            ))}
          </div>

          <div className={styles.timetableGrid}>
            {result.days.map((day) => (
              <section key={day.day} className={styles.dayCard}>
                <header>
                  <h3>{day.day}</h3>
                  <span>{day.workday ? "Workday" : "Flexible day"}</span>
                </header>
                {day.sessions.length ? (
                  <ul>
                    {day.sessions.map((session, index) => (
                      <li key={`${day.day}-${index}`}>
                        <strong>{session.start} - {session.end}</strong>
                        <span>{session.label}</span>
                        {session.course?.materialAvailable && <Link href={`/course-materials?q=${encodeURIComponent(session.course.code)}`}>Materials</Link>}
                      </li>
                    ))}
                  </ul>
                ) : <p>No study block assigned.</p>}
              </section>
            ))}
          </div>

          <div className={styles.notePanel}>
            <h3>How to use this timetable well</h3>
            <ul>
              {result.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
