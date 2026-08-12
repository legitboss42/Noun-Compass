"use client";

import { useEffect } from "react";
import { trackRevenueEvent, type RevenueEvent } from "@/lib/platform/revenue-analytics";

type EventInput = Parameters<typeof trackRevenueEvent>[1];

export function RevenueEvent({ event, input, dedupeKey }: { event: RevenueEvent; input?: EventInput; dedupeKey?: string }) {
  useEffect(() => { trackRevenueEvent(event, input, dedupeKey); }, [dedupeKey, event, input]);
  return null;
}

export function RevenueEventFromAuthMarker() {
  useEffect(() => {
    fetch("/api/analytics/auth-event", { method: "POST" })
      .then((response) => response.ok ? response.json() as Promise<{ event?: string | null }> : null)
      .then((payload) => {
        if (payload?.event === "email_verified") trackRevenueEvent("email_verified", {}, "email-verified");
      })
      .catch(() => {});
  }, []);
  return null;
}

export function SignupSubmitTracker({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId);
    const onSubmit = () => trackRevenueEvent("signup_submitted", { ctaSource: "account-sign-up" });
    form?.addEventListener("submit", onSubmit);
    return () => form?.removeEventListener("submit", onSubmit);
  }, [formId]);
  return null;
}
