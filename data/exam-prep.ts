export type ExamPrepCourse = {
  code: string;
  slug: string;
  title: string;
  level: number;
  semester: 1 | 2;
  examMode: "e-exam" | "pop" | "mixed";
  sourceUrl: string;
  description: string;
  topics: string[];
  previewPrompts: string[];
};

export const examPrepCourses: ExamPrepCourse[] = [
  {
    code: "GST101", slug: "gst101", title: "Use of English and Communication Skills I", level: 100, semester: 1, examMode: "e-exam", sourceUrl: "https://nou.edu.ng/coursewarecontent/GST%20101.pdf",
    description: "Build clearer reading, vocabulary, sentence, and academic communication habits before practising reviewed questions.",
    topics: ["Reading comprehension", "Vocabulary in context", "Sentence structure", "Academic communication"],
    previewPrompts: ["Which clue in a paragraph best helps a reader infer an unfamiliar word?", "What makes a sentence complete rather than a fragment?"],
  },
  {
    code: "GST102", slug: "gst102", title: "Use of English and Communication Skills II", level: 100, semester: 2, examMode: "e-exam", sourceUrl: "https://nou.edu.ng/coursewarecontent/GST%20102.pdf",
    description: "Practise the communication, writing, and language-analysis skills expected in the second English course.",
    topics: ["Writing process", "Paragraph development", "Communication purpose", "Language use"],
    previewPrompts: ["Which revision step checks whether a paragraph supports its main idea?", "How does audience change the language used in a formal message?"],
  },
  {
    code: "GST107", slug: "gst107", title: "A Study Guide for the Distance Learner", level: 100, semester: 1, examMode: "e-exam", sourceUrl: "https://nou.edu.ng/coursewarecontent/GST%20107%20October%202018_docx.pdf",
    description: "Develop practical distance-learning routines for planning, active reading, note-making, and self-assessment.",
    topics: ["Distance learning", "Time planning", "Active reading", "Self-assessment"],
    previewPrompts: ["Which study action turns a broad weekly goal into a task that can be scheduled?", "Why should a distance learner test recall instead of only rereading?"],
  },
  {
    code: "GST201", slug: "gst201", title: "Nigerian Peoples and Culture", level: 200, semester: 1, examMode: "e-exam", sourceUrl: "https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf",
    description: "Review concepts about Nigerian peoples, cultural interaction, values, institutions, and national development.",
    topics: ["Culture and society", "Nigerian diversity", "Social institutions", "National development"],
    previewPrompts: ["How can a shared institution influence people from different cultural groups?", "What is the difference between describing cultural diversity and stereotyping a group?"],
  },
  {
    code: "GST302", slug: "gst302", title: "Business Creation and Growth", level: 300, semester: 2, examMode: "mixed", sourceUrl: "https://nou.edu.ng/coursewarecontent/GST%20302%20.pdf",
    description: "Connect opportunity recognition, business models, finance, operations, and sustainable enterprise growth.",
    topics: ["Opportunity recognition", "Business models", "Small-business finance", "Growth planning"],
    previewPrompts: ["What evidence distinguishes a promising opportunity from an untested business idea?", "Why should a growing business monitor cash flow separately from profit?"],
  },
];

export function getExamPrepCourse(slugOrCode: string) {
  const normalized = slugOrCode.toLowerCase();
  return examPrepCourses.find((course) => course.slug === normalized || course.code.toLowerCase() === normalized);
}
