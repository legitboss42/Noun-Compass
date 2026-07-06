import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const marketingDir = path.join(projectRoot, "marketing-agent");

const DISCLAIMER = "NounCompass is an independent student-help platform and is not the official NOUN website.";
const CONTACT_CTA = "Need help with NOUN admission? Contact NounCompass for guidance.";

const weeklyThemes = [
  {
    slug: "safe-payment-admission",
    name: "Safe NOUN payment and admission clarity",
    studentProblem: "Students are confused about admission steps and how to pay safely",
    outcomes: "Leads + traffic + trust",
    primaryLinks: [
      "https://nouncompass.me/admission",
      "https://nouncompass.me/fees",
      "https://nouncompass.me/articles/how-to-generate-remita-for-noun",
    ],
    platformFocus: ["Facebook", "Instagram", "Pinterest", "X"],
    posts: {
      admission: {
        platform: ["Facebook", "Instagram"],
        topic: "NOUN admission guidance",
        studentProblem: "Applicants are confused about admission steps, documents, and what to do first.",
        caption: `Confused about NOUN admission steps, documents, or what to do first?\n\nNounCompass breaks the process into simple guidance for applicants who want clear next steps without guesswork.\n\n${CONTACT_CTA}\n\n${DISCLAIMER}`,
        imageBrief: "Premium flyer with logo, contact details, applicant checklist feel, and a calm trust-building layout.",
        cta: CONTACT_CTA,
        hashtags: ["#NounCompass", "#NOUNAdmission", "#StudentHelp", "#AdmissionGuide", "#NOUNStudents"],
        linkTarget: "https://nouncompass.me/admission",
        format: "Facebook image post and Instagram feed post",
        reason: "Admission confusion remains the strongest direct lead angle.",
        goal: "leads",
      },
      traffic: {
        platform: ["Facebook", "X", "Pinterest"],
        topic: "How to generate Remita for NOUN fees",
        studentProblem: "Students want to pay fees but do not know how to generate Remita correctly.",
        caption: `Trying to pay NOUN fees and not sure how to generate Remita correctly?\n\nThis guide walks you through the process step by step so you can avoid preventable payment mistakes.\n\nRead it here: https://nouncompass.me/articles/how-to-generate-remita-for-noun\n\n${DISCLAIMER}`,
        imageBrief: "Premium flyer with payment-flow icons, clear headline, logo, website, and support email.",
        cta: "Read the full guide on NounCompass.",
        hashtags: ["#NounCompass", "#NOUNFees", "#Remita", "#StudentGuide", "#NOUNStudents"],
        linkTarget: "https://nouncompass.me/articles/how-to-generate-remita-for-noun",
        format: "Facebook link-style graphic, X traffic post, and vertical Pinterest pin",
        reason: "This topic already shows traction and can convert attention into site visits quickly.",
        goal: "traffic",
      },
      educational: {
        platform: ["Instagram", "Facebook"],
        topic: "Three checks before paying any NOUN fee",
        studentProblem: "Students rush into payment without confirming the right details first.",
        caption: `Before you pay any NOUN fee, check these 3 things first:\n\n1. Confirm what the fee is actually for\n2. Confirm the session or semester details\n3. Confirm the payment path you are using\n\nSave this post before you make a payment.\n\nFull fees help: https://nouncompass.me/fees`,
        imageBrief: "Premium carousel-style flyer with numbered checks, logo, website, and contact details.",
        cta: "Save this for later.",
        hashtags: ["#NounCompass", "#NOUNFees", "#StudentChecklist", "#NOUNGuide", "#StudySmart"],
        linkTarget: "https://nouncompass.me/fees",
        format: "Instagram carousel and Facebook educational graphic",
        reason: "Low-pressure help content builds trust before a lead ask.",
        goal: "trust",
      },
      faq: {
        platform: ["X", "Facebook"],
        topic: "Is NounCompass official?",
        studentProblem: "Students may confuse the brand with the official NOUN website.",
        caption: `FAQ: Is NounCompass the official NOUN website?\n\nNo. NounCompass is an independent student-help platform that explains NOUN-related processes in simple language.\n\nIf you want a guide before taking action, start here: https://nouncompass.me/student-guides`,
        imageBrief: "Premium trust card with clean typography, logo, disclaimer, and mobile-readable spacing.",
        cta: "Start with the guides.",
        hashtags: ["#NounCompass", "#StudentFAQ", "#NOUNGuide", "#StudentHelp"],
        linkTarget: "https://nouncompass.me/student-guides",
        format: "Short text post or single trust card",
        reason: "Trust clarity protects the brand and reduces friction.",
        goal: "trust",
      },
      engagement: {
        platform: ["Facebook", "Instagram Stories", "X"],
        topic: "What do you need help with right now?",
        studentProblem: "Students have different blockers and need an easy way to respond.",
        caption: "What are you most stuck on right now?\n\nA. Admission\nB. School fees\nC. Portal or registration\nD. Results or TMA\n\nComment with the letter, or tell us the exact issue.",
        imageBrief: "Premium poll-style flyer with bold choice blocks, logo, and contact details.",
        cta: "Comment with your answer.",
        hashtags: ["#NounCompass", "#NOUNStudents", "#StudentSupport", "#NOUNHelp"],
        linkTarget: "https://nouncompass.me/contact",
        format: "Facebook graphic, Instagram story poll, and X engagement post",
        reason: "Collects language for future posts and boosts engagement.",
        goal: "engagement",
      },
      pinterest: {
        platform: ["Pinterest"],
        topic: "How to generate Remita for NOUN",
        studentProblem: "Students search evergreen fee-payment help they can save and reuse.",
        caption: "How to generate Remita for NOUN school fees without avoidable mistakes. Open the full guide on NounCompass.",
        imageBrief: "Tall premium flyer-style pin with a 3-step teaser, logo, website, and support email.",
        cta: "Open the guide.",
        hashtags: ["#NOUNFees", "#Remita", "#StudentGuide", "#NounCompass"],
        linkTarget: "https://nouncompass.me/articles/how-to-generate-remita-for-noun",
        format: "Vertical evergreen pin",
        reason: "Strong fit for save behavior and persistent search traffic.",
        goal: "traffic",
      },
      video: {
        platform: ["Instagram Reels", "TikTok", "YouTube Shorts"],
        topic: "3 NOUN fee mistakes to avoid",
        studentProblem: "Students make avoidable payment mistakes before confirming the right steps.",
        caption: "3 mistakes students make before paying NOUN fees\n\nIf you want the safer step-by-step version, check NounCompass.\n\nLink in bio or visit nouncompass.me",
        imageBrief: "Premium vertical flyer/video opener with bold captions, logo, and contact details built into the frame.",
        cta: "Check the guide.",
        hashtags: ["#NounCompass", "#NOUNFees", "#StudentHelp", "#NOUNGuide", "#StudySmart"],
        linkTarget: "https://nouncompass.me/articles/how-to-generate-remita-for-noun",
        format: "20 to 30 second vertical short",
        reason: "Easy to reuse across three platforms from one script.",
        goal: "awareness",
      },
    },
  },
  {
    slug: "portal-registration-recovery",
    name: "Portal and registration recovery",
    studentProblem: "Students cannot find the right next portal step.",
    outcomes: "Traffic + trust",
    primaryLinks: [
      "https://nouncompass.me/portal",
      "https://nouncompass.me/articles/noun-portal-password-reset",
      "https://nouncompass.me/articles/how-to-register-noun-courses",
    ],
    platformFocus: ["Facebook", "X", "Instagram Stories"],
  },
  {
    slug: "course-materials-study-help",
    name: "Course materials and study help",
    studentProblem: "Students are searching for PDFs and study direction.",
    outcomes: "Traffic + saves",
    primaryLinks: [
      "https://nouncompass.me/course-materials",
      "https://nouncompass.me/articles/noun-course-materials-pdf",
    ],
    platformFocus: ["Pinterest", "Facebook", "Instagram"],
  },
  {
    slug: "tma-mistake-prevention",
    name: "TMA mistake prevention",
    studentProblem: "Students fear losing marks or missing a TMA step.",
    outcomes: "Trust + video reach",
    primaryLinks: [
      "https://nouncompass.me/articles/how-to-submit-tma-on-noun-elearn",
      "https://nouncompass.me/articles/common-noun-tma-mistakes",
    ],
    platformFocus: ["Instagram Reels", "TikTok", "YouTube Shorts"],
  },
  {
    slug: "results-cgpa-clarity",
    name: "Results and CGPA clarity",
    studentProblem: "Students do not know how to read their result or progress.",
    outcomes: "Traffic + trust",
    primaryLinks: [
      "https://nouncompass.me/results",
      "https://nouncompass.me/articles/how-to-check-noun-results",
    ],
    platformFocus: ["Facebook", "X", "LinkedIn"],
  },
  {
    slug: "study-centre-verification",
    name: "Study centre verification",
    studentProblem: "Students do not know which centre to trust before travelling.",
    outcomes: "Traffic + saves",
    primaryLinks: [
      "https://nouncompass.me/study-centres",
      "https://nouncompass.me/articles/full-list-of-verified-noun-study-centres-in-nigeria",
    ],
    platformFocus: ["Pinterest", "Facebook", "Instagram"],
  },
  {
    slug: "student-question-roundup",
    name: "Student question roundup",
    studentProblem: "Students want quick answers before taking action.",
    outcomes: "Engagement + future content input",
    primaryLinks: [
      "https://nouncompass.me/contact",
      "https://nouncompass.me/student-guides",
    ],
    platformFocus: ["Facebook", "Instagram", "X"],
  },
];

function plusDays(date, days) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function titleCase(value) {
  return value.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeText(filePath, value) {
  await fs.writeFile(filePath, value, "utf8");
}

function getRecentTopics(memory, daysWindow = 7) {
  const cutoff = plusDays(new Date(), -daysWindow);
  return new Set(
    (memory.entries ?? [])
      .filter((entry) => new Date(entry.date) >= cutoff)
      .map((entry) => entry.topic.toLowerCase()),
  );
}

function getThemeForDate(memory, targetDate) {
  const baseDate = new Date("2026-07-06T00:00:00.000Z");
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const startIndex = ((diffDays % weeklyThemes.length) + weeklyThemes.length) % weeklyThemes.length;
  const recentTopics = getRecentTopics(memory, memory.rules?.maxTopicRepetitionWindowDays ?? 7);

  for (let offset = 0; offset < weeklyThemes.length; offset += 1) {
    const candidate = weeklyThemes[(startIndex + offset) % weeklyThemes.length];
    const hasConflict = candidate.posts
      ? Object.values(candidate.posts).some((post) => recentTopics.has(post.topic.toLowerCase()))
      : false;
    if (!hasConflict) {
      return candidate;
    }
  }

  return weeklyThemes[startIndex];
}

function buildFallbackPosts(theme) {
  return {
    admission: {
      platform: ["Facebook", "Instagram"],
      topic: `${titleCase(theme.name)} admission help`,
      studentProblem: theme.studentProblem,
      caption: `Need clearer NOUN help around ${theme.name.toLowerCase()}?\n\nNounCompass explains the next step in simple language so you can move forward with less guesswork.\n\n${CONTACT_CTA}\n\n${DISCLAIMER}`,
      imageBrief: "Premium flyer with logo, contact details, short headline, and one student problem in focus.",
      cta: CONTACT_CTA,
      hashtags: ["#NounCompass", "#NOUNAdmission", "#StudentHelp", "#NOUNStudents"],
      linkTarget: "https://nouncompass.me/admission",
      format: "Facebook image post and Instagram feed post",
      reason: "Keeps lead generation active even when the theme is broader than admission.",
      goal: "leads",
    },
    traffic: {
      platform: theme.platformFocus,
      topic: theme.name,
      studentProblem: theme.studentProblem,
      caption: `Students are asking about ${theme.name.toLowerCase()} right now.\n\nThis guide gives the clearer next step without the usual confusion.\n\nRead more: ${theme.primaryLinks[0]}\n\n${DISCLAIMER}`,
      imageBrief: "Premium flyer with logo, website, support email, and one strong practical promise.",
      cta: "Read the full guide on NounCompass.",
      hashtags: ["#NounCompass", "#StudentGuide", "#NOUNStudents", "#NOUNHelp"],
      linkTarget: theme.primaryLinks[0],
      format: "Traffic post linked to the strongest page for the theme",
      reason: "Pushes the theme's strongest educational URL.",
      goal: "traffic",
    },
    educational: {
      platform: ["Facebook", "Instagram"],
      topic: `${theme.name} checklist`,
      studentProblem: theme.studentProblem,
      caption: `Before you act on ${theme.name.toLowerCase()}, check these 3 things first:\n\n1. Confirm the exact task\n2. Confirm the right page or guide\n3. Confirm the final step before you submit or pay\n\nSave this for later.`,
      imageBrief: "Premium checklist flyer with mobile-first readability and contact details.",
      cta: "Save this for later.",
      hashtags: ["#NounCompass", "#StudentChecklist", "#NOUNGuide", "#StudySmart"],
      linkTarget: theme.primaryLinks[0],
      format: "Single graphic or carousel",
      reason: "Keeps the batch useful even before the stronger traffic CTA.",
      goal: "trust",
    },
    faq: {
      platform: ["Facebook", "X"],
      topic: `${theme.name} FAQ`,
      studentProblem: "Students keep repeating the same clarification questions.",
      caption: `Quick FAQ: Where should students start when they are confused about ${theme.name.toLowerCase()}?\n\nStart with a clear guide, then confirm the final step on the official NOUN page.\n\n${theme.primaryLinks[0]}`,
      imageBrief: "Premium trust-style FAQ card with logo and disclaimer.",
      cta: "Start with the guide.",
      hashtags: ["#NounCompass", "#StudentFAQ", "#NOUNGuide"],
      linkTarget: theme.primaryLinks[0],
      format: "Short text post or simple FAQ card",
      reason: "Builds trust and keeps the brand useful.",
      goal: "trust",
    },
    engagement: {
      platform: ["Facebook", "Instagram Stories", "X"],
      topic: `${theme.name} poll`,
      studentProblem: "Students need a low-friction way to signal what they need next.",
      caption: `Which of these do you need help with most right now?\n\nA. ${theme.name}\nB. Admission\nC. School fees\nD. Portal or results\n\nComment with the letter or tell us the exact issue.`,
      imageBrief: "Premium poll flyer with bold blocks and contact details.",
      cta: "Comment with your answer.",
      hashtags: ["#NounCompass", "#NOUNStudents", "#StudentSupport"],
      linkTarget: "https://nouncompass.me/contact",
      format: "Poll or engagement graphic",
      reason: "Collects tomorrow's content inputs.",
      goal: "engagement",
    },
    pinterest: {
      platform: ["Pinterest"],
      topic: `${theme.name} evergreen pin`,
      studentProblem: theme.studentProblem,
      caption: `Save this NOUN guide for later if you need help with ${theme.name.toLowerCase()}.`,
      imageBrief: "Tall premium flyer pin with logo, website, and a practical one-line promise.",
      cta: "Open the guide.",
      hashtags: ["#NounCompass", "#StudentGuide", "#NOUNStudents"],
      linkTarget: theme.primaryLinks[0],
      format: "Vertical evergreen pin",
      reason: "Keeps Pinterest active with searchable educational content.",
      goal: "traffic",
    },
    video: {
      platform: ["Instagram Reels", "TikTok", "YouTube Shorts"],
      topic: `${theme.name} short video`,
      studentProblem: theme.studentProblem,
      caption: `Still confused about ${theme.name.toLowerCase()}?\n\nHere is one mistake to avoid and one safer next step.\n\nVisit nouncompass.me for the full guide.`,
      imageBrief: "Premium vertical short opener with big captions, logo, and website.",
      cta: "Check the guide.",
      hashtags: ["#NounCompass", "#StudentHelp", "#NOUNGuide", "#NOUNStudents"],
      linkTarget: theme.primaryLinks[0],
      format: "20 to 30 second short",
      reason: "Creates one reusable short-form content asset for three channels.",
      goal: "awareness",
    },
  };
}

function createBatch(theme) {
  return theme.posts ?? buildFallbackPosts(theme);
}

function renderPostSection(label, post) {
  return `### ${label}\n\n- Platforms: ${post.platform.join(", ")}\n- Topic: ${post.topic}\n- Student problem: ${post.studentProblem}\n- Caption:\n${post.caption.split("\n").map((line) => `  ${line}`).join("\n")}\n- Image brief: ${post.imageBrief}\n- CTA: ${post.cta}\n- Hashtags: ${post.hashtags.join(" ")}\n- Link target: ${post.linkTarget}\n- Best format: ${post.format}\n- Reason: ${post.reason}\n- Expected goal: ${post.goal}`;
}

function buildDailyPlan(dateString, theme, batch) {
  return `# Daily Marketing Agent Plan\n\n## Run Date\n\n${dateString}\n\n## Selected Campaign Theme\n\n${theme.name}\n\n## Why This Theme Won Today\n\n- Student problem: ${theme.studentProblem}\n- Main outcome: ${theme.outcomes}\n- Platform focus: ${theme.platformFocus.join(", ")}\n- Primary links: ${theme.primaryLinks.join(", ")}\n\n## Daily Workflow\n\n1. Review the latest entries in \`marketing-memory.json\`.\n2. Use the selected theme for today's post batch.\n3. Generate premium flyer-style creatives with logo, website, and contact details.\n4. Publish to the strongest priority platforms first.\n5. Record live post URLs in \`daily-marketing-report.md\` and \`marketing-memory.json\` after publishing.\n\n## Today's Post Batch\n\n${renderPostSection("1. Admission Service Post", batch.admission)}\n\n${renderPostSection("2. Website Traffic Post", batch.traffic)}\n\n${renderPostSection("3. Helpful Educational Post", batch.educational)}\n\n${renderPostSection("4. FAQ-Style Trust Post", batch.faq)}\n\n${renderPostSection("5. Engagement Post", batch.engagement)}\n\n${renderPostSection("6. Pinterest Evergreen Pin", batch.pinterest)}\n\n${renderPostSection("7. Short Video Idea", batch.video)}\n\n## Publishing Note\n\n- Publish directly if the account is already logged in and no manual-only platform gate appears.\n- Pause only for login, 2FA, CAPTCHA, or other forced manual intervention.\n- Keep using this disclaimer where confusion is possible:\n\n${DISCLAIMER}\n`;
}

function buildPromoMarkdown(title, post) {
  return `# ${title}\n\n- Platforms: ${post.platform.join(", ")}\n- Topic: ${post.topic}\n- Link target: ${post.linkTarget}\n- CTA: ${post.cta}\n- Hashtags: ${post.hashtags.join(" ")}\n\n## Caption\n\n${post.caption}\n\n## Image Brief\n\n${post.imageBrief}\n\n## Posting Format\n\n${post.format}\n\n## Reason\n\n${post.reason}\n`;
}

function buildDailyReport(dateString, theme, batch) {
  return `# Daily Marketing Report\n\n## Date\n\n${dateString}\n\n## Campaign theme\n\n${theme.name}\n\n## Status\n\nPlanned. Not yet published by the command runner.\n\n## Posts created\n\n1. ${batch.admission.topic}\n2. ${batch.traffic.topic}\n3. ${batch.educational.topic}\n4. ${batch.faq.topic}\n5. ${batch.engagement.topic}\n6. ${batch.pinterest.topic}\n7. ${batch.video.topic}\n\n## Platforms planned\n\n- ${[...new Set(Object.values(batch).flatMap((post) => post.platform))].join("\n- ")}\n\n## Links promoted\n\n- ${[...new Set(Object.values(batch).map((post) => post.linkTarget))].join("\n- ")}\n\n## Lead-generation CTA used\n\n${batch.admission.cta}\n\n## Issues encountered\n\n- None yet. This command generates the batch and report files only.\n- Add browser/posting issues here after publishing.\n\n## Recommended next action\n\n1. Generate or request today's premium flyer images\n2. Publish the priority posts\n3. Save live post URLs\n4. Append final publishing results to \`marketing-memory.json\`\n`;
}

function updateCalendar(calendarContent, dateString, theme) {
  const marker = "## Latest generated run";
  const generatedSection = `${marker}\n\n- Date: ${dateString}\n- Theme: ${theme.name}\n- Student problem: ${theme.studentProblem}\n- Main outcome: ${theme.outcomes}\n- Primary links: ${theme.primaryLinks.join(", ")}\n`;
  if (calendarContent.includes(marker)) {
    return calendarContent.replace(new RegExp(`${marker}[\\s\\S]*$`), generatedSection);
  }
  return `${calendarContent.trim()}\n\n${generatedSection}\n`;
}

async function main() {
  const today = new Date();
  const dateString = toDateString(today);
  const memoryPath = path.join(marketingDir, "marketing-memory.json");
  const dailyPlanPath = path.join(marketingDir, "daily-plan.md");
  const calendarPath = path.join(marketingDir, "content-calendar.md");
  const reportPath = path.join(marketingDir, "daily-marketing-report.md");
  const admissionPromoPath = path.join(marketingDir, "admission-service-promo.md");
  const trafficPromoPath = path.join(marketingDir, "website-traffic-promo.md");

  const memory = await readJson(memoryPath);
  const calendarContent = await fs.readFile(calendarPath, "utf8");

  const theme = getThemeForDate(memory, today);
  const batch = createBatch(theme);

  await writeText(dailyPlanPath, buildDailyPlan(dateString, theme, batch));
  await writeText(admissionPromoPath, buildPromoMarkdown("Admission Service Promo", batch.admission));
  await writeText(trafficPromoPath, buildPromoMarkdown("Website Traffic Promo", batch.traffic));
  await writeText(reportPath, buildDailyReport(dateString, theme, batch));
  await writeText(calendarPath, updateCalendar(calendarContent, dateString, theme));

  const summary = {
    date: dateString,
    theme: theme.name,
    outputs: {
      dailyPlan: path.relative(projectRoot, dailyPlanPath),
      admissionPromo: path.relative(projectRoot, admissionPromoPath),
      trafficPromo: path.relative(projectRoot, trafficPromoPath),
      dailyReport: path.relative(projectRoot, reportPath),
      calendar: path.relative(projectRoot, calendarPath),
    },
    nextStep: "Generate premium creatives, publish posts, then append live post URLs and results to marketing-memory.json.",
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
