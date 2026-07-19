"use client";

import { useState } from "react";

declare global { interface Window { gtag?: (...args: unknown[]) => void } }

export function CheckoutButton({ available }: { available: boolean }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function checkout() {
    setLoading(true); setStatus("");
    window.gtag?.("event", "checkout_started", { plan_key: "semester-pass" });
    try {
      const response = await fetch("/api/checkout/initialize", { method: "POST" });
      const payload = await response.json() as { authorizationUrl?: string; message?: string };
      if (!response.ok || !payload.authorizationUrl) throw new Error(payload.message || "Checkout could not start.");
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout could not start.");
      setLoading(false);
    }
  }
  return <div className="checkout-action"><button className="button" type="button" onClick={checkout} disabled={!available || loading}>{loading ? "Opening secure checkout…" : available ? "Buy semester pass" : "Checkout opens after test approval"}</button>{status && <p className="form-message form-message-error" role="status">{status}</p>}</div>;
}
