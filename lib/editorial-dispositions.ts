import { getAllArticles, type Article } from "@/lib/articles";

export type EditorialDecision = "keep" | "rewrite" | "merge" | "retire";
export type EditorialStatus =
  | "current-source-recheck-required"
  | "full-source-review-and-rewrite-required"
  | "adsense-ready";

type DispositionSeed = {
  slug: string;
  intent: string;
  cluster: string;
  decision: EditorialDecision;
};

type EditorialSource = { label: string; url: string };

type PendingEditorialReview = {
  reviewVerification: "pending";
  currentSourceReview: {
    reviewedAt: null;
    officialSourcesChecked: [];
  };
  dateMetadata: {
    status: "unverified";
    publishedAt: null;
    updatedAt: null;
  };
};

type VerifiedEditorialReview = {
  reviewVerification: "verified";
  currentSourceReview: {
    reviewedAt: string;
    officialSourcesChecked: EditorialSource[];
  };
  dateMetadata: {
    status: "verified";
    publishedAt: string;
    updatedAt: string;
  };
};

export type EditorialDisposition = DispositionSeed & {
  url: `/articles/${string}`;
  canonicalTarget: `/articles/${string}` | null;
  author: string;
  reviewer: string;
  status: EditorialStatus;
  indexable: boolean;
  adsenseReadiness: "blocked";
  gscEvidence: {
    status: "unavailable-unverified";
    note: string;
  };
  declaredOfficialSource: string;
  existingSourceReview: {
    status: "repository-recorded-not-rechecked" | "not-recorded";
    summary: string | null;
    reviewedSources: EditorialSource[];
  };
} & (PendingEditorialReview | VerifiedEditorialReview);

const dispositionSeeds: DispositionSeed[] = [
  { slug: "common-nelfund-problems-noun-students-face", intent: "Troubleshoot common NELFUND application problems affecting NOUN students", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "common-noun-tma-mistakes", intent: "Prevent common TMA workflow mistakes", cluster: "TMA and eLearn", decision: "rewrite" },
  { slug: "fix-missing-noun-e-wallet-balance", intent: "Troubleshoot a missing NOUN e-wallet balance", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "full-list-of-verified-noun-study-centres-in-nigeria", intent: "Find and verify a NOUN study centre in Nigeria", cluster: "Study centres", decision: "rewrite" },
  { slug: "gst302-summary", intent: "Understand the scope of GST302 for study planning", cluster: "Course materials and GST", decision: "rewrite" },
  { slug: "how-noun-students-apply-for-nelfund", intent: "Apply for NELFUND as a NOUN student", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "how-to-apply-for-noun-admission", intent: "Apply for NOUN admission", cluster: "Admissions", decision: "rewrite" },
  { slug: "how-to-check-noun-results", intent: "Check NOUN results through the available student workflows", cluster: "Results and academic records", decision: "keep" },
  { slug: "how-to-check-outstanding-courses-on-noun-result-statement", intent: "Identify outstanding courses on a NOUN result statement", cluster: "Results and academic records", decision: "rewrite" },
  { slug: "how-to-find-noun-results-on-my-progress", intent: "Find NOUN results in the My Progress area", cluster: "Results and academic records", decision: "rewrite" },
  { slug: "how-to-find-tma-on-noun-elearn", intent: "Locate a TMA in NOUN eLearn", cluster: "TMA and eLearn", decision: "keep" },
  { slug: "how-to-generate-remita-for-noun", intent: "Generate a Remita reference for a NOUN payment", cluster: "Fees and e-wallet", decision: "keep" },
  { slug: "how-to-open-your-noun-result-statement-from-the-support-portal", intent: "Open a result statement through the NOUN support portal", cluster: "Results and academic records", decision: "keep" },
  { slug: "how-to-pay-noun-school-fees", intent: "Pay NOUN school fees through the current student workflow", cluster: "Fees and e-wallet", decision: "keep" },
  { slug: "how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit", intent: "Interpret NOUN CGPA, class of degree, and outstanding credit", cluster: "Results and academic records", decision: "keep" },
  { slug: "how-to-register-noun-courses", intent: "Register NOUN courses", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "how-to-submit-tma-on-noun-elearn", intent: "Submit a TMA in NOUN eLearn", cluster: "TMA and eLearn", decision: "keep" },
  { slug: "how-to-use-noun-support-or-e-ticketing-for-result-problems", intent: "Escalate a NOUN result problem through support or e-ticketing", cluster: "Results and academic records", decision: "rewrite" },
  { slug: "how-to-verify-a-noun-study-centre-before-you-travel", intent: "Verify a NOUN study centre before travelling", cluster: "Study centres", decision: "rewrite" },
  { slug: "is-noun-eligible-for-nelfund", intent: "Determine whether NOUN students are eligible for NELFUND", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "nelfund-application-status-meanings-explained", intent: "Understand NELFUND application status labels", cluster: "NELFUND and student finance", decision: "keep" },
  { slug: "nelfund-approval-and-disbursement-guide-for-noun-students", intent: "Understand NELFUND approval and disbursement stages for NOUN students", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "nelfund-frequently-asked-questions-for-noun-students", intent: "Answer common NELFUND questions from NOUN students", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "nelfund-requirements-for-noun-students", intent: "Check NELFUND requirements for NOUN students", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "noun-admission-requirements", intent: "Check NOUN admission requirements", cluster: "Admissions", decision: "rewrite" },
  { slug: "noun-compulsory-fee", intent: "Understand and verify NOUN compulsory charges", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-core-courses-vs-electives", intent: "Compare core courses and electives in NOUN registration", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "noun-course-materials-pdf", intent: "Find and evaluate NOUN PDF course materials", cluster: "Course materials and GST", decision: "rewrite" },
  { slug: "noun-e-exam-vs-pop", intent: "Compare NOUN e-exam and POP examination formats", cluster: "Examinations", decision: "rewrite" },
  { slug: "noun-e-wallet-refund", intent: "Request or troubleshoot a NOUN e-wallet refund", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-elearn-and-tma-guide", intent: "Navigate NOUN eLearn and the TMA workflow", cluster: "TMA and eLearn", decision: "keep" },
  { slug: "noun-exam-registration-guide", intent: "Register for NOUN examinations", cluster: "Examinations", decision: "rewrite" },
  { slug: "noun-financial-statement", intent: "View and interpret a NOUN portal financial statement", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-graduation-clearance-fee-convocation-costs", intent: "Verify NOUN graduation, clearance, and convocation charges", cluster: "Graduation and student workflows", decision: "rewrite" },
  { slug: "noun-installment-payment", intent: "Determine whether a NOUN fee can be paid in instalments", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-late-registration-fee", intent: "Check whether a current NOUN late-registration charge applies", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-maximum-credit-units", intent: "Check the applicable NOUN semester credit-unit limit", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "noun-missing-course-code", intent: "Troubleshoot a missing course code during NOUN registration", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "noun-portal-password-reset", intent: "Recover a forgotten NOUN portal password", cluster: "Registration and portal", decision: "keep" },
  { slug: "noun-postgraduate-school-fees", intent: "Plan and verify NOUN postgraduate fees", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-registration-slip-printout", intent: "Print NOUN course and examination registration slips", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "noun-school-fees-new-students", intent: "Plan and verify first-semester NOUN fees", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-school-fees-returning-students", intent: "Plan and verify returning-student NOUN fees", cluster: "Fees and e-wallet", decision: "rewrite" },
  { slug: "noun-study-centres-in-abuja", intent: "Find and verify NOUN study centres serving Abuja", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-study-centres-in-benin", intent: "Find and verify NOUN study centres serving Benin and Edo", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-study-centres-in-enugu", intent: "Find and verify NOUN study centres serving Enugu", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-study-centres-in-kano", intent: "Find and verify NOUN study centres serving Kano", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-study-centres-in-lagos", intent: "Find and verify NOUN study centres serving Lagos", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-study-centres-in-ogun", intent: "Find and verify NOUN study centres serving Ogun", cluster: "Study centres", decision: "rewrite" },
  { slug: "noun-support-ticket-guide", intent: "Prepare and submit a useful NOUN support ticket", cluster: "Student support", decision: "rewrite" },
  { slug: "noun-tma-deadline-guide", intent: "Verify and respond to a NOUN TMA deadline", cluster: "TMA and eLearn", decision: "rewrite" },
  { slug: "nouonline-student-dashboard", intent: "Navigate the NOUN student dashboard", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "register-carryover-courses-noun", intent: "Register carryover courses in the NOUN portal", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "special-and-correctional-noun-study-centres-guide", intent: "Understand and verify special or correctional NOUN study centres", cluster: "Study centres", decision: "rewrite" },
  { slug: "update-profile-nouonline", intent: "Update permitted profile details in the NOUN portal", cluster: "Registration and portal", decision: "rewrite" },
  { slug: "why-nelfund-requests-a-jamb-registration-number", intent: "Understand why NELFUND asks for a JAMB registration number", cluster: "NELFUND and student finance", decision: "rewrite" },
  { slug: "why-noun-course-registration-slip-says-register-for-the-current-semester-first", intent: "Resolve the current-semester registration prerequisite for a course slip", cluster: "Results and academic records", decision: "rewrite" },
  { slug: "why-your-noun-result-grade-is-not-showing", intent: "Troubleshoot a missing NOUN result grade", cluster: "Results and academic records", decision: "rewrite" },
  { slug: "why-your-noun-tma-score-is-not-showing", intent: "Troubleshoot a missing NOUN TMA score", cluster: "TMA and eLearn", decision: "rewrite" },
];

function toDisposition(seed: DispositionSeed, article: Article): EditorialDisposition {
  const hasRecordedReview = Boolean(article.sourceReviewSummary && article.reviewedSources?.length);
  return {
    ...seed,
    url: `/articles/${seed.slug}`,
    canonicalTarget: null,
    author: article.author,
    reviewer: article.reviewer,
    status: hasRecordedReview ? "current-source-recheck-required" : "full-source-review-and-rewrite-required",
    indexable: seed.decision === "keep" || seed.decision === "rewrite",
    adsenseReadiness: "blocked",
    gscEvidence: {
      status: "unavailable-unverified",
      note: "No current URL-level Google Search Console evidence was available in this checkout during Checkpoint 3.",
    },
    declaredOfficialSource: article.officialSourceUrl,
    existingSourceReview: {
      status: hasRecordedReview ? "repository-recorded-not-rechecked" : "not-recorded",
      summary: article.sourceReviewSummary ?? null,
      reviewedSources: article.reviewedSources ?? [],
    },
    reviewVerification: "pending",
    currentSourceReview: {
      reviewedAt: null,
      officialSourcesChecked: [],
    },
    dateMetadata: {
      status: "unverified",
      publishedAt: null,
      updatedAt: null,
    },
  };
}

export function getEditorialDispositionManifest(): EditorialDisposition[] {
  const articles = new Map(getAllArticles().map((article) => [article.slug, article]));
  return dispositionSeeds.map((seed) => {
    const article = articles.get(seed.slug);
    if (!article) throw new Error(`Editorial disposition has no matching article: ${seed.slug}`);
    return toDisposition(seed, article);
  });
}

export function getEditorialDisposition(slug: string) {
  return getEditorialDispositionManifest().find((item) => item.slug === slug);
}

export function getIndexableArticles() {
  const indexableSlugs = new Set(
    getEditorialDispositionManifest().filter((item) => item.indexable).map((item) => item.slug),
  );
  return getAllArticles().filter((article) => indexableSlugs.has(article.slug));
}
