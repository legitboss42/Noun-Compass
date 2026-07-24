export type CalendarCoursePayload = {
  code: string;
  title: string;
};

export type CalendarSessionPayload = {
  title: string;
  courseCode?: string;
  courseTitle?: string;
  startsAt: string;
  endsAt: string;
};

export type CalendarPlanPayload = {
  timezone?: string;
  reminderMinutesBefore?: number;
  sessions: CalendarSessionPayload[];
};

const COURSE_CODE_PATTERN = /^[A-Z]{2,5}[0-9]{3}$/;
const MAX_SESSIONS = 70;
const MIN_REMINDER_MINUTES = 15;
const MAX_REMINDER_MINUTES = 24 * 60;

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function normaliseReminderMinutes(value: unknown) {
  const minutes = Number(value ?? 60);
  if (!Number.isFinite(minutes)) return 60;
  return Math.min(MAX_REMINDER_MINUTES, Math.max(MIN_REMINDER_MINUTES, Math.round(minutes)));
}

export function parseCalendarPlanPayload(raw: string, now = new Date()): Required<CalendarPlanPayload> {
  let parsed: CalendarPlanPayload;
  try {
    parsed = JSON.parse(raw) as CalendarPlanPayload;
  } catch {
    throw new Error("Generate a valid study timetable before saving calendar sessions.");
  }

  const timezone = cleanText(parsed.timezone || "Africa/Lagos", 64) || "Africa/Lagos";
  const reminderMinutesBefore = normaliseReminderMinutes(parsed.reminderMinutesBefore);
  const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
  if (!sessions.length) throw new Error("Generate at least one study session before saving.");
  if (sessions.length > MAX_SESSIONS) throw new Error(`A saved plan can include up to ${MAX_SESSIONS} sessions.`);

  const normalisedSessions = sessions.map((session) => {
    const startsAt = new Date(session.startsAt);
    const endsAt = new Date(session.endsAt);
    if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime())) {
      throw new Error("Each calendar session needs a valid start and end time.");
    }
    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new Error("Each calendar session must end after it starts.");
    }
    if (startsAt.getTime() < now.getTime() - 60 * 60 * 1000) {
      throw new Error("Saved study sessions cannot be in the past.");
    }

    const courseCode = cleanText(session.courseCode, 12).toUpperCase();
    return {
      title: cleanText(session.title, 140) || "NounCompass study session",
      courseCode: COURSE_CODE_PATTERN.test(courseCode) ? courseCode : undefined,
      courseTitle: cleanText(session.courseTitle, 180) || undefined,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  });

  return { timezone, reminderMinutesBefore, sessions: normalisedSessions };
}

function escapeIcsText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function toIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldIcsLine(line: string) {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > 73) {
    parts.push(remaining.slice(0, 73));
    remaining = ` ${remaining.slice(73)}`;
  }
  parts.push(remaining);
  return parts.join("\r\n");
}

export function buildStudyPlanIcs({
  productId = "-//NounCompass//Study Planner//EN",
  generatedAt = new Date(),
  sessions,
}: {
  productId?: string;
  generatedAt?: Date;
  sessions: Array<{
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    course_code?: string | null;
    course_title?: string | null;
  }>;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${productId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const session of sessions) {
    const description = [
      session.course_code ? `Course: ${session.course_code}` : null,
      session.course_title ? `Title: ${session.course_title}` : null,
      "Created from NounCompass Study Planner.",
    ].filter(Boolean).join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:nouncompass-study-${session.id}@nouncompass.me`,
      `DTSTAMP:${toIcsDate(generatedAt.toISOString())}`,
      `DTSTART:${toIcsDate(session.starts_at)}`,
      `DTEND:${toIcsDate(session.ends_at)}`,
      `SUMMARY:${escapeIcsText(session.title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

export function shouldSendStudyReminder({
  startsAt,
  now = new Date(),
  reminderMinutesBefore = 60,
}: {
  startsAt: string;
  now?: Date;
  reminderMinutesBefore?: number;
}) {
  const start = new Date(startsAt);
  if (!Number.isFinite(start.getTime())) return false;
  const reminderAt = start.getTime() - normaliseReminderMinutes(reminderMinutesBefore) * 60 * 1000;
  return reminderAt <= now.getTime() && start.getTime() > now.getTime();
}
