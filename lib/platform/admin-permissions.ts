import type { UserRole } from "./types";

export const adminPermissions = [
  "overview.read",
  "users.read",
  "users.manage",
  "roles.manage",
  "memberships.read",
  "memberships.manage",
  "payments.read",
  "payments.verify",
  "questions.read",
  "questions.write",
  "questions.publish",
  "articles.read",
  "support.read",
  "support.manage",
  "analytics.read",
  "settings.read",
  "settings.manage",
  "schedules.write",
  "schedules.publish",
  "audit.read",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

const rolePermissions: Record<UserRole, readonly AdminPermission[]> = {
  student: [],
  support_agent: ["overview.read", "users.read", "support.read", "support.manage"],
  content_editor: [
    "overview.read",
    "questions.read",
    "questions.write",
    "articles.read",
    "schedules.write",
  ],
  academic_reviewer: [
    "overview.read",
    "questions.read",
    "questions.write",
    "questions.publish",
    "articles.read",
    "schedules.write",
    "schedules.publish",
  ],
  super_admin: adminPermissions,
};

export function hasAdminPermission(
  roles: readonly UserRole[],
  permission: AdminPermission,
) {
  return roles.some((role) => rolePermissions[role].includes(permission));
}
export function permissionsForRoles(roles: readonly UserRole[]) {
  return adminPermissions.filter((permission) =>
    hasAdminPermission(roles, permission),
  );
}

export function canAssignRole(
  actorRoles: readonly UserRole[],
  targetRole: UserRole,
) {
  return (
    hasAdminPermission(actorRoles, "roles.manage") &&
    (targetRole === "student" || actorRoles.includes("super_admin"))
  );
}

export function canAccessAdmin(roles: readonly UserRole[]) {
  return hasAdminPermission(roles, "overview.read");
}
