export type CoverThemeName =
  | "admissions"
  | "school-fees"
  | "course-registration"
  | "results"
  | "tma"
  | "elearn"
  | "study-centres"
  | "nelfund"
  | "gst-courses"
  | "graduation"
  | "nysc"
  | "portal-guides"
  | "academic-calendar"
  | "past-questions"
  | "student-life"
  | "tools"
  | "support"
  | "faqs"
  | "news"
  | "announcements";

export type CoverTheme = {
  name: CoverThemeName;
  label: string;
  accent: string;
  accentSoft: string;
  navy: string;
  gold: string;
  ink: string;
  illustration: "compass" | "admission" | "wallet" | "registration" | "results" | "elearn" | "centre" | "nelfund" | "gst" | "support" | "calendar" | "graduation" | "tool" | "news";
};

export const coverThemes: Record<CoverThemeName, CoverTheme> = {
  admissions: { name: "admissions", label: "Admissions", accent: "#0E7A3E", accentSoft: "#DDF4E6", navy: "#12243B", gold: "#D6A21D", ink: "#0D1725", illustration: "admission" },
  "school-fees": { name: "school-fees", label: "School Fees", accent: "#0E7A3E", accentSoft: "#E6F5EC", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "wallet" },
  "course-registration": { name: "course-registration", label: "Course Registration", accent: "#0E7A3E", accentSoft: "#E0F4EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "registration" },
  results: { name: "results", label: "Results", accent: "#0E7A3E", accentSoft: "#E8F6EF", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "results" },
  tma: { name: "tma", label: "TMA", accent: "#0E7A3E", accentSoft: "#E6F6EF", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "elearn" },
  elearn: { name: "elearn", label: "eLearn", accent: "#0E7A3E", accentSoft: "#E6F6EF", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "elearn" },
  "study-centres": { name: "study-centres", label: "Study Centres", accent: "#0E7A3E", accentSoft: "#E5F5ED", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "centre" },
  nelfund: { name: "nelfund", label: "NELFUND", accent: "#0E7A3E", accentSoft: "#EAF8EE", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "nelfund" },
  "gst-courses": { name: "gst-courses", label: "GST Courses", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "gst" },
  graduation: { name: "graduation", label: "Graduation", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "graduation" },
  nysc: { name: "nysc", label: "NYSC", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "graduation" },
  "portal-guides": { name: "portal-guides", label: "Portal Guides", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "compass" },
  "academic-calendar": { name: "academic-calendar", label: "Academic Calendar", accent: "#0E7A3E", accentSoft: "#E8F5EC", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "calendar" },
  "past-questions": { name: "past-questions", label: "Past Questions", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "gst" },
  "student-life": { name: "student-life", label: "Student Life", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "compass" },
  tools: { name: "tools", label: "Tools", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "tool" },
  support: { name: "support", label: "Support", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "support" },
  faqs: { name: "faqs", label: "FAQs", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "compass" },
  news: { name: "news", label: "News", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "news" },
  announcements: { name: "announcements", label: "Announcements", accent: "#0E7A3E", accentSoft: "#E7F6EA", navy: "#12243B", gold: "#D6A21D", ink: "#112234", illustration: "news" },
};

export function resolveCoverTheme(category: string, title = ""): CoverThemeName {
  const haystack = `${category} ${title}`.toLowerCase();
  if (haystack.includes("nelfund")) return "nelfund";
  if (haystack.includes("tma")) return "tma";
  if (haystack.includes("elearn")) return "elearn";
  if (haystack.includes("study centre") || haystack.includes("study center")) return "study-centres";
  if (haystack.includes("result") || haystack.includes("cgpa") || haystack.includes("outstanding")) return "results";
  if (haystack.includes("exam")) return "portal-guides";
  if (haystack.includes("admission")) return "admissions";
  if (haystack.includes("fee") || haystack.includes("wallet") || haystack.includes("remita")) return "school-fees";
  if (haystack.includes("register") || haystack.includes("course registration") || haystack.includes("portal")) return "course-registration";
  if (haystack.includes("support") || haystack.includes("ticket")) return "support";
  if (haystack.includes("gst")) return "gst-courses";
  if (haystack.includes("calendar")) return "academic-calendar";
  if (haystack.includes("graduation") || haystack.includes("convocation")) return "graduation";
  if (haystack.includes("nysc")) return "nysc";
  if (haystack.includes("tool") || category === "tools") return "tools";
  if (category === "admission") return "admissions";
  if (category === "fees") return "school-fees";
  if (category === "results") return "results";
  if (category === "study-centres") return "study-centres";
  if (category === "gst") return "gst-courses";
  if (category === "portal") return "portal-guides";
  return "student-life";
}
