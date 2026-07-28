import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/platform/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTools = new Set([
  "fee-checker",
  "cgpa-calculator",
  "study-planner",
  "result-checker",
]);

function sanitizeSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ saved: false }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    toolKey?: string;
    summary?: unknown;
  } | null;
  const toolKey = String(body?.toolKey ?? "");
  if (!allowedTools.has(toolKey)) {
    return NextResponse.json({ message: "Unsupported tool activity." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ message: "Database is not configured." }, { status: 503 });

  const now = new Date().toISOString();
  const { error } = await admin
    .from("user_tool_activity")
    .upsert(
      {
        user_id: user.id,
        tool_key: toolKey,
        summary: sanitizeSummary(body?.summary),
        updated_at: now,
      },
      { onConflict: "user_id,tool_key" },
    );

  if (error) return NextResponse.json({ message: "Tool activity could not be saved." }, { status: 500 });
  return NextResponse.json({ saved: true });
}
