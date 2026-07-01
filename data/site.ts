export const site = {
  name: "NOUN Compass",
  url: "https://www.nouncompass.me",
  contactEmail: "support@nouncompass.me",
  searchPath: "/student-guides",
  tagline: "Navigate NOUN with confidence",
  description:
    "Clear guides, tools, and study help for National Open University of Nigeria students.",
  disclaimer:
    "NOUN Compass breaks NOUN processes down in plain language. We are not the university, so always confirm final fees, deadlines, admissions, and account-specific details on official NOUN pages.",
};

export const navItems = [
  { label: "Admissions", href: "/admission" },
  { label: "School Fees Checker", href: "/fees" },
  { label: "Portal", href: "/portal" },
  { label: "Results", href: "/results" },
  { label: "Examinations", href: "/examinations" },
  { label: "Study Centres", href: "/study-centres" },
  { label: "GST", href: "/gst" },
  { label: "Student Guides", href: "/student-guides" },
  { label: "Course Materials", href: "/course-materials" },
  { label: "Tools", href: "/tools" },
];

export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavLink[];
};

export const navGroups: NavGroup[] = [
  { label: "Admissions", href: "/admission" },
  { label: "Fees", href: "/fees" },
  {
    label: "Academics",
    items: [
      { label: "Portal", href: "/portal" },
      { label: "Results", href: "/results" },
      { label: "Examinations", href: "/examinations" },
    ],
  },
  {
    label: "Study Help",
    items: [
      { label: "Student Guides", href: "/student-guides" },
      { label: "Course Materials", href: "/course-materials" },
      { label: "Study Centres", href: "/study-centres" },
      { label: "GST", href: "/gst" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    items: [
      { label: "All Tools", href: "/tools" },
      { label: "CGPA Calculator", href: "/tools/cgpa-calculator" },
      { label: "Study Planner", href: "/tools/study-planner" },
    ],
  },
];

export type Category = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
};

export const categories: Category[] = [
  { slug: "admission", name: "Admissions", eyebrow: "Start well", description: "Understand eligibility, application steps, documents, and what to do after receiving an admission offer." },
  { slug: "fees", name: "School Fees", eyebrow: "Plan your payments", description: "Clear guides to compulsory fees, semester charges, payment steps, and budgeting for your programme." },
  { slug: "portal", name: "Portal & Registration", eyebrow: "Get tasks done", description: "Guides for NOUN portal login, password reset, profile updates, course registration, support tickets, and common account issues." },
  { slug: "results", name: "Results", eyebrow: "Track progress", description: "Check NOUN results, My Progress, CGPA, outstanding courses, and result statements, and know the right next step when something looks wrong." },
  { slug: "examinations", name: "Examinations", eyebrow: "Prepare calmly", description: "Student-first guidance for exam registration, timetables, venues, rules, and effective preparation." },
  { slug: "study-centres", name: "Study Centres", eyebrow: "Find local support", description: "Location guides and practical tips for contacting and using NOUN study centres across Nigeria." },
  { slug: "gst", name: "GST Courses", eyebrow: "Master the essentials", description: "Original study summaries and learning guides for General Studies courses, without past-question repositories." },
  { slug: "student-guides", name: "Student Guides", eyebrow: "Navigate student life", description: "Plain-language workflows for new and returning students, from onboarding to graduation planning." },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
