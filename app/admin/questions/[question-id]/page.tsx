import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminConfirmationFields,
  AdminFeedback,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { requirePermission } from "@/lib/platform/admin-auth";
import { formatAdminDate } from "@/lib/platform/admin-format";
import { createAdminClient } from "@/lib/supabase/admin";
import { changeQuestionStatus } from "../../actions";
import {
  requestQuestionChanges,
  resolveQuestionReport,
  updateQuestionDraft,
} from "../actions";

type Version = {
  id: string;
  version: number;
  prompt: string;
  explanation: string;
  source_unit: string;
  source_page: string | null;
  created_at: string;
  question_options: Array<{
    label: string;
    option_text: string;
    is_correct: boolean;
    position: number;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminQuestionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ "question-id": string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requirePermission("questions.read", "/admin/questions");
  const questionId = (await params)["question-id"];
  const feedback = await searchParams;
  const admin = createAdminClient();
  if (!admin) throw new Error("Platform database is not configured.");
  const { data: question } = await admin
    .from("questions")
    .select(
      "id,bank_id,topic,learning_objective,difficulty,status,sample,current_version,created_at,reviewed_at,question_banks(course_code,course_title),question_versions(id,version,prompt,explanation,source_unit,source_page,created_at,question_options(label,option_text,is_correct,position))",
    )
    .eq("id", questionId)
    .maybeSingle();
  if (!question) notFound();
  const [{ data: reports }, { data: reviews }, { data: audit }] = await Promise.all([
    admin
      .from("question_reports")
      .select("id,user_id,question_version_id,report_type,details,status,resolution_notes,created_at,reviewed_at")
      .eq("question_id", questionId)
      .order("created_at", { ascending: false }),
    admin
      .from("content_reviews")
      .select("id,decision,notes,reviewer_id,created_at")
      .eq("entity_type", "question")
      .eq("entity_id", questionId)
      .order("created_at", { ascending: false }),
    admin
      .from("audit_logs")
      .select("id,action,reason,created_at")
      .eq("entity_type", "question")
      .eq("entity_id", questionId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const versions = (
    question.question_versions as unknown as Version[]
  ).sort((left, right) => right.version - left.version);
  const current =
    versions.find((version) => version.version === question.current_version) ??
    versions[0];
  const bank = question.question_banks as unknown as {
    course_code: string;
    course_title: string;
  } | null;
  const currentOptions = [...(current?.question_options ?? [])].sort(
    (left, right) => left.position - right.position,
  );

  return (
    <>
      <AdminPageHeader
        eyebrow={`${bank?.course_code ?? "Question bank"} · version ${question.current_version}`}
        title={current?.prompt || question.topic}
        description={`${question.topic} · ${bank?.course_title || "Course title unavailable"}`}
        actions={
          <Link className="admin-button admin-button-secondary" href="/admin/questions">
            Back to questions
          </Link>
        }
      />
      <AdminFeedback error={feedback.error} notice={feedback.notice} />
      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Question details</h2>
          <dl className="admin-detail-list">
            <div><dt>Status</dt><dd><AdminStatusBadge value={question.status} /></dd></div>
            <div><dt>Course</dt><dd>{bank?.course_code} — {bank?.course_title}</dd></div>
            <div><dt>Objective</dt><dd>{question.learning_objective}</dd></div>
            <div><dt>Difficulty</dt><dd>{question.difficulty}</dd></div>
            <div><dt>Sample</dt><dd>{question.sample ? "Free diagnostic sample" : "Premium bank question"}</dd></div>
            <div><dt>Source</dt><dd>{current?.source_unit}{current?.source_page ? `, page ${current.source_page}` : ""}</dd></div>
          </dl>
          <ol>
            {currentOptions.map((option) => (
              <li key={option.label}>
                <strong>{option.label}{option.is_correct ? " (correct)" : ""}:</strong>{" "}
                {option.option_text}
              </li>
            ))}
          </ol>
          <p><strong>Explanation:</strong> {current?.explanation}</p>
        </section>

        <section className="admin-panel">
          <h2>Editorial workflow</h2>
          {question.status === "draft" ? (
            <form className="admin-form" action={changeQuestionStatus}>
              <input type="hidden" name="questionId" value={questionId} />
              <input type="hidden" name="status" value="review" />
              <button className="admin-button" type="submit">Submit for review</button>
            </form>
          ) : null}
          {question.status === "review" ? (
            <>
              <form className="admin-form" action={changeQuestionStatus}>
                <input type="hidden" name="questionId" value={questionId} />
                <input type="hidden" name="status" value="published" />
                <AdminConfirmationFields phrase="PUBLISH" />
                <button className="admin-button" type="submit">Approve and publish</button>
              </form>
              <form className="admin-form" action={requestQuestionChanges}>
                <input type="hidden" name="questionId" value={questionId} />
                <label>Required changes<textarea name="reason" minLength={5} rows={4} required /></label>
                <button className="admin-button admin-button-secondary" type="submit">Return to draft</button>
              </form>
            </>
          ) : null}
          {question.status === "published" ? (
            <form className="admin-form" action={changeQuestionStatus}>
              <input type="hidden" name="questionId" value={questionId} />
              <input type="hidden" name="status" value="retired" />
              <AdminConfirmationFields phrase="RETIRE" />
              <button className="admin-button admin-button-danger" type="submit">Retire question</button>
            </form>
          ) : null}
          {question.status === "retired" ? (
            <p className="admin-warning">Retired questions remain in version and audit history and are not exposed to students.</p>
          ) : null}
        </section>
      </div>

      {question.status === "draft" && current ? (
        <section className="admin-panel">
          <h2>Create a new draft version</h2>
          <p>The existing version remains in history. Saving creates version {question.current_version + 1}.</p>
          <form className="admin-form" action={updateQuestionDraft}>
            <input type="hidden" name="questionId" value={questionId} />
            <div className="admin-form-row">
              <label>Topic<input name="topic" defaultValue={question.topic} required /></label>
              <label>Learning objective<input name="learningObjective" defaultValue={question.learning_objective} required /></label>
              <label>
                Difficulty
                <select name="difficulty" defaultValue={String(question.difficulty)}>
                  <option value="1">Foundational</option>
                  <option value="2">Applied</option>
                  <option value="3">Challenging</option>
                </select>
              </label>
              <label>Source unit<input name="sourceUnit" defaultValue={current.source_unit} required /></label>
              <label>Source page<input name="sourcePage" defaultValue={current.source_page || ""} /></label>
              <label><span>Free diagnostic sample</span><input name="sample" type="checkbox" defaultChecked={question.sample} /></label>
            </div>
            <label>Prompt<textarea name="prompt" defaultValue={current.prompt} minLength={12} rows={5} required /></label>
            <div className="admin-form-row">
              {["A", "B", "C", "D"].map((label) => (
                <label key={label}>
                  Option {label}
                  <input
                    name={`option${label}`}
                    defaultValue={currentOptions.find((option) => option.label === label)?.option_text || ""}
                    required
                  />
                </label>
              ))}
            </div>
            <label>
              Correct answer
              <select
                name="correctLabel"
                defaultValue={currentOptions.find((option) => option.is_correct)?.label || "A"}
              >
                {["A", "B", "C", "D"].map((label) => <option key={label}>{label}</option>)}
              </select>
            </label>
            <label>Explanation<textarea name="explanation" defaultValue={current.explanation} minLength={20} rows={6} required /></label>
            <button className="admin-button" type="submit">Save new draft version</button>
          </form>
        </section>
      ) : null}

      <section className="admin-panel">
        <h2>Student reports</h2>
        <div className="platform-ticket-list">
          {(reports ?? []).map((report) => (
            <article key={report.id}>
              <div>
                <strong>{report.report_type.replaceAll("_", " ")}</strong>
                <AdminStatusBadge value={report.status} />
              </div>
              <p>{report.details || "No additional details were submitted."}</p>
              <small>{formatAdminDate(report.created_at)} · version {report.question_version_id}</small>
              <form className="admin-form" action={resolveQuestionReport}>
                <input type="hidden" name="questionId" value={questionId} />
                <input type="hidden" name="reportId" value={report.id} />
                <label>
                  Decision
                  <select name="status" defaultValue={report.status}>
                    <option value="reviewing">Under review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </label>
                <label>Resolution note<textarea name="reason" defaultValue={report.resolution_notes || ""} minLength={5} rows={3} required /></label>
                <label>
                  Type DISMISS only when dismissing a report
                  <input name="confirmation" />
                </label>
                <button className="admin-button admin-button-small" type="submit">Update report</button>
              </form>
            </article>
          ))}
          {!reports?.length ? <p>No student reports are linked to this question.</p> : null}
        </div>
      </section>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <h2>Version history</h2>
          <div className="admin-timeline">
            {versions.map((version) => (
              <article key={version.id}>
                <strong>Version {version.version}{version.version === question.current_version ? " · current" : ""}</strong>
                <span>{version.prompt}</span>
                <small>{formatAdminDate(version.created_at)}</small>
              </article>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <h2>Review and audit history</h2>
          <div className="admin-timeline">
            {(reviews ?? []).map((review) => (
              <article key={`review-${review.id}`}>
                <strong>{review.decision.replaceAll("-", " ")}</strong>
                <span>{review.notes || "No editorial note"}</span>
                <small>{formatAdminDate(review.created_at)}</small>
              </article>
            ))}
            {(audit ?? []).map((entry) => (
              <article key={`audit-${entry.id}`}>
                <strong>{entry.action}</strong>
                <span>{entry.reason || "No reason required"}</span>
                <small>{formatAdminDate(entry.created_at)}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
