import { changeQuestionStatus, createQuestion, importQuestionCsv, publishQuestionBank } from "../actions";
import { createAdminClient } from "@/lib/supabase/admin";

type QuestionVersion = {
  prompt: string;
  explanation: string;
  source_unit: string;
  source_page: string | null;
  version: number;
  question_options: Array<{ label: string; option_text: string; is_correct: boolean; position: number }>;
};

export default async function AdminQuestionsPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [{ data: banks }, { data: questions }, { data: inventory }] = admin ? await Promise.all([
    admin.from("question_banks").select("id,course_code,course_title,status").order("course_code"),
    admin.from("questions").select("id,bank_id,topic,learning_objective,difficulty,status,sample,current_version,created_at,question_banks(course_code),question_versions(prompt,explanation,source_unit,source_page,version,question_options(label,option_text,is_correct,position))").order("created_at", { ascending: false }).limit(30),
    admin.from("questions").select("bank_id,status,sample"),
  ]) : [{ data: [] }, { data: [] }, { data: [] }];

  return <>
    <header className="platform-heading"><div><span className="eyebrow">Academic review workflow</span><h1>Question banks</h1><p>Import or draft original questions, review their source and answer integrity, and release each bank only after 100 approved questions including 15 free samples.</p></div></header>
    {params.error && <p className="form-message form-message-error">{params.error}</p>}
    {params.notice && <p className="form-message form-message-success">{params.notice}</p>}

    <section className="platform-panel">
      <div className="section-heading"><div><span className="eyebrow">Bulk drafting</span><h2>Import draft questions from CSV</h2></div><a href="/templates/question-import-template.csv" download>Download template</a></div>
      <p>Imports never publish content. Every valid row enters the draft queue and still requires a human reviewer.</p>
      <form action={importQuestionCsv} className="platform-form">
        <label>CSV content<textarea name="csv" rows={12} required placeholder="Paste the completed question-import CSV here" /></label>
        <button className="button" type="submit">Validate and import drafts</button>
      </form>
    </section>

    <section className="platform-panel"><h2>Create one draft question</h2><form action={createQuestion} className="platform-form"><div className="platform-form-grid"><label>Course bank<select name="courseCode" required>{banks?.map((bank) => <option key={bank.id} value={bank.course_code}>{bank.course_code} — {bank.course_title}</option>)}</select></label><label>Topic<input name="topic" required /></label><label>Learning objective<input name="learningObjective" required /></label><label>Difficulty<select name="difficulty" defaultValue="1"><option value="1">Foundational</option><option value="2">Applied</option><option value="3">Challenging</option></select></label><label>Source unit<input name="sourceUnit" required /></label><label>Source page<input name="sourcePage" /></label></div><label>Original question prompt<textarea name="prompt" rows={4} minLength={12} required /></label><div className="platform-form-grid">{["A", "B", "C", "D"].map((label) => <label key={label}>Option {label}<input name={`option${label}`} required /></label>)}</div><div className="platform-form-grid"><label>Correct option<select name="correctLabel" defaultValue="A">{["A", "B", "C", "D"].map((label) => <option key={label}>{label}</option>)}</select></label><label className="platform-check"><input type="checkbox" name="sample" />Free diagnostic sample</label></div><label>Explanation<textarea name="explanation" rows={5} minLength={20} required /></label><button className="button" type="submit">Create draft</button></form></section>

    <section className="platform-panel"><h2>Bank readiness and release gates</h2><div className="platform-ticket-list">{banks?.map((bank) => {
      const bankQuestions = (inventory ?? []).filter((question) => question.bank_id === bank.id);
      const published = bankQuestions.filter((question) => question.status === "published").length;
      const samples = bankQuestions.filter((question) => question.status === "published" && question.sample).length;
      return <article key={bank.id}><div><strong>{bank.course_code} — {bank.course_title}</strong><span>{bank.status}</span></div><small>{published}/100 approved · {samples}/15 approved samples · {bankQuestions.length} total records</small><form action={publishQuestionBank}><input type="hidden" name="bankId" value={bank.id} /><button type="submit" disabled={published < 100 || samples < 15}>Run integrity gate and publish</button></form></article>;
    })}</div></section>

    <section className="platform-panel"><h2>Recent review queue</h2><div className="platform-ticket-list">{questions?.map((question) => {
      const versions = question.question_versions as unknown as QuestionVersion[];
      const version = versions?.find((item) => item.version === question.current_version) ?? versions?.[0];
      const bank = question.question_banks as unknown as { course_code: string } | null;
      return <article key={question.id}><div><strong>{bank?.course_code ?? "Course"}: {version?.prompt ?? question.topic}</strong><span>{question.status}{question.sample ? " · sample" : ""}</span></div><small>{question.topic} · difficulty {question.difficulty} · objective: {question.learning_objective}</small>{version && <details><summary>Review source, options, and explanation</summary><p><strong>Source:</strong> {version.source_unit}{version.source_page ? `, page ${version.source_page}` : ""}</p><ol>{[...version.question_options].sort((a, b) => a.position - b.position).map((option) => <li key={option.label}><strong>{option.label}{option.is_correct ? " (correct)" : ""}:</strong> {option.option_text}</li>)}</ol><p><strong>Explanation:</strong> {version.explanation}</p></details>}<div className="admin-inline-actions">{question.status === "draft" && <form action={changeQuestionStatus}><input type="hidden" name="questionId" value={question.id} /><input type="hidden" name="status" value="review" /><button>Submit for review</button></form>}{question.status === "review" && <form action={changeQuestionStatus}><input type="hidden" name="questionId" value={question.id} /><input type="hidden" name="status" value="published" /><button>Approve</button></form>}{question.status === "published" && <form action={changeQuestionStatus}><input type="hidden" name="questionId" value={question.id} /><input type="hidden" name="status" value="retired" /><button>Retire</button></form>}</div></article>;
    })}</div></section>
  </>;
}
