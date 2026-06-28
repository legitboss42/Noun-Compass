export type RecoverySource = {
  type: "official-handbook" | "official-programme-page" | "official-digital-catalog" | "portal-export-needed";
  url?: string;
  note: string;
};

export type CurriculumRecoveryItem = {
  programme: string;
  faculty: string;
  category: "undergraduate" | "postgraduate";
  status: "recovered" | "source-found" | "research-needed" | "portal-export-needed";
  sources: RecoverySource[];
};

const portalExportSource: RecoverySource = {
  type: "portal-export-needed",
  note: "No complete public curriculum has been verified yet. Obtain a current portal curriculum export without collecting student credentials or personal data.",
};

const artsHandbook = "https://www.foa.nou.edu.ng/wp-content/uploads/2022/10/FOA-Handbook-reviewed-12th-oct-2022.pdf";

export const curriculumRecoveryQueue: CurriculumRecoveryItem[] = [
  {
    programme: "B.Agric Crop Science",
    faculty: "Faculty of Agriculture",
    category: "undergraduate",
    status: "source-found",
    sources: [
      { type: "official-programme-page", url: "https://digital.nou.edu.ng/programmes/bagric-crop-science", note: "Official programme record and programme ID." },
      { type: "official-programme-page", url: "https://fas.nou.edu.ng/crop-and-soil-sciences-courses/", note: "Official department course-list page; semester placement still requires verification." },
    ],
  },
  {
    programme: "PGD. Agricultural Extension Management",
    faculty: "Faculty of Agriculture",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  },
  {
    programme: "B.A. Arabic",
    faculty: "Faculty of Arts",
    category: "undergraduate",
    status: "recovered",
    sources: [
      { type: "official-handbook", url: artsHandbook, note: "Faculty handbook contains the programme structure and course outline." },
      { type: "official-programme-page", url: "https://digital.nou.edu.ng/programmes/ba-arabic", note: "Official programme record and programme ID." },
    ],
  },
  {
    programme: "B.A. Christian Theology",
    faculty: "Faculty of Arts",
    category: "undergraduate",
    status: "recovered",
    sources: [
      { type: "official-handbook", url: artsHandbook, note: "Faculty handbook contains the Christian Theology programme outline." },
    ],
  },
  {
    programme: "PGD. Christian Theology",
    faculty: "Faculty of Arts",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  },
  ...[
    "M.A. Islamic Studies",
    "M.A. English (Language)",
    "M.A. English (Literature In English)",
    "M.A. English (Comparative Literature)",
    "M.A. Christian Religious Studies (Old Testament)",
    "M.A. Christian Religious Studies (New Testament)",
    "M.A. Christian Religious Studies (Church History)",
    "M.A. Christian Religious Studies (Philosophy of Religion)",
    "M.A. Christian Religious Studies (African Traditional Religion)",
    "M.A. Christian Religious Studies (Systematic Theology)",
    "M.A. Christian Religious Studies (Pastoral Theology)",
  ].map((programme): CurriculumRecoveryItem => ({
    programme,
    faculty: "Faculty of Arts",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  })),
  {
    programme: "B.Sc. Cyber Security",
    faculty: "Faculty of Computing",
    category: "undergraduate",
    status: "recovered",
    sources: [
      { type: "official-programme-page", url: "https://foc.nou.edu.ng/department-of-cyber-security/", note: "Official department and programme confirmation." },
      { type: "official-handbook", url: "https://foc.nou.edu.ng/wp-content/uploads/sites/5/2026/02/OPP-and-DPP-NOUN-BSc-Cybersecurity-2024-1.pdf", note: "Official detailed programme document containing the curriculum structure." },
    ],
  },
  {
    programme: "PGD. Education",
    faculty: "Faculty of Education",
    category: "postgraduate",
    status: "source-found",
    sources: [
      { type: "official-handbook", url: "https://nou.edu.ng/wp-content/uploads/sites/11/2022/02/EDUCATION-Handbook-updated-June-28-2019.pdf", note: "Official Faculty of Education handbook; confirm against the current portal before publishing." },
    ],
  },
  ...["PGD. Legislative Drafting", "LLM Law"].map((programme): CurriculumRecoveryItem => ({
    programme,
    faculty: "Faculty of Law",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  })),
  {
    programme: "M.Sc. Entrepreneurship",
    faculty: "Faculty of Management Science",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  },
  ...[
    "M.Sc. Chemistry (Analytical Chemistry)",
    "M.Sc. Chemistry (Environmental Chemistry)",
    "M.Sc. Chemistry (Organic Chemistry)",
  ].map((programme): CurriculumRecoveryItem => ({
    programme,
    faculty: "Faculty of Sciences",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  })),
  {
    programme: "B.sc. Broadcast journalism",
    faculty: "Faculty of Social Sciences",
    category: "undergraduate",
    status: "research-needed",
    sources: [
      { type: "official-digital-catalog", url: "https://digital.nou.edu.ng/programmes", note: "Official digital catalog confirms the programme, but a complete semester-by-semester curriculum has not been located." },
    ],
  },
  ...["PGD. Economics", "PGD. Criminology and Security Studies"].map((programme): CurriculumRecoveryItem => ({
    programme,
    faculty: "Faculty of Social Sciences",
    category: "postgraduate",
    status: "portal-export-needed",
    sources: [portalExportSource],
  })),
];
