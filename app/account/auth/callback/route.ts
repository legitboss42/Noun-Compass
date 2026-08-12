import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalReturnPath } from "@/lib/platform/return-path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeInternalReturnPath(url.searchParams.get("next"), "/dashboard");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase?.auth.exchangeCodeForSession(code) ?? { error: new Error("Accounts unavailable") };
    if (!error) {
      const destination = new URL(next, url.origin);
      destination.searchParams.set("revenue_event", "email_verified");
      return NextResponse.redirect(destination);
    }
  }
  return NextResponse.redirect(new URL("/account/sign-in?error=The+verification+link+is+invalid+or+expired", url.origin));
}
