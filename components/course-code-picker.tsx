"use client";

import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { StudyPlannerCourse } from "@/lib/study-planner-catalog";

type LockedCourse = Pick<StudyPlannerCourse, "code" | "title">;

function normalizeCourseCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function CourseCodePicker({ initialCodes }: { initialCodes: string[] }) {
  const [selectedCourses, setSelectedCourses] = useState<LockedCourse[]>(() =>
    [...new Set(initialCodes.map(normalizeCourseCode).filter(Boolean))].map((code) => ({
      code,
      title: "Previously saved course",
    })),
  );
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StudyPlannerCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const selectedCodes = useMemo(() => new Set(selectedCourses.map((course) => course.code)), [selectedCourses]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tools/study-planner/courses?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await response.json() as { suggestions?: StudyPlannerCourse[] };
        setSuggestions((data.suggestions ?? []).filter((course) => !selectedCodes.has(course.code)));
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setMessage("Course suggestions are temporarily unavailable. You can still add a valid course code.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selectedCodes]);

  function selectCourse(course: LockedCourse) {
    if (selectedCodes.has(course.code) || selectedCourses.length >= 30) return;
    setSelectedCourses((current) => [...current, course]);
    setQuery("");
    setSuggestions([]);
    setMessage(`${course.code} added. Type the next course code.`);
  }

  function addEnteredCode() {
    const code = normalizeCourseCode(query);
    if (!/^[A-Z]{2,5}\d{3}$/.test(code)) {
      setMessage("Choose a suggestion or enter a course code such as GST101.");
      return;
    }
    selectCourse({ code, title: "User-entered course" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSuggestions([]);
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (suggestions[0]) selectCourse(suggestions[0]);
    else addEnteredCode();
  }

  function removeCourse(code: string) {
    setSelectedCourses((current) => current.filter((course) => course.code !== code));
    setMessage(`${code} removed.`);
  }

  function importLocalPlanner() {
    try {
      const raw = window.localStorage.getItem("noun-compass-study-planner-v1");
      if (!raw) {
        setMessage("No saved study-planner data was found in this browser.");
        return;
      }
      const parsed = JSON.parse(raw) as { selectedCourses?: Array<{ code?: string; title?: string }> };
      const imported = (parsed.selectedCourses ?? [])
        .map((course) => ({
          code: normalizeCourseCode(course.code ?? ""),
          title: course.title?.trim() || "Imported course",
        }))
        .filter((course) => course.code && !selectedCodes.has(course.code));
      if (!imported.length) {
        setMessage("No new course codes were found in the saved local planner.");
        return;
      }
      setSelectedCourses((current) => [...current, ...imported].slice(0, 30));
      setMessage(`${imported.length} local course code${imported.length === 1 ? "" : "s"} added. Review the list before saving.`);
    } catch {
      setMessage("The local planner data could not be read. Nothing was imported.");
    }
  }

  const showSuggestions = query.trim().length >= 2;

  return (
    <div className="course-code-picker">
      <input type="hidden" name="courseCodes" value={selectedCourses.map((course) => course.code).join(",")} />
      <label htmlFor="registered-course-search">Registered course codes</label>
      <p>Start typing a course code or title, then choose the matching suggestion. Each choice is locked into your list so you can add the next course.</p>
      <div className="platform-import-row">
        <button type="button" onClick={importLocalPlanner}>Import course codes from this browser</button>
      </div>
      <div className="course-code-picker-search">
        <input
          id="registered-course-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setMessage("");
            if (event.target.value.trim().length < 2) {
              setSuggestions([]);
              setLoading(false);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start with GST101 or a course title"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="registered-course-suggestions"
        />
        <button type="button" onClick={addEnteredCode}>Add entered code</button>
      </div>
      {showSuggestions && (
        <div id="registered-course-suggestions" className="course-code-suggestions" role="listbox" aria-label="Course suggestions">
          {loading && <p>Finding matching courses…</p>}
          {!loading && suggestions.map((course) => (
            <button
              type="button"
              role="option"
              aria-selected="false"
              key={course.code}
              onClick={() => selectCourse(course)}
            >
              <span><strong>{course.code}</strong>{course.title}</span>
              <small>{course.units ? `${course.units} units` : "Units not confirmed"}</small>
            </button>
          ))}
          {!loading && suggestions.length === 0 && <p>No catalogue match yet. Check the code, or add a correctly formatted code manually.</p>}
        </div>
      )}
      {selectedCourses.length > 0 ? (
        <div className="course-code-locks" aria-label="Selected registered courses">
          {selectedCourses.map((course) => (
            <div key={course.code}>
              <span><strong>{course.code}</strong>{course.title}</span>
              <button type="button" onClick={() => removeCourse(course.code)} aria-label={`Remove ${course.code}`}>Remove</button>
            </div>
          ))}
        </div>
      ) : <p className="course-code-picker-empty">No registered courses added yet.</p>}
      <p className="course-code-picker-status" role="status">{message}</p>
    </div>
  );
}
