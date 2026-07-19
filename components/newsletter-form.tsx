"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError(false);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          source: "homepage",
        }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(body.message || "We could not save your email right now.");
      setMessage(body.message || "You are on the NounCompass updates list.");
      form.reset();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "We could not save your email right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return <form className="newsletter-form" onSubmit={submit} noValidate><div className="newsletter-fields"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /><button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Join the free list"}</button></div><label className="newsletter-consent"><input name="consent" type="checkbox" required />I agree to receive occasional NounCompass study and launch updates. I can unsubscribe at any time.</label><label className="newsletter-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><p className={error ? "newsletter-message newsletter-message-error" : "newsletter-message"} role="status" aria-live="polite">{message}</p><small>No paid membership is required. Read the <Link href="/privacy-policy">Privacy Policy</Link>.</small></form>;
}
