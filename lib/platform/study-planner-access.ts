import "server-only";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/platform/auth";
import { membershipIsActive } from "@/lib/platform/membership";
import { createClient } from "@/lib/supabase/server";

export async function requireStudyPlannerPremium(nextPath = "/tools/study-planner") {
  const user = await requireUser(nextPath);
  const supabase = await createClient();
  if (!supabase) redirect(`${nextPath}?error=Platform+database+is+not+configured`);

  const { data: membership } = await supabase
    .from("memberships")
    .select("status,ends_at")
    .eq("user_id", user.id)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membershipIsActive(membership?.status, membership?.ends_at)) {
    redirect(`/membership?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function getStudyPlannerPremiumState(userId: string) {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: membership } = await supabase
    .from("memberships")
    .select("status,ends_at")
    .eq("user_id", userId)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return membershipIsActive(membership?.status, membership?.ends_at);
}
