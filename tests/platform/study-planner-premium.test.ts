import assert from "node:assert/strict";
import test from "node:test";
import {
  buildStudyPlanIcs,
  parseCalendarPlanPayload,
  shouldSendStudyReminder,
} from "../../lib/platform/study-planner-premium";

test("calendar plan payload normalizes sessions", () => {
  const payload = parseCalendarPlanPayload(
    JSON.stringify({
      timezone: "Africa/Lagos",
      reminderMinutesBefore: 45,
      sessions: [
        {
          title: "GST101 study block",
          courseCode: "gst101",
          courseTitle: "Use of English",
          startsAt: "2026-07-25T10:00:00.000Z",
          endsAt: "2026-07-25T11:00:00.000Z",
        },
      ],
    }),
    new Date("2026-07-24T00:00:00.000Z"),
  );

  assert.equal(payload.timezone, "Africa/Lagos");
  assert.equal(payload.reminderMinutesBefore, 45);
  assert.equal(payload.sessions[0].courseCode, "GST101");
});

test("calendar plan payload rejects past and invalid sessions", () => {
  assert.throws(
    () => parseCalendarPlanPayload(
      JSON.stringify({
        sessions: [{ title: "Past", startsAt: "2026-07-23T10:00:00.000Z", endsAt: "2026-07-23T11:00:00.000Z" }],
      }),
      new Date("2026-07-24T00:00:00.000Z"),
    ),
    /past/,
  );
});

test("ics export contains calendar and event records", () => {
  const ics = buildStudyPlanIcs({
    generatedAt: new Date("2026-07-24T00:00:00.000Z"),
    sessions: [
      {
        id: "session-1",
        title: "GST101 study block",
        course_code: "GST101",
        course_title: "Use of English",
        starts_at: "2026-07-25T10:00:00.000Z",
        ends_at: "2026-07-25T11:00:00.000Z",
      },
    ],
  });

  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:GST101 study block/);
});

test("study reminders are due only before future sessions", () => {
  assert.equal(
    shouldSendStudyReminder({
      startsAt: "2026-07-24T11:00:00.000Z",
      now: new Date("2026-07-24T10:10:00.000Z"),
      reminderMinutesBefore: 60,
    }),
    true,
  );
  assert.equal(
    shouldSendStudyReminder({
      startsAt: "2026-07-24T10:00:00.000Z",
      now: new Date("2026-07-24T10:10:00.000Z"),
      reminderMinutesBefore: 60,
    }),
    false,
  );
});
