import { AccountFormShell } from "@/components/account-form-shell";
import { requestPasswordReset } from "../actions";

export default function ResetPasswordPage() {
  return <AccountFormShell title="Reset your password" intro="Enter your account email. The response is deliberately the same whether or not an account exists."><form action={requestPasswordReset} className="platform-form"><label>Email address<input name="email" type="email" autoComplete="email" required /></label><button className="button" type="submit">Send reset link</button></form></AccountFormShell>;
}
