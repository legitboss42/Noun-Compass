import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createQuestionStore, StoreError } from "@/lib/platform/question-store";

export async function POST(request: Request, { params }: { params: Promise<{ "question-id": string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Sign in to save bookmarks." }, { status: 401 });
  const body = await request.json().catch(() => null) as { bookmarked?: boolean } | null;
  try {
    await createQuestionStore().setBookmark(user.id, (await params)["question-id"], body?.bookmarked !== false);
    return NextResponse.json({ bookmarked: body?.bookmarked !== false });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "Bookmark could not be saved." }, { status: 500 });
  }
}
