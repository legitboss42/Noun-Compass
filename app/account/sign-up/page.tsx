import Link from "next/link";
import { AccountFormShell, FormMessage } from "@/components/account-form-shell";
import { signUp } from "../actions";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AccountFormShell title="Create your free NounCompass account" intro="Save your semester setup and start with free planning tools. Premium exam preparation remains optional."><FormMessage error={params.error} /><form action={signUp} className="platform-form"><label>Display name<input name="displayName" autoComplete="name" maxLength={100} required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button" type="submit">Create account</button></form><div className="platform-auth-links"><Link href="/account/sign-in">Already have an account?</Link><Link href="/privacy-policy">How we handle your data</Link></div></AccountFormShell>;
}
