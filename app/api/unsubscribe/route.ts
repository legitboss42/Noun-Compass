import { NextResponse } from "next/server";
import { applyUnsubscribe, unsubscribeLinkIsValid } from "@/lib/platform/unsubscribe";
import { isUnsubscribeScope, normalizeUnsubscribeEmail } from "@/lib/platform/unsubscribe-core";

export const dynamic = "force-dynamic";

/**
 * RFC 8058 one-click. Mail clients POST here directly from the List-Unsubscribe
 * header without a human ever seeing the page, so this must succeed on its own
 * and must never require a session.
 *
 * Requests are answered identically whether or not the address is known, so the
 * endpoint cannot be used to enumerate who has an account.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let email = url.searchParams.get("email");
  let scope = url.searchParams.get("scope") ?? "updates";
  let token = url.searchParams.get("token");

  if (!email || !token) {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("form")) {
      const form = await request.formData();
      email = email ?? String(form.get("email") ?? "");
      token = token ?? String(form.get("token") ?? "");
      const formScope = form.get("scope");
      if (formScope) scope = String(formScope);
    } else if (contentType.includes("json")) {
      const body = await request.json().catch(() => null) as Record<string, unknown> | null;
      email = email ?? String(body?.email ?? "");
      token = token ?? String(body?.token ?? "");
      if (body?.scope) scope = String(body.scope);
    }
  }

  if (!isUnsubscribeScope(scope)) return NextResponse.json({ message: "That unsubscribe link is not valid." }, { status: 400 });

  let normalized: string;
  try {
    normalized = normalizeUnsubscribeEmail(email);
  } catch {
    return NextResponse.json({ message: "That unsubscribe link is not valid." }, { status: 400 });
  }

  if (!unsubscribeLinkIsValid(normalized, scope, token)) {
    return NextResponse.json({ message: "That unsubscribe link is not valid." }, { status: 400 });
  }

  try {
    await applyUnsubscribe(normalized, scope);
  } catch {
    return NextResponse.json({ message: "We could not update your email settings. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, unsubscribed: true });
}
