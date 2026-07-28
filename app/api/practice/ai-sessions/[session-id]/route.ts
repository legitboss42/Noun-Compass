import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import {
  AiPracticeError,
  getAiPracticeSession,
} from "@/lib/platform/ai-practice";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ "session-id": string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sign in to continue this session." }, { status: 401 });
  }
  try {
    const result = await getAiPracticeSession(user.id, (await params)["session-id"]);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiPracticeError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "Practice Exam session could not be loaded." },
      { status: 500 },
    );
  }
}
