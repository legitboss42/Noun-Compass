import { renderBrandedEmail } from "../email-layout";

export type ReengagementEmailInput = {
  displayName?: string | null;
  siteUrl: string;
  ctaUrl: string;
  unsubscribeUrl?: string;
};

/**
 * The nudge for students who created an account and then never opened a tool.
 *
 * The copy names what they can do in one sitting rather than describing the
 * product, because the reader already signed up: they know what the site is,
 * they just never came back. It does not claim to know their exam dates and it
 * does not manufacture urgency, both of which would be easy and dishonest.
 */
export function buildReengagementEmail(input: ReengagementEmailInput) {
  const first = firstName(input.displayName);
  const greeting = first ? `Hi ${first},` : "Hi there,";

  const { html, text } = renderBrandedEmail({
    preheader: "Your account is ready. Here is the fastest way to start.",
    eyebrow: "Your account is waiting",
    heading: "You signed up. Now put it to work.",
    headingHighlight: "put it to work",
    paragraphs: [
      greeting,
      "You created a NounCompass account but have not used the study tools yet. Nothing is wrong with your account - you just have not started.",
      "The quickest first step is a Practice Exam. Pick one of your registered courses, and NounCompass builds questions from the official course material, marks them, and shows you which topics to go back to.",
      "It takes a few minutes and it is free. Your score is saved so you can see whether you are actually improving before your exams.",
    ],
    cta: { label: "Start a Practice Exam", url: input.ctaUrl },
    note: "Also free: the CGPA calculator, the study planner, and every NOUN guide on the site.",
    unsubscribeUrl: input.unsubscribeUrl,
    siteUrl: input.siteUrl,
  });

  return {
    subject: first ? `${first}, your NounCompass account is still waiting` : "Your NounCompass account is still waiting",
    html,
    text,
  };
}

function firstName(displayName?: string | null) {
  const cleaned = (displayName ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const first = cleaned.split(" ")[0];
  // A "name" that is an email address or a stray token reads worse than no
  // name at all, so fall back to the neutral greeting.
  if (first.length > 24 || first.includes("@")) return "";
  return first;
}
