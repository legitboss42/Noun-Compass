"use client";

import { FormEvent, useState } from "react";
import { saveToolActivity } from "@/lib/platform/tool-activity-client";

type Status = { type: "idle" | "loading" | "error"; message: string };

export function ResultsChecker() {
  const [matricNo, setMatricNo] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  function cleanMatric(value: string) {
    return value.toUpperCase().replace(/[^A-Z0-9/-]/g, "").slice(0, 30);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = cleanMatric(matricNo);

    if (cleaned.length < 6) {
      setStatus({ type: "error", message: "Enter a valid matriculation number." });
      return;
    }

    setMatricNo(cleaned);
    setStatus({ type: "loading", message: "Opening the official NOUN result portal…" });

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ matricNo: cleaned }),
      });
      const data = (await response.json()) as { success?: boolean; finalUrl?: string; message?: string };

      if (!response.ok || !data.success || !data.finalUrl) {
        saveToolActivity("result-checker", {
          status: "failed",
          reason: data.message || "portal_unavailable",
        });
        throw new Error(data.message || "The official result portal could not be opened. Try again shortly.");
      }

      saveToolActivity("result-checker", { status: "opened" });
      window.location.assign(data.finalUrl);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "The official result portal is unavailable. Try again shortly.",
      });
    }
  }

  return (
    <section className="tool-panel" aria-labelledby="result-checker-heading">
      <span className="tool-number">01</span>
      <h2 id="result-checker-heading">Open your NOUN result</h2>
      <p>
        Enter your matriculation number to continue to the official NOUN result portal. NounCompass checks the
        format but does not store your matriculation number or result. You will sign in on the official portal.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="matric-no">Matriculation number</label>
        <div className="form-row">
          <input
            id="matric-no"
            name="matricNo"
            value={matricNo}
            onChange={(event) => setMatricNo(cleanMatric(event.target.value))}
            placeholder="e.g. NOU181012345"
            autoComplete="off"
            inputMode="text"
            maxLength={30}
            required
          />
          <button className="button" type="submit" disabled={status.type === "loading"}>
            {status.type === "loading" ? "Opening…" : "Open official result portal"}
          </button>
        </div>
        <p className="form-help" aria-live="polite">
          {status.message || `${matricNo.length}/30 characters`}
        </p>
      </form>
      <p className="form-help">
        Sign in only on the official NOUN page. Confirm the final record there before relying on it for
        registration, graduation, or support.
      </p>
    </section>
  );
}
