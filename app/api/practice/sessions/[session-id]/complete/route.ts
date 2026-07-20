import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";

export async function POST(_request: Request, { params }: { params: Promise<{ "session-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  try {
    return NextResponse.json(await createQuestionStore().complete(user.id, (await params)["session-id"]));
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "Session could not be completed." }, { status: 500 });
  }
}
