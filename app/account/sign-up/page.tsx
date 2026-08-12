import Link from "next/link";
import { AccountFormShell, FormMessage } from "@/components/account-form-shell";
import { RevenueEvent, SignupSubmitTracker } from "@/components/revenue-event";
import { safeInternalReturnPath } from "@/lib/platform/return-path";
import { signUp } from "../actions";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = safeInternalReturnPath(params.next, "/dashboard/profile");
  return <AccountFormShell title="Create your free NounCompass account" intro="Save your semester setup and start with free planning tools. Premium exam preparation remains optional."><RevenueEvent event="signup_started" input={{ ctaSource: "account-sign-up" }} /><SignupSubmitTracker formId="sign-up-form" /><FormMessage error={params.error} /><form action={signUp} className="platform-form" id="sign-up-form"><input type="hidden" name="next" value={next} /><label>Display name<input name="displayName" autoComplete="name" maxLength={100} required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><p className="form-message">Study and inactivity reminders are account preferences. Each reminder includes an unsubscribe option.</p><label className="platform-checkbox"><input name="newsletterConsent" type="checkbox" value="yes" />I want separate NounCompass newsletter and product-marketing emails. This is optional and I can unsubscribe at any time.</label><button className="button" type="submit">Create account</button></form><div className="platform-auth-links"><Link href={`/account/sign-in?next=${encodeURIComponent(next)}`}>Already have an account?</Link><Link href="/privacy-policy">How we handle your data</Link></div></AccountFormShell>;
}
