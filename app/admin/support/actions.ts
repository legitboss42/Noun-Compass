"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/platform/audit";
import { requirePermission } from "@/lib/platform/admin-auth";
import {
  isSupportStatusTransitionAllowed,
  requireAdminReason,
} from "@/lib/platform/admin-workflows";
import { createAdminClient } from "@/lib/supabase/admin";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

function fail(ticketId: string, message: string): never {
  redirect(`/admin/support/${ticketId}?error=${encodeURIComponent(message)}`);
}
async function addHistory({
  ticketId,
  actorId,
  action,
  previousValue,
  newValue,
  reason,
}: {
  ticketId: string;
  actorId: string;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
}) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { error } = await admin.from("support_ticket_history").insert({
    ticket_id: ticketId,
    actor_id: actorId,
    action,
    previous_value: previousValue ?? null,
    new_value: newValue ?? null,
    reason: reason ?? null,
  });
  if (error) throw error;
}

export async function assignSupportTicket(formData: FormData) {
  const session = await requirePermission("support.manage", "/admin/support");
  const ticketId = value(formData, "ticketId");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    const requestedAssignee = value(formData, "assigneeId");
    const assigneeId =
      requestedAssignee === "self" ? session.user.id : requestedAssignee || null;
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    if (assigneeId) {
      const { data: staffRoles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", assigneeId);
      if (
        !staffRoles?.some((row) =>
          ["support_agent", "super_admin"].includes(row.role),
        )
      ) {
        throw new Error("Tickets can only be assigned to support staff.");
      }
    }
    const { data: before } = await admin
      .from("support_tickets")
      .select("assigned_to")
      .eq("id", ticketId)
      .maybeSingle();
    if (!before) throw new Error("Ticket was not found.");
    const { error } = await admin
      .from("support_tickets")
      .update({ assigned_to: assigneeId, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (error) throw error;
    await addHistory({
      ticketId,
      actorId: session.user.id,
      action: "assignment.changed",
      previousValue: before.assigned_to,
      newValue: assigneeId,
      reason,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "support.assigned",
      targetType: "support_ticket",
      targetId: ticketId,
      reason,
      previousState: before,
      resultingState: { assigned_to: assigneeId },
    });
  } catch (error) {
    fail(ticketId, error instanceof Error ? error.message : "Ticket assignment failed.");
  }
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  redirect(`/admin/support/${ticketId}?notice=Assignment+updated`);
}

export async function updateSupportStatus(formData: FormData) {
  const session = await requirePermission("support.manage", "/admin/support");
  const ticketId = value(formData, "ticketId");
  const status = value(formData, "status");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("support_tickets")
      .select("status")
      .eq("id", ticketId)
      .maybeSingle();
    if (!before) throw new Error("Ticket was not found.");
    if (!isSupportStatusTransitionAllowed(before.status, status)) {
      throw new Error(`Ticket cannot move from ${before.status} to ${status}.`);
    }
    const { error } = await admin
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (error) throw error;
    await addHistory({
      ticketId,
      actorId: session.user.id,
      action: "status.changed",
      previousValue: before.status,
      newValue: status,
      reason,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "support.status_changed",
      targetType: "support_ticket",
      targetId: ticketId,
      reason,
      previousState: before,
      resultingState: { status },
    });
  } catch (error) {
    fail(ticketId, error instanceof Error ? error.message : "Ticket status could not be changed.");
  }
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  redirect(`/admin/support/${ticketId}?notice=Ticket+status+updated`);
}

export async function updateSupportPriority(formData: FormData) {
  const session = await requirePermission("support.manage", "/admin/support");
  const ticketId = value(formData, "ticketId");
  const priority = value(formData, "priority");
  try {
    const reason = requireAdminReason(value(formData, "reason"));
    if (!["low", "normal", "high", "urgent"].includes(priority)) {
      throw new Error("Invalid ticket priority.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: before } = await admin
      .from("support_tickets")
      .select("priority")
      .eq("id", ticketId)
      .maybeSingle();
    if (!before) throw new Error("Ticket was not found.");
    const { error } = await admin
      .from("support_tickets")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (error) throw error;
    await addHistory({
      ticketId,
      actorId: session.user.id,
      action: "priority.changed",
      previousValue: before.priority,
      newValue: priority,
      reason,
    });
    await writeAuditLog({
      actorId: session.user.id,
      action: "support.priority_changed",
      targetType: "support_ticket",
      targetId: ticketId,
      reason,
      previousState: before,
      resultingState: { priority },
    });
  } catch (error) {
    fail(ticketId, error instanceof Error ? error.message : "Ticket priority could not be changed.");
  }
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  redirect(`/admin/support/${ticketId}?notice=Ticket+priority+updated`);
}

export async function addSupportMessage(formData: FormData) {
  const session = await requirePermission("support.manage", "/admin/support");
  const ticketId = value(formData, "ticketId");
  const internalNote = value(formData, "kind") === "internal";
  try {
    const body = value(formData, "body");
    if (body.length < 2 || body.length > 5000) {
      throw new Error("Message must contain 2 to 5,000 characters.");
    }
    const admin = createAdminClient();
    if (!admin) throw new Error("Platform database is not configured.");
    const { data: ticket } = await admin
      .from("support_tickets")
      .select("id,status")
      .eq("id", ticketId)
      .maybeSingle();
    if (!ticket) throw new Error("Ticket was not found.");
    const { data: message, error } = await admin
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: session.user.id,
        body,
        internal_note: internalNote,
      })
      .select("id,created_at")
      .single();
    if (error) throw error;
    await admin
      .from("support_tickets")
      .update({
        status:
          internalNote || ticket.status === "closed"
            ? ticket.status
            : "waiting-on-student",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    await writeAuditLog({
      actorId: session.user.id,
      action: internalNote ? "support.internal_note_added" : "support.reply_added",
      targetType: "support_ticket",
      targetId: ticketId,
      resultingState: { message_id: message.id, created_at: message.created_at },
      metadata: { internal_note: internalNote },
    });
  } catch (error) {
    fail(ticketId, error instanceof Error ? error.message : "Support message could not be added.");
  }
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  redirect(`/admin/support/${ticketId}?notice=${internalNote ? "Internal+note+added" : "Reply+sent"}`);
}
