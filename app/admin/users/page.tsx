import Link from "next/link";
import {
  AdminDataTable,
  AdminFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate, safePage } from "@/lib/platform/admin-format";
import { userRoles, type MembershipStatus, type UserRole } from "@/lib/platform/types";
import { createAdminClient } from "@/lib/supabase/admin";

type UserDirectoryRow = {
  user_id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  display_name: string | null;
  programme: string | null;
  level: number | null;
  roles: UserRole[];
  membership_status: MembershipStatus | null;
  membership_ends_at: string | null;
  total_count: number;
};

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("users.read", "/admin/users");
  const params = await searchParams;
  const page = safePage(params.page);
  const query = params.q?.trim() ?? "";
  const role = userRoles.includes(params.role as UserRole)
    ? (params.role as UserRole)
    : null;
  const membership = [
    "pending",
    "active",
    "expired",
    "refunded",
    "revoked",
  ].includes(params.membership ?? "")
    ? (params.membership as MembershipStatus)
    : null;
  const level = params.level ? Number(params.level) : null;
  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.rpc("admin_list_users", {
        p_query: query || null,
        p_role: role,
        p_membership_status: membership,
        p_programme: params.programme?.trim() || null,
        p_level: Number.isInteger(level) ? level : null,
        p_account_status: ["active", "suspended"].includes(params.account ?? "")
          ? params.account
          : null,
        p_sort: ["newest", "oldest", "last-active"].includes(params.sort ?? "")
          ? params.sort
          : "newest",
        p_offset: (page - 1) * PAGE_SIZE,
        p_limit: PAGE_SIZE,
      })
    : { data: [], error: new Error("Database is not configured.") };
  const users = (data ?? []) as UserDirectoryRow[];
  const total = users[0]?.total_count ?? 0;
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page" && key !== "notice" && key !== "error") {
        next.set(key, value);
      }
    });
    next.set("page", String(targetPage));
    return `/admin/users?${next.toString()}`;
  };

  const columns: AdminColumn<UserDirectoryRow>[] = [
    {
      key: "user",
      header: "User / profile",
      render: (user) => (
        <>
          <strong>{user.display_name || "Name not set"}</strong>
          <small>{user.email}</small>
          <small>{user.user_id}</small>
        </>
      ),
    },
    {
      key: "academic",
      header: "Programme",
      render: (user) => (
        <>
          <strong>{user.programme || "Not provided"}</strong>
          <small>{user.level ? `${user.level} level` : "Level not provided"}</small>
        </>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (user) => (
        <div className="admin-table-actions">
          {user.roles.map((currentRole) => (
            <AdminStatusBadge key={currentRole} value={currentRole} />
          ))}
        </div>
      ),
    },
    {
      key: "membership",
      header: "Membership",
      render: (user) => (
        <>
          <AdminStatusBadge value={user.membership_status ?? "free"} />
          {user.membership_ends_at ? (
            <small>Ends {formatAdminDate(user.membership_ends_at)}</small>
          ) : null}
        </>
      ),
    },
    {
      key: "activity",
      header: "Joined / activity",
      render: (user) => (
        <>
          <strong>{formatAdminDate(user.created_at)}</strong>
          <small>
            Last sign-in: {formatAdminDate(user.last_sign_in_at)}
          </small>
        </>
      ),
    },
    {
      key: "status",
      header: "Account",
      render: (user) => (
        <>
          <AdminStatusBadge
            value={
              user.banned_until && new Date(user.banned_until) > new Date()
                ? "suspended"
                : "active"
            }
          />
          <small>
            {user.email_confirmed_at ? "Email confirmed" : "Email unconfirmed"}
          </small>
        </>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <Link
          className="admin-button admin-button-secondary admin-button-small"
          href={`/admin/users/${user.user_id}`}
        >
          Open
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Identity and access"
        title="Users"
        description="Search live Supabase Auth accounts and joined profile, role, membership, and activity data. Passwords and authentication secrets are never exposed."
      />
      <AdminFeedback error={params.error || (error ? error.message : undefined)} notice={params.notice} />
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Email, name, or user ID
            <input name="q" defaultValue={query} />
          </label>
          <label>
            Role
            <select name="role" defaultValue={params.role ?? ""}>
              <option value="">All roles</option>
              {userRoles.map((currentRole) => (
                <option key={currentRole} value={currentRole}>
                  {currentRole.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Membership
            <select name="membership" defaultValue={params.membership ?? ""}>
              <option value="">All memberships</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label>
            Account
            <select name="account" defaultValue={params.account ?? ""}>
              <option value="">All accounts</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
          <label>
            Programme
            <input name="programme" defaultValue={params.programme ?? ""} />
          </label>
          <label>
            Level
            <select name="level" defaultValue={params.level ?? ""}>
              <option value="">All levels</option>
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                (currentLevel) => (
                  <option key={currentLevel} value={currentLevel}>
                    {currentLevel}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Sort
            <select name="sort" defaultValue={params.sort ?? "newest"}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="last-active">Recent sign-in</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">
              Apply
            </button>
            <Link className="admin-button admin-button-secondary" href="/admin/users">
              Reset
            </Link>
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{total.toLocaleString("en-NG")} matching users</h2>
        </div>
        <AdminDataTable
          caption="NounCompass users"
          columns={columns}
          rows={users}
          rowKey={(user) => user.user_id}
        />
        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          buildHref={buildHref}
        />
      </section>
    </>
  );
}
