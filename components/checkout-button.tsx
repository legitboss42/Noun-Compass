"use client";

import Link from "next/link";
import { useState } from "react";
import { trackRevenueEvent } from "@/lib/platform/revenue-analytics";

export function CheckoutButton({
  available,
  signedIn,
  returnTo = "/membership",
}: {
  available: boolean;
  signedIn: boolean;
  returnTo?: string;
}) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    setStatus("");
    trackRevenueEvent("membership_cta_clicked", { ctaSource: "membership-card", authState: "signed-in", plan: "semester-pass" });
    trackRevenueEvent("checkout_started", { ctaSource: "membership-card", authState: "signed-in", plan: "semester-pass" });
    try {
      const response = await fetch("/api/checkout/initialize", { method: "POST" });
      const payload = await response.json() as { authorizationUrl?: string; message?: string };
      if (!response.ok || !payload.authorizationUrl) throw new Error(payload.message || "Checkout could not start.");
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout could not start.");
      trackRevenueEvent("checkout_failed", { ctaSource: "membership-card", authState: "signed-in", plan: "semester-pass", failureCategory: "checkout-unavailable" });
      setLoading(false);
    }
  }

  if (!signedIn) {
    return <div className="checkout-action"><Link className="button" href={`/account/sign-in?next=${encodeURIComponent(returnTo)}`} onClick={() => trackRevenueEvent("membership_cta_clicked", { ctaSource: "membership-card", authState: "signed-out", plan: "semester-pass" })}>Sign in to buy</Link><p className="form-message" role="status">Sign in first; checkout never starts automatically after authentication.</p></div>;
  }

  return <div className="checkout-action"><button className="button" type="button" onClick={checkout} disabled={!available || loading}>{loading ? "Opening secure checkout..." : available ? "Buy semester pass" : "Checkout is temporarily unavailable"}</button>{status && <p className="form-message form-message-error" role="alert" aria-live="assertive">{status}</p>}</div>;
}
