import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const sections: Record<string, { title: string; table: string; columns: string }> = {
  terms: { title: "Academic terms", table: "academic_terms", columns: "id,name,session_code,status,source_url,created_at" },
  notices: { title: "Notices", table: "notices", columns: "id,title,status,starts_at,expires_at,created_at" },
  memberships: { title: "Memberships", table: "memberships", columns: "id,user_id,status,starts_at,ends_at,payment_reference,created_at" },
  payments: { title: "Payment attempts", table: "payment_attempts", columns: "id,reference,email,amount_kobo,currency,status,paid_at,created_at" },
  support: { title: "Support tickets", table: "support_tickets", columns: "id,subject,category,status,user_id,assigned_to,created_at" },
  "audit-log": { title: "Append-only audit log", table: "audit_logs", columns: "id,actor_id,action,entity_type,entity_id,created_at" },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const section = (await params).section;
  if (section === "users") {
    const admin = createAdminClient(); const { data } = await admin?.auth.admin.listUsers({ page: 1, perPage: 50 }) ?? { data: { users: [] } };
    return <><header className="platform-heading"><div><span className="eyebrow">Identity directory</span><h1>Users</h1><p>Authentication accounts are listed without passwords or provider secrets.</p></div></header><section className="platform-panel"><div className="platform-data-table">{data.users.map((user) => <article key={user.id}><strong>{user.email ?? "No email"}</strong><span>{user.email_confirmed_at ? "verified" : "unverified"}</span><small>Created {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(user.created_at))}</small></article>)}</div></section></>;
  }
  const config = sections[section]; if (!config) notFound();
  const admin = createAdminClient();
  const query = admin ? admin.from(config.table as never) : null;
  const result = query
    ? await query.select(config.columns).order("created_at", { ascending: false }).limit(100)
    : { data: [] };
  const rows = (result.data ?? []) as unknown as Record<string, unknown>[];
  return <><header className="platform-heading"><div><span className="eyebrow">Operations data</span><h1>{config.title}</h1><p>This view is protected by role checks and excluded from indexing.</p></div></header><section className="platform-panel"><div className="platform-data-table">{rows.map((row) => <article key={String(row.id)}>{Object.entries(row).filter(([key]) => key !== "id").map(([key, value]) => <p key={key}><strong>{key.replaceAll("_", " ")}</strong><span>{value == null ? "—" : String(value)}</span></p>)}</article>)}</div></section></>;
}
