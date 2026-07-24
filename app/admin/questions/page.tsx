import Link from "next/link";
import {
  AdminFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { safePage } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  changeQuestionStatus,
  createQuestion,
  importQuestionCsv,
  publishQuestionBank,
} from "../actions";

type QuestionVersion = {
  prompt: string;
  explanation: string;
  source_unit: string;
  source_page: string | null;
  version: number;
  question_options: Array<{
    label: string;
    option_text: string;
    is_correct: boolean;
    position: number;
  }>;
};

const PAGE_SIZE = 25;

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("questions.read", "/admin/questions");
  const params = await searchParams;
  const page = safePage(params.page);
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data: banks } = await admin
    .from("question_banks")
    .select("id,course_code,course_title,status")
    .order("course_code");
  let questionQuery = admin
    .from("questions")
    .select(
      "id,bank_id,topic,learning_objective,difficulty,status,sample,current_version,created_at,question_banks(course_code),question_versions(prompt,explanation,source_unit,source_page,version,question_options(label,option_text,is_correct,position))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (params.status && ["draft", "review", "published", "retired"].includes(params.status)) {
    questionQuery = questionQuery.eq("status", params.status);
  }
  if (params.bank && banks?.some((bank) => bank.id === params.bank)) {
    questionQuery = questionQuery.eq("bank_id", params.bank);
  }
  if (params.q?.trim()) {
    const query = params.q.trim().replaceAll(",", " ");
    questionQuery = questionQuery.or(
      `topic.ilike.%${query}%,learning_objective.ilike.%${query}%`,
    );
  }
  const [{ data: questions, count, error }, { data: inventory }, { data: reports }] =
    await Promise.all([
      questionQuery,
      admin.from("questions").select("id,bank_id,status,sample"),
      admin.from("question_reports").select("question_id,status"),
    ]);
  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, currentValue]) => {
      if (currentValue && !["page", "error", "notice"].includes(key)) {
        next.set(key, currentValue);
      }
    });
    next.set("page", String(targetPage));
    return `/admin/questions?${next.toString()}`;
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Academic review workflow"
        title="Question banks"
        description="Draft original questions, review source and answer integrity, resolve student reports, and publish only content that passes the existing release gates."
      />
      <AdminFeedback
        error={params.error || (error ? error.message : undefined)}
        notice={params.notice}
      />
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label>
            Topic or objective
            <input name="q" defaultValue={params.q ?? ""} />
          </label>
          <label>
            Bank
            <select name="bank" defaultValue={params.bank ?? ""}>
              <option value="">All banks</option>
              {banks?.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.course_code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={params.status ?? ""}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Under review</option>
              <option value="published">Published</option>
              <option value="retired">Retired</option>
            </select>
          </label>
          <div className="admin-filter-actions">
            <button className="admin-button" type="submit">Apply</button>
            <Link className="admin-button admin-button-secondary" href="/admin/questions">Reset</Link>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <details>
          <summary>Import draft questions from CSV</summary>
          <p>Imports never publish content. Every valid row enters the draft queue.</p>
          <p><a href="/templates/question-import-template.csv" download>Download the import template</a></p>
          <form action={importQuestionCsv} className="admin-form">
            <label>
              CSV content
              <textarea name="csv" rows={12} required placeholder="Paste the completed question-import CSV here" />
            </label>
            <button className="admin-button" type="submit">Validate and import drafts</button>
          </form>
        </details>
      </section>

      <section className="admin-panel">
        <details>
          <summary>Create one draft question</summary>
          <form action={createQuestion} className="admin-form">
            <div className="admin-form-row">
              <label>
                Course bank
                <select name="courseCode" required>
                  {banks?.map((bank) => (
                    <option key={bank.id} value={bank.course_code}>
                      {bank.course_code} — {bank.course_title}
                    </option>
                  ))}
                </select>
              </label>
              <label>Topic<input name="topic" required /></label>
              <label>Learning objective<input name="learningObjective" required /></label>
              <label>
                Difficulty
                <select name="difficulty" defaultValue="1">
                  <option value="1">Foundational</option>
                  <option value="2">Applied</option>
                  <option value="3">Challenging</option>
                </select>
              </label>
              <label>Source unit<input name="sourceUnit" required /></label>
              <label>Source page<input name="sourcePage" /></label>
            </div>
            <label>Original question prompt<textarea name="prompt" rows={4} minLength={12} required /></label>
            <div className="admin-form-row">
              {["A", "B", "C", "D"].map((label) => (
                <label key={label}>Option {label}<input name={`option${label}`} required /></label>
              ))}
            </div>
            <div className="admin-form-row">
              <label>
                Correct option
                <select name="correctLabel" defaultValue="A">
                  {["A", "B", "C", "D"].map((label) => <option key={label}>{label}</option>)}
                </select>
              </label>
              <label><span>Free diagnostic sample</span><input type="checkbox" name="sample" /></label>
            </div>
            <label>Explanation<textarea name="explanation" rows={5} minLength={20} required /></label>
            <button className="admin-button" type="submit">Create draft</button>
          </form>
        </details>
      </section>

      <section className="admin-panel">
        <h2>Bank readiness and release gates</h2>
        <div className="platform-ticket-list">
          {banks?.map((bank) => {
            const bankQuestions = (inventory ?? []).filter(
              (question) => question.bank_id === bank.id,
            );
            const published = bankQuestions.filter(
              (question) => question.status === "published",
            ).length;
            const samples = bankQuestions.filter(
              (question) => question.status === "published" && question.sample,
            ).length;
            const bankQuestionIds = new Set(
              bankQuestions.map((question) => question.id),
            );
            const reportCount = (reports ?? []).filter((report) =>
              bankQuestionIds.has(report.question_id),
            ).length;
            return (
              <article key={bank.id}>
                <div>
                  <strong>{bank.course_code} — {bank.course_title}</strong>
                  <AdminStatusBadge value={bank.status} />
                </div>
                <small>
                  {published}/100 approved · {samples}/15 approved samples ·{" "}
                  {bankQuestions.length} total · {reportCount} reports
                </small>
                <form action={publishQuestionBank}>
                  <input type="hidden" name="bankId" value={bank.id} />
                  <button
                    className="admin-button admin-button-small"
                    type="submit"
                    disabled={published < 100 || samples < 15}
                  >
                    Run integrity gate and publish bank
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{(count ?? 0).toLocaleString("en-NG")} matching questions</h2>
        </div>
        <div className="platform-ticket-list">
          {questions?.map((question) => {
            const versions = question.question_versions as unknown as QuestionVersion[];
            const version =
              versions?.find((item) => item.version === question.current_version) ??
              versions?.[0];
            const bank = question.question_banks as unknown as
              | { course_code: string }
              | null;
            const reportCount = (reports ?? []).filter(
              (report) =>
                report.question_id === question.id &&
                ["open", "reviewing"].includes(report.status),
            ).length;
            return (
              <article key={question.id}>
                <div>
                  <strong>{bank?.course_code ?? "Course"}: {version?.prompt ?? question.topic}</strong>
                  <span><AdminStatusBadge value={question.status} /></span>
                </div>
                <small>
                  {question.topic} · difficulty {question.difficulty}
                  {question.sample ? " · sample" : ""}
                  {reportCount ? ` · ${reportCount} unresolved reports` : ""}
                </small>
                <div className="admin-inline-actions">
                  <Link href={`/admin/questions/${question.id}`}>Open question</Link>
                  {question.status === "draft" ? (
                    <form action={changeQuestionStatus}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <input type="hidden" name="status" value="review" />
                      <button type="submit">Submit for review</button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}
          {!questions?.length ? <p>No questions match the current filters.</p> : null}
        </div>
        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={count ?? 0}
          buildHref={buildHref}
        />
      </section>
    </>
  );
}
