import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function AccountFormShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <main id="main-content" className="platform-auth"><section className="platform-auth-card"><Link href="/" aria-label="NOUN Compass home"><BrandLogo variant="wordmark" tone="dark" className="brand-logo-header" /></Link><span className="eyebrow">Private student workspace</span><h1>{title}</h1><p>{intro}</p>{children}<p className="platform-privacy-note">NounCompass never asks for your NOUN portal password, OTP, payment-card details, or identity documents.</p></section></main>;
}

export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) return null;
  return <p className={error ? "form-message form-message-error" : "form-message form-message-success"} role="status">{error ?? notice}</p>;
}
