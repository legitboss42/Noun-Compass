import Link from "next/link";
import { SectionBadge } from "@/components/SectionBadge";

type CalendarEvent = {
  name: string;
  startsOn: string;
  endsOn: string | null;
  portalObservedStatus: string;
  note?: string;
};

const observedCalendarLabel = "Calendar for 2026_2 Academic Session";

const observedCalendarEvents: CalendarEvent[] = [
  { name: "Session", startsOn: "2025-12-17", endsOn: "2026-12-31", portalObservedStatus: "26Wks 5Days 6Hr 16Mins 27Sec" },
  { name: "Semester", startsOn: "2026-06-07", endsOn: "2026-11-25", portalObservedStatus: "21Wks 4Days 6Hr 16Mins 27Sec" },
  { name: "Registration (Semester, course and examination)", startsOn: "2026-06-08", endsOn: "2026-09-29", portalObservedStatus: "13Wks 3Days 6Hr 16Mins 27Sec" },
  { name: "Dropping of course for exam", startsOn: "2026-06-08", endsOn: null, portalObservedStatus: "Closed", note: "Portal end date is shown as 00/00/0000." },
  { name: "Requests for change...", startsOn: "2026-06-08", endsOn: "2026-09-28", portalObservedStatus: "13Wks 2Days 6Hr 16Mins 27Sec" },
  { name: "Tutor Marked Assignment (TMA)", startsOn: "2026-07-20", endsOn: "2026-09-16", portalObservedStatus: "Loading..." },
  { name: "Examination", startsOn: "2026-09-15", endsOn: "2026-11-05", portalObservedStatus: "Loading..." },
];

function parseObservedDate(value: string | null, mode: "start" | "end") {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return mode === "start"
    ? new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    : new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

function formatPortalDate(value: string | null) {
  if (!value) return "Closed";
  const date = parseObservedDate(value, "start");
  if (!date) return "Closed";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatCountdown(target: Date, now: Date) {
  const difference = target.getTime() - now.getTime();
  if (difference <= 0) return "Closed";

  const totalHours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days === 0) return `${hours}h left`;
  if (days < 14) return `${days}d ${hours}h left`;

  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  return `${weeks}w ${remainingDays}d left`;
}

function getEventStatus(event: CalendarEvent, now: Date) {
  const startsAt = parseObservedDate(event.startsOn, "start");
  const endsAt = parseObservedDate(event.endsOn, "end");

  if (!startsAt || !endsAt) {
    return {
      state: "closed" as const,
      label: "Closed",
      countdown: "Closed",
    };
  }

  if (now < startsAt) {
    return {
      state: "upcoming" as const,
      label: "Opens soon",
      countdown: formatCountdown(startsAt, now),
    };
  }

  if (now > endsAt) {
    return {
      state: "closed" as const,
      label: "Closed",
      countdown: "Closed",
    };
  }

  return {
    state: "active" as const,
    label: "Open now",
    countdown: formatCountdown(endsAt, now),
  };
}

export function AcademicCountdownSidebar() {
  const now = new Date();
  const eventStates = observedCalendarEvents.map((event) => ({
    ...event,
    ...getEventStatus(event, now),
  }));

  const primaryEvent = eventStates.find((event) => event.state === "active")
    ?? eventStates.find((event) => event.state === "upcoming")
    ?? eventStates[0];

  return (
    <aside className="trending academic-countdown" aria-labelledby="academic-countdown-title">
      <SectionBadge>Observed portal calendar</SectionBadge>
      <h2 id="academic-countdown-title">Academic countdown</h2>
      <p className="academic-countdown-intro">
        These dates were copied from a logged-in portal view. We show a server-rendered snapshot here so the page stays fast, then you can confirm the final date inside your own portal.
      </p>

      <section className="countdown-spotlight">
        <div className="countdown-spotlight-top">
          <span>{observedCalendarLabel}</span>
          <strong className={`countdown-state countdown-state-${primaryEvent.state}`}>{primaryEvent.label}</strong>
        </div>
        <h3>{primaryEvent.name}</h3>
        {primaryEvent.note && <p>{primaryEvent.note}</p>}
        <div className="countdown-timer" role="status" aria-label={`${primaryEvent.name} ${primaryEvent.label} ${primaryEvent.countdown}`}>
          {primaryEvent.countdown}
        </div>
        <div className="countdown-dates">
          <span>Begins {formatPortalDate(primaryEvent.startsOn)}</span>
          <span>Ends {formatPortalDate(primaryEvent.endsOn)}</span>
          <span>Portal observed: {primaryEvent.portalObservedStatus}</span>
        </div>
        <small>Snapshot rendered on page load.</small>
      </section>

      <div className="countdown-list" role="list">
        {eventStates.map((event) => (
          <article key={event.name} className="countdown-item" role="listitem">
            <div>
              <strong>{event.name}</strong>
              {event.note && <small>{event.note}</small>}
              <small>Portal observed state: {event.portalObservedStatus}</small>
            </div>
            <div className="countdown-item-meta">
              <span>{formatPortalDate(event.startsOn)} - {formatPortalDate(event.endsOn)}</span>
              <em className={`countdown-state countdown-state-${event.state}`}>{event.countdown}</em>
            </div>
          </article>
        ))}
      </div>

      <div className="trust-note academic-note">
        <strong>Important</strong>
        <p>
          We copied this from one portal view for the 2026_2 session. Use it as a reminder, then check your own portal before you act on any date.
        </p>
        <div className="academic-links">
          <Link href="/articles/nouonline-student-dashboard">See the dashboard guide</Link>
          <Link href="/articles/noun-tma-deadline-guide">Review TMA deadlines</Link>
          <a href="https://www.nouonline.nou.edu.ng/" target="_blank" rel="noreferrer">Open official portal</a>
        </div>
      </div>
    </aside>
  );
}
