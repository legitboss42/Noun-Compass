"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
  }>({ kind: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Something went wrong.");
      }

      setForm(initialState);
      setStatus({
        kind: "success",
        message: payload.message || "Your message has been sent successfully.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "We could not send your message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-grid">
        <label>
          Your name
          <input
            autoComplete="name"
            name="name"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            value={form.name}
          />
        </label>
        <label>
          Email address
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={form.email}
          />
        </label>
      </div>
      <label>
        Subject
        <input
          name="subject"
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          required
          value={form.subject}
        />
      </label>
      <label className="contact-form-honeypot" aria-hidden="true">
        Website
        <input
          autoComplete="off"
          name="website"
          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          tabIndex={-1}
          value={form.website}
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          required
          rows={8}
          value={form.message}
        />
      </label>
      <small>
        Do not include passwords, one-time codes, bank card details, or sensitive student data you do not need to share.
      </small>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
      {status.kind !== "idle" ? (
        <p className={status.kind === "success" ? "form-success" : "form-error"} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
