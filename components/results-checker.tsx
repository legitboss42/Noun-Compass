"use client";

import { FormEvent, useState } from "react";

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
    setStatus({ type: "loading", message: `Checking ${cleaned}…` });

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ matricNo: cleaned }),
      });
      const data = (await response.json()) as { success?: boolean; finalUrl?: string; message?: string };

      if (!response.ok || !data.success || !data.finalUrl) {
        throw new Error(data.message || "No result link was returned. Try again shortly.");
      }

      window.location.assign(data.finalUrl);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "The result service is unavailable. Try again shortly.",
      });
    }
  }

  return (
    <section className="tool-panel" aria-labelledby="result-checker-heading">
      <span className="tool-number">01</span>
      <h2 id="result-checker-heading">Open your NOUN result</h2>
      <p>
        Enter your matriculation number and we will request a result link, then open the official NOUN result
        statement page. NOUN Compass does not store your matriculation number or result.
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
            {status.type === "loading" ? "Checking…" : "View my result"}
          </button>
        </div>
        <p className="form-help" aria-live="polite">
          {status.message || `${matricNo.length}/30 characters`}
        </p>
      </form>
      <p className="form-help">
        This is an independent convenience tool. Confirm the final record on the official NOUN page before relying
        on it for registration, graduation, or support.
      </p>
    </section>
  );
}
