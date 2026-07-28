import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";
import {
  isValidMatriculationNumber,
  normalizeMatriculationNumber,
  OFFICIAL_NOUN_RESULT_PORTAL,
} from "@/lib/platform/result-portal";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Sign in to use the result checker." }, { status: 401, headers: noIndexHeaders() });
    }

    const limit = enforceRateLimit({
      bucket: "result-checker",
      key: user.id,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (limit.limited) {
      return NextResponse.json(
        { success: false, message: "Too many result-checker requests. Please try again later." },
        { status: 429, headers: noIndexHeaders(rateLimitHeaders(limit)) },
      );
    }

    const body = (await request.json()) as { matricNo?: unknown };
    const matricNo = normalizeMatriculationNumber(body.matricNo);

    if (!isValidMatriculationNumber(matricNo)) {
      return NextResponse.json({ success: false, message: "Enter a valid matriculation number." }, { status: 400, headers: noIndexHeaders() });
    }

    return NextResponse.json({
      success: true,
      finalUrl: OFFICIAL_NOUN_RESULT_PORTAL,
      message: "Continue on the official NOUN result portal and sign in with your NOUN credentials.",
    }, { headers: noIndexHeaders() });
  } catch {
    return NextResponse.json({ success: false, message: "The official result portal could not be opened. Try again shortly." }, { status: 502, headers: noIndexHeaders() });
  }
}

function noIndexHeaders(extra: Record<string, string> = {}) {
  return { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", ...extra };
}
