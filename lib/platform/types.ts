export const userRoles = [
  "student",
  "support_agent",
  "content_editor",
  "academic_reviewer",
  "super_admin",
] as const;

export type UserRole = (typeof userRoles)[number];
export type MembershipStatus = "pending" | "active" | "expired" | "refunded" | "revoked";
export type ContentStatus = "draft" | "review" | "published" | "retired";
export type ExamMode = "e-exam" | "pop" | "mixed";
export type DataConfidence = "verified" | "estimated" | "user-entered";

export type StudentProfile = {
  id: string;
  displayName: string | null;
  programme: string | null;
  level: number | null;
  semester: 1 | 2 | null;
  entryMode: "normal" | "direct-entry" | null;
  studyCentre: string | null;
  examMode: ExamMode | null;
  selectedCourseCodes: string[];
  availableStudyDays: string[];
  onboardingCompletedAt: string | null;
};

export type MembershipSummary = {
  status: MembershipStatus;
  startsAt: string | null;
  endsAt: string | null;
};
