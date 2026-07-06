export type EditorialProfile = {
  name: string;
  href: string;
  type: "Person" | "Organization";
  title: string;
  description: string;
};

const editorialProfiles: Record<string, EditorialProfile> = {
  "Victor Chinukwue": {
    name: "Victor Chinukwue",
    href: "/authors/victor",
    type: "Person",
    title: "Founder / Editor, NOUN Compass",
    description:
      "Founder and editor of NOUN Compass, responsible for editorial direction, technical quality, and student-help publishing.",
  },
  "NOUN Compass Editorial Team": {
    name: "NOUN Compass Editorial Team",
    href: "/authors/editorial-team",
    type: "Organization",
    title: "Research and Review Team",
    description:
      "The NOUN Compass editorial team checks student guides for clarity, source quality, and practical accuracy.",
  },
  "Student Workflow Review Desk": {
    name: "Student Workflow Review Desk",
    href: "/reviewers/student-workflow",
    type: "Organization",
    title: "Workflow Review Desk",
    description:
      "The review desk responsible for checking portal, registration, results, and operational workflow guides before publication.",
  },
  "Student Finance Review Desk": {
    name: "Student Finance Review Desk",
    href: "/reviewers/student-finance",
    type: "Organization",
    title: "Finance Review Desk",
    description:
      "The review desk responsible for checking NELFUND, payment, wallet, and financial-process guidance before publication.",
  },
};

export function getEditorialProfile(name: string): EditorialProfile {
  return (
    editorialProfiles[name] ?? {
      name,
      href: "/editorial-policy",
      type: "Organization",
      title: "Editorial contributor",
      description: "Editorial contributor profile for NOUN Compass.",
    }
  );
}
