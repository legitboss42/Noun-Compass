"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [fieldError, setFieldError] = useState<"email" | "consent" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(false);
    setFieldError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const consentInput = form.elements.namedItem("consent") as HTMLInputElement;

    if (!emailInput.validity.valid) {
      setError(true);
      setFieldError("email");
      setMessage("Enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!consentInput.checked) {
      setError(true);
      setFieldError("consent");
      setMessage("Confirm that you agree to receive NounCompass emails.");
      consentInput.focus();
      return;
    }

    setSubmitting(true);

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
      setMessage(body.message || "You are on the NounCompass email list.");
      form.reset();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "We could not save your email right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return <form className="newsletter-form" onSubmit={submit} noValidate><div className="newsletter-fields"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={fieldError === "email"} aria-describedby="newsletter-message newsletter-privacy-note" /><button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Join the free list"}</button></div><label className="newsletter-consent"><input name="consent" type="checkbox" required aria-invalid={fieldError === "consent"} aria-describedby="newsletter-message" />I agree to receive occasional NounCompass emails about new guides and study updates. I can unsubscribe at any time.</label><label className="newsletter-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><p id="newsletter-message" className={error ? "newsletter-message newsletter-message-error" : "newsletter-message"} role="status" aria-live="polite">{message}</p><small id="newsletter-privacy-note">No paid membership is needed. Read the <Link href="/privacy-policy">Privacy Policy</Link>.</small></form>;
}
