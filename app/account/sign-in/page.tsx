import Link from "next/link";
import { AccountFormShell, FormMessage } from "@/components/account-form-shell";
import { signIn } from "../actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; next?: string }> }) {
  const params = await searchParams;
  return <AccountFormShell title="Sign in to your semester dashboard" intro="Sync your selected courses, preparation progress, reminders, and membership across devices."><FormMessage error={params.error} notice={params.notice} /><form action={signIn} className="platform-form"><input type="hidden" name="next" value={params.next ?? "/dashboard"} /><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button" type="submit">Sign in</button></form><div className="platform-auth-links"><Link href="/account/reset-password">Forgot password?</Link><Link href="/account/sign-up">Create a free account</Link></div></AccountFormShell>;
}
