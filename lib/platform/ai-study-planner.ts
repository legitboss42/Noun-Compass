import "server-only";

import { getAiProviderConfig } from "./ai-provider";
import { membershipIsActive } from "./membership";
import {
  buildDeterministicStudyPlan,
  normalizeStudyPlannerGenerationInput,
  parseAiStudyPlan,
  type StudyPlannerGenerationInput,
  type StudyPlanResult,
} from "./study-planner-ai-core";
import { studyPlannerCoursesForCodes } from "@/lib/study-planner-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { topicAccuracyFromQuestions } from "./ai-assistant-core";

const FREE_WEEKLY_GENERATIONS = 1;
const PREMIUM_WEEKLY_GENERATIONS = 7;

export class AiStudyPlannerError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "AiStudyPlannerError";
  }
}

function buildPrompt(input: StudyPlannerGenerationInput, adjustmentContext: string[]) {
  return `Create a realistic weekly study timetable for a NOUN distance-learning student.

Rules:
- Use only the registered courses and exact availability supplied below.
- Cover every course at least once.
- Do not place sessions outside a day's start time and available hours.
- Do not overlap sessions.
- Every session must use the student's selected ${input.sessionLengthMinutes}-minute duration.
- Give challenging and higher-unit courses proportionately more time.
- Avoid repeating the same course in consecutive sessions when possible.
- Do not invent deadlines, examination dates, course facts, or portal data.
- Return JSON only, without markdown.

JSON shape:
{
  "weeklyGoal": "short practical goal",
  "sessions": [
    {
      "day": "Monday",
      "start": "19:00",
      "durationMinutes": 60,
      "courseCode": "GST101",
      "focus": "specific study method or broad focus",
      "reason": "brief scheduling reason"
    }
  ],
  "recommendations": ["short practical recommendation"]
}

Student type: ${input.studentType}
Preferred rhythm: ${input.rhythm}
Preferred session length: ${input.sessionLengthMinutes} minutes
Registered courses:
${input.courses.map((course) => `- ${course.code} | ${course.title} | ${course.units ?? 2} units | ${course.difficulty}`).join("\n")}

Availability:
${input.days.map((day) => `- ${day.day} | starts ${day.startTime} | ${day.hours} hours | ${day.workday ? "workday" : "flexible day"}`).join("\n")}

Verified planning context from this student's saved NounCompass activity:
${adjustmentContext.length ? adjustmentContext.map((item) => `- ${item}`).join("\n") : "- No reliable prior activity is available. Build a balanced plan and do not invent performance data."}`;
}

async function loadPlannerContext(userId: string, rawInput: StudyPlannerGenerationInput) {
  const admin = createAdminClient();
  if (!admin) throw new AiStudyPlannerError("Study Planner storage is not configured.", 503);
  const [{ data: profile, error: profileError }, { data: membership }, { data: practice }, { data: pastSessions }] = await Promise.all([
    admin.from("profiles").select("selected_course_codes").eq("id", userId).maybeSingle(),
    admin.from("memberships").select("status,ends_at").eq("user_id", userId).order("ends_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("ai_practice_sessions").select("course_code,generated_questions,responses").eq("user_id", userId).eq("status", "completed").order("completed_at", { ascending: false }).limit(5),
    admin.from("study_plan_sessions").select("course_code,ends_at").eq("user_id", userId).lt("ends_at", new Date().toISOString()).gte("ends_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()).order("ends_at", { ascending: false }).limit(40),
  ]);
  if (profileError) throw new AiStudyPlannerError("Registered courses could not be verified.", 503);
  const registeredCourses = studyPlannerCoursesForCodes((profile?.selected_course_codes ?? []) as string[]);
  const input = normalizeStudyPlannerGenerationInput(rawInput, registeredCourses);
  const premium = membershipIsActive(membership?.status, membership?.ends_at);
  const topicRows = (practice ?? []).flatMap((session) => topicAccuracyFromQuestions(
    (session.generated_questions ?? []) as Array<{ id: string; topic?: string; correctLabel?: string }>,
    (session.responses ?? {}) as Record<string, string>,
  ).filter((topic) => topic.total >= 2 && topic.accuracy < 65).map((topic) => `${session.course_code} ${topic.topic}: ${topic.accuracy}% across ${topic.total} answered questions`));
  const missedCounts = new Map<string, number>();
  for (const session of pastSessions ?? []) {
    if (session.course_code) missedCounts.set(session.course_code, (missedCounts.get(session.course_code) ?? 0) + 1);
  }
  const adjustmentContext = [
    ...topicRows.slice(0, 6).map((item) => `Give extra attention to a supported weak area: ${item}.`),
    ...[...missedCounts.entries()].slice(0, 5).map(([code, count]) => `${code} had ${count} scheduled session(s) in the last 14 days; treat this only as scheduling history, not proof that the student missed them.`),
  ];
  return { admin, input, premium, adjustmentContext };
}

async function claimGenerationSlot(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string,
  weeklyLimit: number,
) {
  const { data, error } = await admin.rpc("claim_ai_study_planner_weekly_generation", {
    p_user_id: userId,
    p_weekly_limit: weeklyLimit,
  });
  if (error) throw new AiStudyPlannerError("The AI timetable quota could not be checked.", 503);
  const claim = (Array.isArray(data) ? data[0] : data) as {
    allowed?: boolean;
    generation_count?: number;
    window_started_at?: string;
  } | null;
  if (!claim || typeof claim.allowed !== "boolean") {
    throw new AiStudyPlannerError("The AI timetable quota could not be checked.", 503);
  }
  return {
    allowed: claim.allowed,
    generationCount: Number(claim.generation_count ?? 0),
    windowStartedAt: claim.window_started_at,
  };
}

async function savePlan({
  admin,
  generationCount,
  input,
  plan,
  userId,
  windowStartedAt,
}: {
  admin: NonNullable<ReturnType<typeof createAdminClient>>;
  generationCount?: number;
  input: StudyPlannerGenerationInput;
  plan: StudyPlanResult;
  userId: string;
  windowStartedAt?: string;
}) {
  const generatedAt = new Date().toISOString();
  const quotaFields = generationCount === undefined || !windowStartedAt
    ? {}
    : {
        ai_generation_window_started_at: windowStartedAt,
        ai_generation_count: generationCount,
      };
  const { error } = await admin.from("study_plans").upsert(
    {
      user_id: userId,
      ai_plan_payload: plan,
      ai_model: plan.model ?? null,
      ai_generated_at: generatedAt,
      ...quotaFields,
      last_generated_at: generatedAt,
      updated_at: generatedAt,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new AiStudyPlannerError("The generated timetable could not be saved.", 503);

  const firstSession = plan.days.flatMap((day) => day.sessions.map((session) => ({ day: day.day, session })))[0];
  await admin.from("user_tool_activity").upsert(
    {
      user_id: userId,
      tool_key: "study-planner",
      summary: {
        courses: input.courses.length,
        weeklyHours: plan.totalHours,
        sessionLengthMinutes: plan.sessionLengthMinutes,
        generationSource: plan.generationSource,
        model: plan.model ?? null,
        nextSession: firstSession
          ? {
              day: firstSession.day,
              label: firstSession.session.label,
              start: firstSession.session.start,
              end: firstSession.session.end,
            }
          : null,
      },
      updated_at: generatedAt,
    },
    { onConflict: "user_id,tool_key" },
  );
}

export async function generateAiStudyPlan(
  userId: string,
  rawInput: StudyPlannerGenerationInput,
) {
  const context = await loadPlannerContext(userId, rawInput);
  const weeklyLimit = context.premium ? PREMIUM_WEEKLY_GENERATIONS : FREE_WEEKLY_GENERATIONS;
  const provider = getAiProviderConfig();
  if (!provider) {
    const plan = buildDeterministicStudyPlan(context.input);
    await savePlan({ ...context, plan, userId });
    return {
      plan,
      weeklyLimit,
      remaining: weeklyLimit,
      notice: "AI planning is temporarily unavailable, so the reliable timetable planner was used instead.",
    };
  }

  const claim = await claimGenerationSlot(context.admin, userId, weeklyLimit);
  if (!claim.allowed) {
    const plan = buildDeterministicStudyPlan(context.input);
    await savePlan({ ...context, plan, userId });
    return {
      plan,
      weeklyLimit,
      remaining: 0,
      notice: "Your weekly AI generation limit has been reached, so the reliable timetable planner was used instead.",
    };
  }

  let plan: StudyPlanResult;
  let notice: string | undefined;
  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: provider.headers,
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content: "You create safe, realistic student timetables from structured registered-course and availability data. Return JSON only.",
          },
          { role: "user", content: buildPrompt(context.input, context.adjustmentContext) },
        ],
        temperature: 0.2,
        max_tokens: 3500,
      }),
    });
    if (!response.ok) throw new Error(`Provider status ${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Provider returned no timetable.");
    plan = parseAiStudyPlan(content, context.input, provider.model);
  } catch {
    plan = buildDeterministicStudyPlan(context.input);
    notice = "The AI response did not pass timetable safety checks, so the reliable planner produced this schedule instead.";
  }

  await savePlan({
    ...context,
    generationCount: claim.generationCount,
    plan,
    userId,
    windowStartedAt: claim.windowStartedAt,
  });
  return {
    plan,
    weeklyLimit,
    remaining: Math.max(0, weeklyLimit - claim.generationCount),
    notice,
  };
}
