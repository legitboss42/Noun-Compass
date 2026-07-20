import { createAdminClient } from "@/lib/supabase/admin";
import { localDatabase, localPilotEnabled } from "./local-pilot";
import { membershipIsActive } from "./membership";
import { nextRevisionState } from "./revision";
import { scoreSession, selectBalancedQuestionSet, shuffledOptions, timedMockExpiresAt, TIMED_MOCK_MINUTES } from "./practice";

export type PracticeMode = "diagnostic" | "practice" | "timed-mock" | "revision";
export type StartInput = { courseCode: string; mode: PracticeMode; module?: string; unit?: string; difficulty?: number; questionCount?: number };
export type PublicOption = { id: string; label: string; text: string };
export type PublicQuestion = { id: string; questionId: string; prompt: string; topic: string; module: string | null; unit: string | null; difficulty: number; options: PublicOption[] };
export type StartResult = { session: { id: string; mode: PracticeMode; courseCode: string; courseTitle: string; expiresAt: string | null; timeLimitMinutes: number | null }; questions: PublicQuestion[] };
export type AnswerResult = { correct: boolean | null; explanation: string | null };
export type ReviewItem = { questionId: string; questionVersionId: string; prompt: string; explanation: string; correct: boolean; selectedAnswer: string; correctAnswer: string };
export type CompleteResult = { correct: number; answered: number; total: number; score: number; review: ReviewItem[] };
export type DashboardResult = { banks: Array<{ course_code: string; course_title: string }>; premium: boolean; dueCount: number; sessions: Array<Record<string, unknown>> };

export class StoreError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export interface QuestionStore {
  start(userId: string, input: StartInput): Promise<StartResult>;
  answer(userId: string, sessionId: string, input: { questionVersionId: string; selectedOptionId: string; durationMs: number }): Promise<AnswerResult>;
  complete(userId: string, sessionId: string): Promise<CompleteResult>;
  dashboard(userId: string): Promise<DashboardResult>;
  setBookmark(userId: string, questionId: string, bookmarked: boolean): Promise<void>;
  report(userId: string, input: { questionId: string; questionVersionId: string; sessionId?: string; reportType: string; details?: string }): Promise<void>;
}

function sessionLimit(input: StartInput) {
  const fixed = input.mode === "diagnostic" ? 15 : input.mode === "timed-mock" ? 40 : 20;
  return Math.max(1, Math.min(input.questionCount ?? fixed, fixed));
}

function mapOptions(options: Array<{ id: string; question_version_id: string; label: string; option_text: string }>, versionId: string) {
  return shuffledOptions(options.filter((option) => option.question_version_id === versionId)).map((option) => ({ id: option.id, label: option.label, text: option.option_text }));
}

class SupabaseQuestionStore implements QuestionStore {
  private admin() {
    const client = createAdminClient();
    if (!client) throw new StoreError("Practice database is not configured.", 503);
    return client;
  }

  async start(userId: string, input: StartInput): Promise<StartResult> {
    const admin = this.admin();
    const { data: membership } = await admin.from("memberships").select("status,ends_at").eq("user_id", userId).order("ends_at", { ascending: false }).limit(1).maybeSingle();
    const premium = membershipIsActive(membership?.status, membership?.ends_at);
    if (input.mode !== "diagnostic" && !premium) throw new StoreError("A current semester pass is required for full practice, revision, and timed mocks.", 403);
    const { data: bank } = await admin.from("question_banks").select("id,course_code,course_title").eq("course_code", input.courseCode).eq("status", "published").maybeSingle();
    if (!bank) throw new StoreError("This bank is still in editorial review.", 404);
    if (input.mode === "diagnostic" && !premium) {
      const { count } = await admin.from("practice_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("bank_id", bank.id).eq("mode", "diagnostic");
      if ((count ?? 0) >= 1) throw new StoreError("The free diagnostic for this course has already been used.", 403);
    }
    let dueIds: string[] | null = null;
    if (input.mode === "revision") {
      const { data } = await admin.from("revision_state").select("question_id").eq("user_id", userId).lte("due_at", new Date().toISOString()).limit(100);
      dueIds = (data ?? []).map((item) => item.question_id);
      if (!dueIds.length) throw new StoreError("No revision questions are due yet.", 404);
    }
    let query = admin.from("questions").select("id,current_version,topic,difficulty,module_label,unit_label,concept_key").eq("bank_id", bank.id).eq("status", "published");
    if (input.mode === "diagnostic" && !premium) query = query.eq("sample", true);
    if (dueIds) query = query.in("id", dueIds);
    if (input.module) query = query.eq("module_label", input.module);
    if (input.unit) query = query.eq("unit_label", input.unit);
    if (input.difficulty) query = query.eq("difficulty", input.difficulty);
    const { data: available, error } = await query.limit(500);
    if (error || !available?.length) throw new StoreError("No reviewed questions are available for these filters.", 404);
    const questions = selectBalancedQuestionSet(available, sessionLimit(input));
    const { data: versions } = await admin.from("question_versions").select("id,question_id,version,prompt").in("question_id", questions.map((question) => question.id));
    const current = (versions ?? []).filter((version) => questions.some((question) => question.id === version.question_id && question.current_version === version.version));
    const { data: options } = await admin.from("question_options").select("id,question_version_id,label,option_text").in("question_version_id", current.map((version) => version.id));
    const storedMode = input.mode === "revision" ? "practice" : input.mode;
    const { data: session, error: sessionError } = await admin.from("practice_sessions").insert({ user_id: userId, bank_id: bank.id, mode: storedMode, question_count: current.length }).select("id,started_at").single();
    if (sessionError || !session) throw new StoreError("Could not create the practice session.", 500);
    await admin.from("practice_session_questions").insert(current.map((version, index) => ({ session_id: session.id, question_version_id: version.id, position: index + 1 })));
    return {
      session: { id: session.id, mode: input.mode, courseCode: bank.course_code, courseTitle: bank.course_title, expiresAt: input.mode === "timed-mock" ? timedMockExpiresAt(session.started_at).toISOString() : null, timeLimitMinutes: input.mode === "timed-mock" ? TIMED_MOCK_MINUTES : null },
      questions: current.map((version) => { const question = questions.find((item) => item.id === version.question_id)!; return { id: version.id, questionId: question.id, prompt: version.prompt, topic: question.topic, module: question.module_label, unit: question.unit_label, difficulty: question.difficulty, options: mapOptions(options ?? [], version.id) }; }),
    };
  }

  async answer(userId: string, sessionId: string, input: { questionVersionId: string; selectedOptionId: string; durationMs: number }): Promise<AnswerResult> {
    const admin = this.admin();
    const { data: session } = await admin.from("practice_sessions").select("id,user_id,mode,status,started_at").eq("id", sessionId).maybeSingle();
    if (!session || session.user_id !== userId || session.status !== "active") throw new StoreError("This practice session is not active.", 403);
    if (session.mode === "timed-mock" && Date.now() >= timedMockExpiresAt(session.started_at).getTime()) throw new StoreError("Time has ended. Finish the mock to see your result.", 408);
    const { data: assignment } = await admin.from("practice_session_questions").select("question_version_id").eq("session_id", sessionId).eq("question_version_id", input.questionVersionId).maybeSingle();
    if (!assignment) throw new StoreError("Question is not part of this session.", 400);
    const { data: option } = await admin.from("question_options").select("id,is_correct,question_version_id").eq("id", input.selectedOptionId).maybeSingle();
    if (!option || option.question_version_id !== input.questionVersionId) throw new StoreError("Invalid answer option.", 400);
    const { data: version } = await admin.from("question_versions").select("question_id,explanation").eq("id", input.questionVersionId).single();
    if (!version) throw new StoreError("Question version is unavailable.", 404);
    const { error } = await admin.from("practice_responses").insert({ session_id: sessionId, question_version_id: input.questionVersionId, selected_option_id: input.selectedOptionId, correct: option.is_correct, duration_ms: Math.max(0, Math.min(input.durationMs, 3600000)) });
    if (error?.code === "23505") throw new StoreError("This question has already been answered.", 409);
    if (error) throw new StoreError("The answer could not be saved.", 500);
    const { data: current } = await admin.from("revision_state").select("box").eq("user_id", userId).eq("question_id", version.question_id).maybeSingle();
    const next = nextRevisionState(current?.box ?? 1, option.is_correct);
    await admin.from("revision_state").upsert({ user_id: userId, question_id: version.question_id, box: next.box, due_at: next.dueAt.toISOString(), last_correct: option.is_correct, updated_at: new Date().toISOString() });
    return session.mode === "timed-mock" ? { correct: null, explanation: null } : { correct: option.is_correct, explanation: version.explanation };
  }

  async complete(userId: string, sessionId: string): Promise<CompleteResult> {
    const admin = this.admin();
    const { data: session } = await admin.from("practice_sessions").select("id,user_id,status,question_count").eq("id", sessionId).maybeSingle();
    if (!session || session.user_id !== userId) throw new StoreError("Session not found.", 404);
    const { data: responses } = await admin.from("practice_responses").select("question_version_id,selected_option_id,correct").eq("session_id", sessionId);
    const correct = (responses ?? []).filter((response) => response.correct).length;
    const answered = responses?.length ?? 0;
    const score = scoreSession(correct, session.question_count);
    if (session.status !== "completed") {
      await admin.from("practice_sessions").update({ status: "completed", completed_at: new Date().toISOString(), score }).eq("id", sessionId);
    }
    const versionIds = (responses ?? []).map((response) => response.question_version_id);
    if (!versionIds.length) return { correct, answered, total: session.question_count, score, review: [] };
    const [{ data: versions }, { data: options }] = await Promise.all([admin.from("question_versions").select("id,question_id,prompt,explanation").in("id", versionIds), admin.from("question_options").select("id,question_version_id,label,option_text,is_correct").in("question_version_id", versionIds)]);
    const review = (responses ?? []).map((response) => { const version = (versions ?? []).find((item) => item.id === response.question_version_id); const selected = (options ?? []).find((item) => item.id === response.selected_option_id); const expected = (options ?? []).find((item) => item.question_version_id === response.question_version_id && item.is_correct); return { questionId: version?.question_id ?? "", questionVersionId: response.question_version_id, prompt: version?.prompt ?? "Question", explanation: version?.explanation ?? "", correct: response.correct, selectedAnswer: selected ? `${selected.label}. ${selected.option_text}` : "Not answered", correctAnswer: expected ? `${expected.label}. ${expected.option_text}` : "Unavailable" }; });
    return { correct, answered, total: session.question_count, score, review };
  }

  async dashboard(userId: string): Promise<DashboardResult> {
    const admin = this.admin();
    const [{ data: banks }, { data: membership }, { count }, { data: sessions }] = await Promise.all([admin.from("question_banks").select("course_code,course_title").eq("status", "published").order("course_code"), admin.from("memberships").select("status,ends_at").eq("user_id", userId).order("ends_at", { ascending: false }).limit(1).maybeSingle(), admin.from("revision_state").select("question_id", { count: "exact", head: true }).eq("user_id", userId).lte("due_at", new Date().toISOString()), admin.from("practice_sessions").select("id,mode,status,score,question_count,started_at,completed_at,question_banks(course_code)").eq("user_id", userId).order("started_at", { ascending: false }).limit(10)]);
    return { banks: banks ?? [], premium: membershipIsActive(membership?.status, membership?.ends_at), dueCount: count ?? 0, sessions: (sessions ?? []) as Array<Record<string, unknown>> };
  }

  async setBookmark(userId: string, questionId: string, bookmarked: boolean) { const admin = this.admin(); if (bookmarked) await admin.from("question_bookmarks").upsert({ user_id: userId, question_id: questionId }); else await admin.from("question_bookmarks").delete().eq("user_id", userId).eq("question_id", questionId); }
  async report(userId: string, input: { questionId: string; questionVersionId: string; sessionId?: string; reportType: string; details?: string }) { const admin = this.admin(); const { error } = await admin.from("question_reports").insert({ user_id: userId, question_id: input.questionId, question_version_id: input.questionVersionId, session_id: input.sessionId ?? null, report_type: input.reportType, details: input.details ?? null }); if (error) throw new StoreError("Question report could not be saved.", 400); }
}

class PostgresQuestionStore implements QuestionStore {
  private sql() { return localDatabase(); }

  async start(userId: string, input: StartInput): Promise<StartResult> {
    const sql = this.sql();
    const banks = await sql`select id,course_code,course_title from public.question_banks where course_code=${input.courseCode} and status='published'`;
    if (!banks.length) throw new StoreError("This bank is still in editorial review.", 404);
    const bank = banks[0];
    let rows = await sql`select id,current_version,topic,difficulty,module_label,unit_label,concept_key from public.questions where bank_id=${bank.id} and status='published' and (${input.module ?? null}::text is null or module_label=${input.module ?? null}) and (${input.unit ?? null}::text is null or unit_label=${input.unit ?? null}) and (${input.difficulty ?? null}::smallint is null or difficulty=${input.difficulty ?? null})`;
    if (input.mode === "revision") rows = await sql`select q.id,q.current_version,q.topic,q.difficulty,q.module_label,q.unit_label,q.concept_key from public.questions q join public.revision_state r on r.question_id=q.id and r.user_id=${userId} where q.bank_id=${bank.id} and q.status='published' and r.due_at<=now()`;
    if (!rows.length) throw new StoreError("No reviewed questions are available for these filters.", 404);
    const questions = selectBalancedQuestionSet(rows, sessionLimit(input));
    const versions = await sql`select id,question_id,version,prompt from public.question_versions where question_id in ${sql(questions.map((question) => question.id))}`;
    const current = versions.filter((version) => questions.some((question) => question.id === version.question_id && question.current_version === version.version));
    const options = (current.length ? await sql`select id,question_version_id,label,option_text from public.question_options where question_version_id in ${sql(current.map((version) => version.id))}` : []) as unknown as Array<{ id: string; question_version_id: string; label: string; option_text: string }>;
    const storedMode = input.mode === "revision" ? "practice" : input.mode;
    const sessions = await sql`insert into public.practice_sessions(user_id,bank_id,mode,question_count) values(${userId},${bank.id},${storedMode},${current.length}) returning id,started_at`;
    await sql`insert into public.practice_session_questions ${sql(current.map((version, index) => ({ session_id: sessions[0].id, question_version_id: version.id, position: index + 1 })))} `;
    return { session: { id: sessions[0].id, mode: input.mode, courseCode: bank.course_code, courseTitle: bank.course_title, expiresAt: input.mode === "timed-mock" ? timedMockExpiresAt(sessions[0].started_at).toISOString() : null, timeLimitMinutes: input.mode === "timed-mock" ? TIMED_MOCK_MINUTES : null }, questions: current.map((version) => { const question = questions.find((item) => item.id === version.question_id)!; return { id: version.id, questionId: question.id, prompt: version.prompt, topic: question.topic, module: question.module_label, unit: question.unit_label, difficulty: question.difficulty, options: mapOptions(options, version.id) }; }) };
  }

  async answer(userId: string, sessionId: string, input: { questionVersionId: string; selectedOptionId: string; durationMs: number }): Promise<AnswerResult> {
    const sql = this.sql();
    const sessions = await sql`select id,user_id,mode,status,started_at from public.practice_sessions where id=${sessionId}`;
    const session = sessions[0];
    if (!session || session.user_id !== userId || session.status !== "active") throw new StoreError("This practice session is not active.", 403);
    if (session.mode === "timed-mock" && Date.now() >= timedMockExpiresAt(session.started_at).getTime()) throw new StoreError("Time has ended. Finish the mock to see your result.", 408);
    const assignments = await sql`select question_version_id from public.practice_session_questions where session_id=${sessionId} and question_version_id=${input.questionVersionId}`;
    if (!assignments.length) throw new StoreError("Question is not part of this session.", 400);
    const options = await sql`select id,is_correct,question_version_id from public.question_options where id=${input.selectedOptionId}`;
    const option = options[0]; if (!option || option.question_version_id !== input.questionVersionId) throw new StoreError("Invalid answer option.", 400);
    const versions = await sql`select question_id,explanation from public.question_versions where id=${input.questionVersionId}`; const version = versions[0];
    try { await sql`insert into public.practice_responses(session_id,question_version_id,selected_option_id,correct,duration_ms) values(${sessionId},${input.questionVersionId},${input.selectedOptionId},${option.is_correct},${Math.max(0,Math.min(input.durationMs,3600000))})`; } catch { throw new StoreError("This question has already been answered.", 409); }
    const current = await sql`select box from public.revision_state where user_id=${userId} and question_id=${version.question_id}`; const next = nextRevisionState(current[0]?.box ?? 1, option.is_correct);
    await sql`insert into public.revision_state(user_id,question_id,box,due_at,last_correct,updated_at) values(${userId},${version.question_id},${next.box},${next.dueAt},${option.is_correct},now()) on conflict(user_id,question_id) do update set box=excluded.box,due_at=excluded.due_at,last_correct=excluded.last_correct,updated_at=now()`;
    return session.mode === "timed-mock" ? { correct:null, explanation:null } : { correct:option.is_correct, explanation:version.explanation };
  }

  async complete(userId: string, sessionId: string): Promise<CompleteResult> {
    const sql=this.sql(); const sessions=await sql`select id,user_id,status,question_count from public.practice_sessions where id=${sessionId}`; const session=sessions[0]; if(!session||session.user_id!==userId) throw new StoreError("Session not found.",404);
    const responses=await sql`select question_version_id,selected_option_id,correct from public.practice_responses where session_id=${sessionId}`; const correct=responses.filter((item)=>item.correct).length; const answered=responses.length; const score=scoreSession(correct,session.question_count); if(session.status!=="completed") await sql`update public.practice_sessions set status='completed',completed_at=now(),score=${score} where id=${sessionId}`;
    if(!responses.length) return {correct,answered,total:session.question_count,score,review:[]}; const ids=responses.map((item)=>item.question_version_id); const versions=await sql`select id,question_id,prompt,explanation from public.question_versions where id in ${sql(ids)}`; const options=await sql`select id,question_version_id,label,option_text,is_correct from public.question_options where question_version_id in ${sql(ids)}`;
    return {correct,answered,total:session.question_count,score,review:responses.map((response)=>{const version=versions.find((item)=>item.id===response.question_version_id);const selected=options.find((item)=>item.id===response.selected_option_id);const expected=options.find((item)=>item.question_version_id===response.question_version_id&&item.is_correct);return {questionId:version?.question_id??"",questionVersionId:response.question_version_id,prompt:version?.prompt??"Question",explanation:version?.explanation??"",correct:response.correct,selectedAnswer:selected?`${selected.label}. ${selected.option_text}`:"Not answered",correctAnswer:expected?`${expected.label}. ${expected.option_text}`:"Unavailable"};})};
  }

  async dashboard(userId:string):Promise<DashboardResult>{const sql=this.sql();const banks=await sql`select course_code,course_title from public.question_banks where status='published' order by course_code`;const due=await sql`select count(*)::int count from public.revision_state where user_id=${userId} and due_at<=now()`;const sessions=await sql`select s.id,s.mode,s.status,s.score,s.question_count,s.started_at,s.completed_at,json_build_object('course_code',b.course_code) question_banks from public.practice_sessions s join public.question_banks b on b.id=s.bank_id where s.user_id=${userId} order by s.started_at desc limit 10`;return {banks:banks.map((row)=>({course_code:row.course_code,course_title:row.course_title})),premium:true,dueCount:due[0]?.count??0,sessions};}
  async setBookmark(userId:string,questionId:string,bookmarked:boolean){const sql=this.sql();if(bookmarked)await sql`insert into public.question_bookmarks(user_id,question_id) values(${userId},${questionId}) on conflict do nothing`;else await sql`delete from public.question_bookmarks where user_id=${userId} and question_id=${questionId}`;}
  async report(userId:string,input:{questionId:string;questionVersionId:string;sessionId?:string;reportType:string;details?:string}){const sql=this.sql();await sql`insert into public.question_reports(user_id,question_id,question_version_id,session_id,report_type,details) values(${userId},${input.questionId},${input.questionVersionId},${input.sessionId??null},${input.reportType},${input.details??null})`;}
}

export function createQuestionStore(): QuestionStore {
  return process.env.LOCAL_PILOT === "true" && localPilotEnabled() ? new PostgresQuestionStore() : new SupabaseQuestionStore();
}
