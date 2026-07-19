import { AccountFormShell, FormMessage } from "@/components/account-form-shell";
import { updatePassword } from "../../actions";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <AccountFormShell title="Choose a new password" intro="Use at least 10 characters and do not reuse your NOUN portal password."><FormMessage error={params.error} /><form action={updatePassword} className="platform-form"><label>New password<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label><button className="button" type="submit">Update password</button></form></AccountFormShell>;
}
