import { redirect } from "next/navigation";
import type { UserRole } from "./types";
import { localPilotEnabled, localPilotUser } from "./local-pilot";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (process.env.LOCAL_PILOT === "true" && localPilotEnabled()) return localPilotUser();
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  if (process.env.LOCAL_PILOT === "true" && localPilotEnabled() && localPilotUser().id === userId) return ["student"];
  const initialAdmin = process.env.INITIAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const user = await getCurrentUser();
  if (initialAdmin && user?.id === userId && user.email?.toLowerCase() === initialAdmin) {
    return ["super_admin"];
  }
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((row) => row.role as UserRole);
}

export async function requireRole(allowed: UserRole[], nextPath = "/admin") {
  const user = await requireUser(nextPath);
  const roles = await getUserRoles(user.id);
  if (!roles.some((role) => allowed.includes(role))) redirect("/dashboard?notice=forbidden");
  return { user, roles };
}
