import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { AiGovernanceError } from "@/lib/platform/ai-governance";
import { runStudentAssistant, type StudentAssistantInput } from "@/lib/platform/ai-assistant";
import { enforceRateLimit, rateLimitHeaders } from "@/lib/platform/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to use NounCompass AI assistance." }, { status: 401 });
  const limited = enforceRateLimit({ bucket: "student-ai-assistant", key: user.id, limit: 35, windowMs: 60 * 60 * 1000 });
  if (limited.limited) {
    return NextResponse.json(
      { message: "Too many assistant requests were made from this account. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }
  const body = await request.json().catch(() => null) as StudentAssistantInput | null;
  if (!body?.feature) return NextResponse.json({ message: "Choose an assistant feature." }, { status: 400 });
  try {
    const result = await runStudentAssistant(user.id, body);
    return NextResponse.json(result, { headers: rateLimitHeaders(limited) });
  } catch (error) {
    if (error instanceof AiGovernanceError) {
      return NextResponse.json({ message: error.message }, { status: error.status, headers: rateLimitHeaders(limited) });
    }
    return NextResponse.json({ message: "AI assistance could not complete this request." }, { status: 500, headers: rateLimitHeaders(limited) });
  }
}
