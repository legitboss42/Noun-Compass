"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackRevenueEvent, type RevenueEvent } from "@/lib/platform/revenue-analytics";

type EventInput = Parameters<typeof trackRevenueEvent>[1];

export function RevenueEvent({ event, input, dedupeKey }: { event: RevenueEvent; input?: EventInput; dedupeKey?: string }) {
  useEffect(() => { trackRevenueEvent(event, input, dedupeKey); }, [dedupeKey, event, input]);
  return null;
}

export function RevenueEventFromQuery() {
  const params = useSearchParams();
  const event = params.get("revenue_event");
  useEffect(() => {
    if (event !== "email_verified") return;
    trackRevenueEvent(event, {}, "email-verified");
    const url = new URL(window.location.href);
    url.searchParams.delete("revenue_event");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [event]);
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
