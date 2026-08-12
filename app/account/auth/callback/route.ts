import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalReturnPath } from "@/lib/platform/return-path";
import { AUTH_EVENT_COOKIE, authEventSecret, createEmailVerifiedMarker } from "@/lib/platform/auth-event-marker";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeInternalReturnPath(url.searchParams.get("next"), "/dashboard");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase?.auth.exchangeCodeForSession(code) ?? { error: new Error("Accounts unavailable") };
    if (!error) {
      const destination = new URL(next, url.origin);
      const response = NextResponse.redirect(destination);
      const secret = authEventSecret(process.env);
      if (secret) {
        response.cookies.set(AUTH_EVENT_COOKIE, createEmailVerifiedMarker(secret), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 5 * 60,
          path: "/",
        });
      }
      return response;
    }
  }
  return NextResponse.redirect(new URL("/account/sign-in?error=The+verification+link+is+invalid+or+expired", url.origin));
}
