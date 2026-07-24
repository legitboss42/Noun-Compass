import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminFeedback,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  formatAdminCurrency,
  formatAdminDate,
} from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addSupportMessage,
  assignSupportTicket,
  updateSupportPriority,
  updateSupportStatus,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function SupportTicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ "ticket-id": string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requirePermission("support.read", "/admin/support");
  const ticketId = (await params)["ticket-id"];
  const feedback = await searchParams;
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data: ticket } = await admin
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();
  if (!ticket) notFound();

  const [
    { data: user },
    { data: profile },
    { data: messages },
    { data: payments },
    { data: memberships },
    { data: history },
    { data: staffRoles },
  ] = await Promise.all([
    admin.auth.admin.getUserById(ticket.user_id),
    admin
      .from("profiles")
      .select("display_name,programme,level")
      .eq("id", ticket.user_id)
      .maybeSingle(),
    admin
      .from("support_messages")
      .select("id,sender_id,body,internal_note,created_at")
      .eq("ticket_id", ticketId)
      .order("created_at"),
    admin
      .from("payment_attempts")
      .select("id,reference,amount_kobo,currency,status,created_at")
      .eq("user_id", ticket.user_id)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("memberships")
      .select("id,plan_key,status,starts_at,ends_at")
      .eq("user_id", ticket.user_id)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("support_ticket_history")
      .select("id,actor_id,action,previous_value,new_value,reason,created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false }),
    admin
      .from("user_roles")
      .select("user_id,role")
      .in("role", ["support_agent", "super_admin"]),
  ]);
  const staffIds = [...new Set((staffRoles ?? []).map((row) => row.user_id))];
  const { data: authUsers } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const staff = authUsers.users.filter((candidate) =>
    staffIds.includes(candidate.id),
  );
  const ticketNumber = `NC-${ticket.id.replaceAll("-", "").slice(0, 10).toUpperCase()}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Support ticket"
        title={`${ticketNumber}: ${ticket.subject}`}
        description={`Created ${formatAdminDate(ticket.created_at)}. Student-facing replies and staff-only notes are clearly separated below.`}
        actions={
          <Link
            className="admin-button admin-button-secondary"
            href="/admin/support"
          >
            Back to queue
          </Link>
        }
      />
      <AdminFeedback error={feedback.error} notice={feedback.notice} />
      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Ticket and student</h2>
          <dl className="admin-detail-list">
            <div>
              <dt>Status</dt>
              <dd><AdminStatusBadge value={ticket.status} /></dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd><AdminStatusBadge value={ticket.priority} /></dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{ticket.category.replaceAll("-", " ")}</dd>
            </div>
            <div>
              <dt>Student</dt>
              <dd>{profile?.display_name || user.user?.email || ticket.user_id}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.user?.email || "Not available"}</dd>
            </div>
            <div>
              <dt>Programme</dt>
              <dd>{profile?.programme || "Not provided"}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{profile?.level ? `${profile.level} level` : "Not provided"}</dd>
            </div>
          </dl>
          <p>
            <Link href={`/admin/users/${ticket.user_id}`}>
              Open full user record
            </Link>
          </p>
        </section>
        <section className="admin-panel">
          <h2>Assignment and workflow</h2>
          <form className="admin-form" action={assignSupportTicket}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <label>
              Assigned staff
              <select name="assigneeId" defaultValue={ticket.assigned_to || ""}>
                <option value="">Unassigned</option>
                <option value="self">Assign to me</option>
                {staff.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.email || candidate.id}
                  </option>
                ))}
              </select>
            </label>
            <label>Reason<textarea name="reason" minLength={5} required rows={2} /></label>
            <button className="admin-button" type="submit">Update assignment</button>
          </form>
          <form className="admin-form" action={updateSupportPriority}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <label>
              Priority
              <select name="priority" defaultValue={ticket.priority}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label>Reason<textarea name="reason" minLength={5} required rows={2} /></label>
            <button className="admin-button admin-button-secondary" type="submit">Update priority</button>
          </form>
          <form className="admin-form" action={updateSupportStatus}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <label>
              Status
              <select name="status" defaultValue={ticket.status}>
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="waiting-on-student">Waiting on student</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label>Reason<textarea name="reason" minLength={5} required rows={2} /></label>
            <button className="admin-button admin-button-secondary" type="submit">Update status</button>
          </form>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>Conversation</h2></div>
        <div className="admin-conversation">
          {(messages ?? []).map((message) => (
            <article
              key={message.id}
              className={message.internal_note ? "admin-message admin-message-internal" : "admin-message"}
            >
              <strong>
                {message.internal_note
                  ? "Internal note — staff only"
                  : message.sender_id === ticket.user_id
                    ? "Student"
                    : "NounCompass support"}
              </strong>
              <p>{message.body}</p>
              <small>{formatAdminDate(message.created_at)}</small>
            </article>
          ))}
          {!messages?.length ? <p>No messages have been added to this ticket.</p> : null}
        </div>
        <div className="admin-grid-two">
          <form className="admin-form" action={addSupportMessage}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="kind" value="reply" />
            <label>
              Reply visible to the student
              <textarea name="body" minLength={2} maxLength={5000} rows={6} required />
            </label>
            <button className="admin-button" type="submit">Send reply</button>
          </form>
          <form className="admin-form" action={addSupportMessage}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="kind" value="internal" />
            <label>
              Internal note
              <textarea name="body" minLength={2} maxLength={5000} rows={6} required />
            </label>
            <p className="admin-warning">Internal notes are visible only to authorised staff.</p>
            <button className="admin-button admin-button-secondary" type="submit">Add internal note</button>
          </form>
        </div>
      </section>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Related payments</h2>
          {(payments ?? []).map((payment) => (
            <p key={payment.id}>
              <Link href={`/admin/payments?q=${payment.reference}`}>{payment.reference}</Link>
              {" · "}{formatAdminCurrency(payment.amount_kobo, payment.currency)}
              {" · "}<AdminStatusBadge value={payment.status} />
            </p>
          ))}
          {!payments?.length ? <p>No payment attempts are linked to this user.</p> : null}
        </section>
        <section className="admin-panel">
          <h2>Related memberships</h2>
          {(memberships ?? []).map((membership) => (
            <p key={membership.id}>
              <strong>{membership.plan_key}</strong>{" · "}
              <AdminStatusBadge value={membership.status} />
              <small> Ends {formatAdminDate(membership.ends_at)}</small>
            </p>
          ))}
          {!memberships?.length ? <p>No memberships are linked to this user.</p> : null}
        </section>
      </div>

      <section className="admin-panel">
        <h2>Status history</h2>
        <div className="admin-timeline">
          {(history ?? []).map((item) => (
            <article key={item.id}>
              <strong>{item.action.replaceAll(".", " ")}</strong>
              <span>{item.previous_value || "none"} → {item.new_value || "none"}</span>
              <small>{item.reason || "No reason recorded"} · {formatAdminDate(item.created_at)}</small>
            </article>
          ))}
          {!history?.length ? <p>No status changes have been recorded.</p> : null}
        </div>
      </section>
    </>
  );
}
