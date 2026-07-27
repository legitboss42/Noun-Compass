import { NextResponse } from "next/server";
import {
  isValidMatriculationNumber,
  normalizeMatriculationNumber,
  OFFICIAL_NOUN_RESULT_PORTAL,
} from "@/lib/platform/result-portal";

export async function POST(request: Request) {
  try {
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

function noIndexHeaders() {
  return { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
}
