export type SearchIntentSection = {
  heading: string;
  summary: string;
  bullets: readonly string[];
  officialSource: {
    label: string;
    href: string;
  };
  nextStep?: {
    label: string;
    href: string;
  };
};

export type ArticleSearchIntentOverride = {
  title: string;
  seoTitle: string;
  description: string;
  seoDescription: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  intentSection?: SearchIntentSection;
};

const ARTICLE_SEARCH_INTENT_OVERRIDES = {
  "register-carryover-courses-noun": {
    title: "NOUN Carryover Pass Mark: What Scores Below 40 Mean",
    seoTitle: "NOUN Carryover Pass Mark: Is 40 a Pass?",
    description:
      "Understand the NOUN carryover pass mark, the programmes where 50% applies, what a score below the required mark means, and how to handle an unresolved course.",
    seoDescription:
      "For most NOUN undergraduate courses, 40% is the general pass mark. See the 50% exceptions, what a score below 40 means, and how to handle a carryover.",
    primaryKeyword: "noun carryover pass mark",
    secondaryKeywords: [
      "noun carry over pass mark 40",
      "noun carry over score below 40",
      "noun carryover what score",
      "register carryover courses noun",
    ],
    intentSection: {
      heading: "NOUN Carryover Pass Mark: Is 40 a Pass?",
      summary:
        "NOUN's current FAQ says undergraduate students generally require 40% and above to pass, while Nursing programmes and postgraduate programmes typically require 50% and above. The pass mark therefore depends on your programme, not on one universal number for every student.",
      bullets: [
        "Most undergraduate programmes: 40% and above is the general pass mark.",
        "Nursing programmes: 50% and above is the stated pass mark.",
        "Postgraduate programmes: 50% and above is the typical pass mark.",
        "If your score is below the pass mark that applies to your programme, confirm the course status on your result statement before registering it again.",
      ],
      officialSource: {
        label: "NOUN FAQ on passing grades",
        href: "https://nou.edu.ng/faqs/",
      },
      nextStep: {
        label: "check outstanding courses on your result statement",
        href: "/articles/how-to-check-outstanding-courses-on-noun-result-statement",
      },
    },
  },
  "is-noun-eligible-for-nelfund": {
    title: "Can NOUN Students Apply for NELFUND? What Is Confirmed",
    seoTitle: "Can NOUN Students Apply for NELFUND? Yes",
    description:
      "NOUN students can apply for NELFUND. NOUN confirmed approved disbursement to 90 students in March 2026, while individual applications still depend on current verification.",
    seoDescription:
      "Yes, NOUN students can apply for NELFUND. NOUN confirmed approved disbursement to 90 students; individual applications still require verification.",
    primaryKeyword: "can noun students apply for nelfund",
    secondaryKeywords: [
      "is noun eligible for nelfund",
      "nelfund for noun students",
      "noun nelfund eligibility",
      "is noun part of nelfund",
    ],
    intentSection: {
      heading: "Can NOUN Students Apply for NELFUND?",
      summary:
        "Yes. NOUN confirmed approved NELFUND disbursement to 90 students in March 2026. That is direct evidence that NOUN students can participate, but it does not mean every application is automatically approved.",
      bullets: [
        "NOUN students are participating in the NELFUND scheme.",
        "NOUN confirmed approved disbursement to 90 students in March 2026.",
        "Individual applications still have to pass the current NELFUND verification process.",
        "Student-specific category or record questions should be checked against the current official application requirements.",
      ],
      officialSource: {
        label: "NOUN announcement confirming NELFUND disbursement to students",
        href: "https://nou.edu.ng/vc-approves-disbursement-of-nelfund-to-noun-students-e-wallets/",
      },
      nextStep: {
        label: "follow the NOUN student NELFUND application guide",
        href: "/articles/how-noun-students-apply-for-nelfund",
      },
    },
  },
  "nelfund-requirements-for-noun-students": {
    title: "NELFUND Requirements For NOUN Students",
    seoTitle: "NELFUND Requirements For NOUN Students",
    description:
      "Review the NELFUND inputs and verification points that were actually confirmed for NOUN students, including institution selection, matric number, JAMB registration number, and the limits of what is still unverified.",
    seoDescription:
      "Check the NELFUND details NOUN students should prepare: institution, matric number, JAMB verification and date of birth, plus what remains unverified.",
    primaryKeyword: "NELFUND requirements for NOUN students",
    secondaryKeywords: [
      "NOUN NELFUND requirements",
      "NELFUND matric number NOUN",
      "NELFUND documents for NOUN students",
      "NELFUND JAMB verification NOUN",
    ],
  },
  "why-nelfund-requests-a-jamb-registration-number": {
    title: "Why NELFUND Requests A JAMB Registration Number",
    seoTitle: "Why NELFUND Requests A JAMB Registration Number",
    description:
      "Learn why the current public NELFUND flow asks NOUN students for a JAMB registration number, what that step actually proves, and where students must stop short of turning JAMB verification into unsupported regularization claims.",
    seoDescription:
      "See why NELFUND asks NOUN students for a JAMB registration number, what the verification step confirms, and what it does not prove about regularization.",
    primaryKeyword: "why NELFUND requests a JAMB registration number",
    secondaryKeywords: [
      "NELFUND JAMB registration number NOUN",
      "NELFUND JAMB verification",
      "does NOUN need JAMB for NELFUND",
      "JAMB regularization NELFUND NOUN",
    ],
  },
  "noun-study-centres-in-abuja": {
    title: "NOUN Study Centres In Abuja: Verified Centres, What We Could Confirm, And What To Check First",
    seoTitle: "NOUN Study Centres in Abuja | Abuja Model",
    description:
      "Review the Abuja and FCT study-centre classifications recorded in an earlier editorial pass dated 19 June 2026, then recheck a centre before you travel.",
    seoDescription:
      "Learn which NOUN study centres in Abuja were verified, which listings remain partial, and how to confirm a centre before you travel.",
    primaryKeyword: "NOUN study centres in Abuja",
    secondaryKeywords: [
      "NOUN Abuja study centre",
      "NOUN study centre in FCT",
      "Abuja Model Study Centre",
      "Wuse II Study Centre Abuja",
    ],
  },
  "noun-study-centres-in-ogun": {
    title: "NOUN Study Centres In Ogun: Verified Centres In Abeokuta And Awa-Ijebu, Plus The Ilaro Caution",
    seoTitle: "NOUN Study Centres in Ogun State | Centre Guide",
    description:
      "Review the Ogun study-centre classifications recorded in an earlier editorial pass dated 19 June 2026, then recheck the right centre before travelling.",
    seoDescription:
      "Review verified NOUN study centres in Ogun State, including Abeokuta and Awa-Ijebu, and recheck current details before travelling.",
    primaryKeyword: "NOUN study centres in Ogun",
    secondaryKeywords: [
      "Abeokuta Study Centre Ogun",
      "Awa-Ijebu Community Study Centre Ogun",
      "Ilaro Community Study Centre Ogun",
      "NOUN study centre Ogun",
    ],
  },
  "how-to-open-your-noun-result-statement-from-the-support-portal": {
    title: "How To Open Your NOUN Result Statement From The Support Portal",
    seoTitle: "NOUN Result Statement | Support Portal Guide",
    description:
      "Learn the verified NOUN Support portal workflow for opening Result statement and reaching the ERP statement-of-result page that shows grades, CGPA, outstanding credit, and outstanding courses.",
    seoDescription:
      "Learn the verified NOUN Support portal workflow for opening your result statement and reaching the ERP page with grades, CGPA, and outstanding credits.",
    primaryKeyword: "how to open your NOUN result statement from the Support portal",
    secondaryKeywords: [
      "NOUN result statement",
      "NOUN support portal login",
      "result statement on support portal",
      "ERP statement of result NOUN",
    ],
  },
  "how-to-check-outstanding-courses-on-noun-result-statement": {
    title: "How To Check Outstanding Courses On NOUN Result Statement",
    seoTitle: "Check Outstanding Courses in NOUN",
    description:
      "Learn how the verified NOUN result statement page displays outstanding courses, where to find that section, and how to use it without assuming an unverified carryover workflow.",
    seoDescription:
      "Find the Outstanding Courses section on your NOUN result statement and follow the Support/ERP route without guessing unverified carryover rules.",
    primaryKeyword: "how to check outstanding courses on NOUN result statement",
    secondaryKeywords: [
      "noun outstanding courses",
      "outstanding courses noun result statement",
      "how to check carryover on noun portal",
      "noun result statement outstanding courses",
    ],
  },
  "how-to-generate-remita-for-noun": {
    title: "How to Use the NOUN Remita Payment Portal and Generate an RRR",
    seoTitle: "NOUN Remita Payment Portal: Generate RRR",
    description:
      "Use the official NOUN student portal to generate the correct Remita RRR, complete payment once, and check the payment status before creating another reference.",
    seoDescription:
      "Use the official NOUN payment portal to generate a Remita RRR, fund your e-wallet, pay once, and check payment status before creating another reference.",
    primaryKeyword: "noun remita payment portal",
    secondaryKeywords: [
      "how to generate remita for noun",
      "noun remita payment",
      "generate rrr noun",
      "how to generate rrr on noun portal",
    ],
    intentSection: {
      heading: "NOUN Remita Payment Portal: Where to Generate Your RRR",
      summary:
        "Start from the official NOUN student portal rather than a random Remita link. NOUN's returning-student procedure directs students to Manage Wallet, choose Load Wallet, enter the amount, click Pay, and copy the generated RRR for payment.",
      bullets: [
        "Open the official NOUN student portal and sign in.",
        "Go to Manage Wallet, choose Load Wallet, enter the correct amount, and click Pay.",
        "Copy the RRR generated for that payment and keep it with your receipt.",
        "After payment, return to Manage Wallet and use Check Payment Status before generating another reference.",
      ],
      officialSource: {
        label: "NOUN returning-student registration and payment procedure",
        href: "https://nou.edu.ng/procedure-for-registration-returning-students/",
      },
      nextStep: {
        label: "follow the full NOUN school-fee and e-wallet workflow",
        href: "/articles/how-to-pay-noun-school-fees",
      },
    },
  },
  "how-to-pay-noun-school-fees": {
    title: "How to Pay NOUN School Fees and Fund Your E-Wallet",
    seoTitle: "Pay NOUN School Fees & Fund Your E-Wallet",
    description:
      "Pay NOUN school fees through the official portal, fund your e-wallet safely, confirm the balance, keep your RRR and receipt, and avoid duplicate payment.",
    seoDescription:
      "Pay NOUN school fees through the official portal: fund your e-wallet, generate an RRR, confirm the balance, keep your receipt, and avoid duplicate payment.",
    primaryKeyword: "how to pay noun school fees",
    secondaryKeywords: [
      "how to fund my noun wallet",
      "how to fund my noun e wallet",
      "how to pay school fees on noun portal",
      "noun school fees payment portal",
    ],
    intentSection: {
      heading: "How to Fund Your NOUN E-Wallet",
      summary:
        "For returning students, NOUN's published procedure starts the funding flow inside the student portal. Use Manage Wallet and Load Wallet, enter the amount you actually need, generate the RRR, pay it once, then return to Check Payment Status before continuing with registration.",
      bullets: [
        "Sign in to the official NOUN student portal.",
        "Open Manage Wallet, select Load Wallet, enter the amount, and choose Pay.",
        "Save the generated RRR and use it for the payment.",
        "After payment, open Manage Wallet and Check Payment Status with your matric number and RRR.",
      ],
      officialSource: {
        label: "NOUN returning-student registration and payment procedure",
        href: "https://nou.edu.ng/procedure-for-registration-returning-students/",
      },
      nextStep: {
        label: "use the dedicated NOUN Remita payment portal and RRR guide",
        href: "/articles/how-to-generate-remita-for-noun",
      },
    },
  },
} satisfies Record<string, ArticleSearchIntentOverride>;

export function getArticleSearchIntentOverride(slug: string): ArticleSearchIntentOverride | null {
  return ARTICLE_SEARCH_INTENT_OVERRIDES[slug as keyof typeof ARTICLE_SEARCH_INTENT_OVERRIDES] ?? null;
}
