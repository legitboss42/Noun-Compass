import type { HomeIconName } from "@/components/homepage/home-icons";

export type StudentNavKey = "dashboard" | "exams" | "planner" | "resources" | "account";

export type StudentNavigationItem = {
  key: StudentNavKey;
  label: string;
  href: string;
  icon: HomeIconName;
};

export const signedOutMobileNavigation: StudentNavigationItem[] = [
  { key: "dashboard", label: "Home", href: "/", icon: "home" },
  { key: "exams", label: "Exams", href: "/exam-prep", icon: "graduation" },
  { key: "planner", label: "Planner", href: "/tools/study-planner", icon: "calendar" },
  { key: "resources", label: "Resources", href: "/student-guides", icon: "book" },
  { key: "account", label: "Account", href: "/account/sign-in", icon: "user" },
];

export const signedInStudentNavigation: StudentNavigationItem[] = [
  { key: "dashboard", label: "Home", href: "/dashboard", icon: "home" },
  { key: "exams", label: "Exams", href: "/dashboard/practice", icon: "graduation" },
  { key: "planner", label: "Planner", href: "/tools/study-planner", icon: "calendar" },
  { key: "resources", label: "Resources", href: "/course-materials", icon: "book" },
  { key: "account", label: "Account", href: "/dashboard/profile", icon: "user" },
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getStudentNavigationKey(pathname: string, signedIn: boolean): StudentNavKey | null {
  if (pathname === "/dashboard") return "dashboard";
  if (matchesPrefix(pathname, ["/dashboard/practice", "/practice", "/exam-prep"])) return "exams";
  if (matchesPrefix(pathname, ["/tools/study-planner"])) return "planner";
  if (matchesPrefix(pathname, ["/course-materials", "/student-guides", "/articles"])) return "resources";
  if (matchesPrefix(pathname, ["/dashboard/profile", "/membership", "/account/payment", "/dashboard/support"])) return "account";
  if (!signedIn && pathname === "/") return "dashboard";
  if (!signedIn && matchesPrefix(pathname, ["/account"])) return "account";
  return null;
}
