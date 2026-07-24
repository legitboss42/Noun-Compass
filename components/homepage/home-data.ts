import type { HomeIconName } from "@/components/homepage/home-icons";

export type HomeNavItem = {
  label: string;
  href?: string;
  items?: { label: string; href: string }[];
};

export const homeNavigation: HomeNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Admissions", href: "/admission" },
  {
    label: "Study",
    items: [
      { label: "Student guides", href: "/student-guides" },
      { label: "Course materials", href: "/course-materials" },
      { label: "GST guides", href: "/gst" },
      { label: "Study centres", href: "/study-centres" },
    ],
  },
  {
    label: "Exams",
    items: [
      { label: "Exam preparation", href: "/exam-prep" },
      { label: "Examination guides", href: "/examinations" },
      { label: "Results help", href: "/results" },
    ],
  },
  { label: "Tools", href: "/tools" },
  {
    label: "Resources",
    items: [
      { label: "Portal help", href: "/portal" },
      { label: "School fees", href: "/fees" },
      { label: "Latest student guides", href: "/student-guides" },
    ],
  },
  { label: "Membership", href: "/membership" },
  { label: "About", href: "/about" },
];

export const quickAccessItems: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: HomeIconName;
  tone: "green" | "gold" | "blue" | "violet";
}[] = [
  {
    title: "Mock Exams",
    description: "Explore the first GST practice courses and see what each reviewed bank will cover.",
    href: "/exam-prep",
    cta: "View exam preparation",
    icon: "graduation",
    tone: "green",
  },
  {
    title: "Course Materials",
    description: "Search the indexed NOUN course-material library by the code on your registration record.",
    href: "/course-materials",
    cta: "Browse materials",
    icon: "document",
    tone: "gold",
  },
  {
    title: "Student Tools",
    description: "Check results, estimate fees and CGPA, or build a practical weekly study plan.",
    href: "/tools",
    cta: "Explore tools",
    icon: "tools",
    tone: "blue",
  },
  {
    title: "Updates & Guides",
    description: "Read recently updated guidance for NOUN tasks, deadlines and student decisions.",
    href: "/student-guides",
    cta: "Read student guides",
    icon: "megaphone",
    tone: "violet",
  },
];

export const studentTools: {
  title: string;
  description: string;
  href: string;
  icon: HomeIconName;
  tone: "green" | "gold" | "blue" | "violet" | "rose";
}[] = [
  {
    title: "Result Checker",
    description: "Open your result statement through the official result service.",
    href: "/tools/result-checker",
    icon: "search",
    tone: "green",
  },
  {
    title: "School Fees Checker",
    description: "Estimate a semester breakdown, then confirm it on your portal.",
    href: "/fees",
    icon: "receipt",
    tone: "gold",
  },
  {
    title: "Study Planner",
    description: "Build a weekly plan around your courses and available time.",
    href: "/tools/study-planner",
    icon: "calendar",
    tone: "blue",
  },
  {
    title: "CGPA Calculator",
    description: "Estimate semester GPA and running CGPA from your scores.",
    href: "/tools/cgpa-calculator",
    icon: "chart",
    tone: "violet",
  },
  {
    title: "Free Exam Diagnostic",
    description: "Open your practice dashboard and check available course activity.",
    href: "/dashboard/practice",
    icon: "clipboard",
    tone: "rose",
  },
];

export const trustPoints: {
  title: string;
  description: string;
  icon: HomeIconName;
}[] = [
  {
    title: "Built for NOUN students",
    description: "Navigation follows the real tasks students handle throughout a semester.",
    icon: "compass",
  },
  {
    title: "Clear source checks",
    description: "Guides show update dates and point to official pages for final confirmation.",
    icon: "check",
  },
  {
    title: "Independent guidance",
    description: "NounCompass is not NOUN and does not act on behalf of the university.",
    icon: "book",
  },
  {
    title: "Secure platform access",
    description: "Account and payment details use the platform’s existing secure services.",
    icon: "shield",
  },
];
