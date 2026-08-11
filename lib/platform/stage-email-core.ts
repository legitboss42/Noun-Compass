import { renderBrandedEmail } from "../email-layout";
import { firstName } from "./reengagement-email-core";

export type InactiveStage = "s1" | "s2" | "s3" | "s4";

export type StageContext = {
  course_code?: string | null;
  course_title?: string | null;
  resume_session_id?: string | null;
};

export type StageEmailInput = {
  stage: InactiveStage;
  displayName?: string | null;
  siteUrl: string;
  unsubscribeUrl?: string;
  context?: StageContext;
};

export const STAGE_META: Record<InactiveStage, { label: string; blurb: string }> = {
  s1: { label: "Signed up, never set up", blurb: "Verified their email but never completed onboarding." },
  s2: { label: "Set up, never explored", blurb: "Finished onboarding but never opened a study tool." },
  s3: { label: "Explored tools, never tested", blurb: "Used a tool or planner but never did a Practice Exam." },
  s4: { label: "Started practice, never finished", blurb: "Began a Practice Exam but never completed one." },
};

/** Relative CTA path, shared by the email (absolute) and the notification row (relative). */
function stagePath(stage: InactiveStage, context?: StageContext): string {
  if (stage === "s3") return "/dashboard/ai-practice";
  if (stage === "s4") {
    const id = context?.resume_session_id;
    return id ? `/dashboard/ai-practice?session=${encodeURIComponent(id)}` : "/dashboard/ai-practice";
  }
  return "/dashboard"; // s1, s2
}

type StageCopy = {
  subject: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  paragraphs: string[];
  ctaLabel: string;
  note?: string;
};

function stageCopy(stage: InactiveStage, first: string, context?: StageContext): StageCopy {
  const named = (withName: string, neutral: string) => (first ? withName : neutral);
  const course = (context?.course_title || "").trim();
  switch (stage) {
    case "s1":
      return {
        subject: named(`${first}, finish setting up NounCompass`, "Finish setting up NounCompass"),
        preheader: "You verified your account. Two minutes to finish setting it up.",
        eyebrow: "Finish your setup",
        heading: "You are one step from a study plan.",
        headingHighlight: "one step",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You verified your NounCompass account but have not set up your semester yet. Once we know your programme and registered courses, every tool works from your real courses instead of generic ones.",
          "It takes about two minutes and you can change it any time.",
        ],
        ctaLabel: "Set up my semester",
        note: "Everything on NounCompass is free: the CGPA calculator, the study planner, and Practice Exams.",
      };
    case "s2":
      return {
        subject: named(`${first}, your study tools are ready`, "Your NounCompass tools are ready"),
        preheader: "Your semester is set up. Here is the fastest tool to open first.",
        eyebrow: "Your tools are ready",
        heading: "Your semester is set up. Now use it.",
        headingHighlight: "use it",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You finished setting up your semester but have not opened a study tool yet. The quickest first step is a Practice Exam built from your own course material - it marks itself and shows the topics to revise.",
          "It is free and your score is saved so you can see whether you are improving.",
        ],
        ctaLabel: "Open my dashboard",
        note: "Also free: the CGPA calculator and the study planner.",
      };
    case "s3":
      return {
        subject: named(`${first}, see where you actually stand`, "See where you actually stand"),
        preheader: "You have used the tools. A Practice Exam shows what you have got.",
        eyebrow: "Try a Practice Exam",
        heading: "You have explored. Now test yourself.",
        headingHighlight: "test yourself",
        paragraphs: [
          named(`Hi ${first},`, "Hi there,"),
          "You have used the NounCompass tools but have not tried a Practice Exam yet. Pick one of your registered courses and NounCompass builds questions from the official material, marks them, and shows which topics to go back to.",
          "It takes a few minutes and it is free.",
        ],
        ctaLabel: "Start a Practice Exam",
      };
    case "s4":
      return course
        ? {
            subject: named(`${first}, finish your ${course} practice`, `Finish your ${course} practice`),
            preheader: `You started a ${course} Practice Exam. Pick up where you left off.`,
            eyebrow: "Pick up where you left off",
            heading: "You started. Now finish it.",
            headingHighlight: "finish it",
            paragraphs: [
              named(`Hi ${first},`, "Hi there,"),
              `You started a Practice Exam for ${course} but did not finish it. Your progress is saved - you can pick up exactly where you left off and see your score at the end.`,
              "It only takes a few more minutes.",
            ],
            ctaLabel: "Finish my practice",
          }
        : {
            subject: named(`${first}, finish your practice exam`, "Finish your practice exam"),
            preheader: "You started a Practice Exam. Pick up where you left off.",
            eyebrow: "Pick up where you left off",
            heading: "You started. Now finish it.",
            headingHighlight: "finish it",
            paragraphs: [
              named(`Hi ${first},`, "Hi there,"),
              "You started a Practice Exam but did not finish it. Your progress is saved - you can pick up where you left off and see your score at the end.",
              "It only takes a few more minutes.",
            ],
            ctaLabel: "Finish my practice",
          };
  }
}

export function stageNotification(stage: InactiveStage, context?: StageContext) {
  const copy = stageCopy(stage, "", context);
  return { title: copy.eyebrow, body: copy.paragraphs[copy.paragraphs.length - 1], actionUrl: stagePath(stage, context) };
}

export function buildStageEmail(input: StageEmailInput): { subject: string; html: string; text: string } {
  const first = firstName(input.displayName);
  const copy = stageCopy(input.stage, first, input.context);
  const site = input.siteUrl.replace(/\/+$/, "");
  const { html, text } = renderBrandedEmail({
    preheader: copy.preheader,
    eyebrow: copy.eyebrow,
    heading: copy.heading,
    headingHighlight: copy.headingHighlight,
    paragraphs: copy.paragraphs,
    cta: { label: copy.ctaLabel, url: `${site}${stagePath(input.stage, input.context)}` },
    note: copy.note,
    unsubscribeUrl: input.unsubscribeUrl,
    siteUrl: input.siteUrl,
  });
  return { subject: copy.subject, html, text };
}
