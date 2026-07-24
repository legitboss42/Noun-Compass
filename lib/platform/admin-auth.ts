import "server-only";

import { redirect } from "next/navigation";
import { getUserRoles, requireUser } from "./auth";
import {
  hasAdminPermission,
  permissionsForRoles,
  type AdminPermission,
} from "./admin-permissions";

export async function getAdminSession(nextPath = "/admin") {
  const user = await requireUser(nextPath);
  const roles = await getUserRoles(user.id);
  return {
    user,
    roles,
    permissions: permissionsForRoles(roles),
  };
}
export async function requirePermission(
  permission: AdminPermission,
  nextPath = "/admin",
) {
  const session = await getAdminSession(nextPath);
  if (!hasAdminPermission(session.roles, permission)) {
    redirect("/dashboard?notice=forbidden");
  }
  return session;
}

export async function requireAdmin(nextPath = "/admin") {
  return requirePermission("overview.read", nextPath);
}
