import { notFound } from "next/navigation";
import {
  AdminDataTable,
  AdminPageHeader,
  type AdminColumn,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";

const sections = {
  terms: {
    title: "Academic terms",
    description: "Versioned academic-term sources used by the schedule workflow.",
    table: "academic_terms",
    columns: "id,name,session_code,status,source_url,created_at",
  },
  notices: {
    title: "Notices",
    description: "Student notices and their publication windows.",
    table: "notices",
    columns: "id,title,status,starts_at,expires_at,created_at",
  },
} as const;

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  await requirePermission("schedules.write", "/admin");
  const section = (await params).section;
  const config = sections[section as keyof typeof sections];
  if (!config) notFound();
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data, error } = await admin
    .from(config.table)
    .select(config.columns)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const columns: AdminColumn<Record<string, unknown>>[] = config.columns
    .split(",")
    .slice(1)
    .map((column) => ({
      key: column,
      header: column.replaceAll("_", " "),
      render: (row) =>
        row[column] == null
          ? "—"
          : column.endsWith("_at")
            ? formatAdminDate(String(row[column]))
            : String(row[column]),
    }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Academic operations data"
        title={config.title}
        description={config.description}
      />
      <section className="admin-panel">
        <AdminDataTable
          caption={config.title}
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
          emptyTitle={`No ${config.title.toLowerCase()}`}
          emptyDescription="No records are currently available for this operational section."
        />
      </section>
    </>
  );
}
