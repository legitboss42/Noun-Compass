import { createAdminClient } from "@/lib/supabase/admin";

const metrics = [
  ["profiles", "Students"], ["memberships", "Memberships"], ["question_banks", "Question banks"],
  ["questions", "Questions"], ["support_tickets", "Support tickets"], ["payment_attempts", "Payment attempts"],
] as const;

export default async function AdminPage() {
  const admin = createAdminClient();
  const counts = admin ? await Promise.all(metrics.map(async ([table, label]) => { const { count } = await admin.from(table).select("*", { count: "exact", head: true }); return { label, count: count ?? 0 }; })) : metrics.map(([, label]) => ({ label, count: 0 }));
  const { data: openTickets } = await admin?.from("support_tickets").select("id,subject,status,created_at").in("status", ["open", "in-progress"]).order("created_at").limit(5) ?? { data: [] };
  return <><header className="platform-heading"><div><span className="eyebrow">Operations overview</span><h1>NounCompass administration</h1><p>Review content, schedules, payments, support, and access changes without exposing private platform routes to search engines.</p></div></header><section className="platform-stat-grid">{counts.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.count}</strong><small>Current database records</small></article>)}</section><section className="platform-panel"><h2>Open support work</h2>{openTickets?.length ? <div className="platform-ticket-list">{openTickets.map((ticket) => <article key={ticket.id}><div><strong>{ticket.subject}</strong><span>{ticket.status}</span></div><small>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(ticket.created_at))}</small></article>)}</div> : <p>No open tickets.</p>}</section></>;
}
