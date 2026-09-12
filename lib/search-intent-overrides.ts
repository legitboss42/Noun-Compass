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
  intentSection: SearchIntentSection;
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
