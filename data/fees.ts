export type StudyLevel = "undergraduate" | "pgd" | "masters";
export type StudentStatus = "new" | "returning";
export type Semester = "first" | "second";

export type FeeLine = {
  label: string;
  amount: number;
};

export const officialFeeSource =
  "https://nou.edu.ng/wp-content/uploads/2022/12/SCHEDULE-OF-UPWARD-REVIEW-_2.pdf";

export const baseFees: Record<StudyLevel, Record<StudentStatus, FeeLine[]>> = {
  undergraduate: {
    new: [
      { label: "Semester registration fee", amount: 7500 },
      { label: "Caution deposit", amount: 5000 },
      { label: "Orientation fee", amount: 3000 },
      { label: "Matriculation fee", amount: 2500 },
      { label: "I.D. card", amount: 1000 },
      { label: "Library fee", amount: 4000 },
      { label: "ICT administration charge", amount: 7500 },
      { label: "E-facilitation", amount: 7500 },
      { label: "JAMB regularization", amount: 7500 },
      { label: "Result verification", amount: 10000 },
    ],
    returning: [
      { label: "Semester registration fee", amount: 6000 },
      { label: "Library fee", amount: 3000 },
      { label: "ICT administration charge", amount: 5000 },
      { label: "E-facilitation", amount: 4000 },
    ],
  },
  pgd: {
    new: [
      { label: "Semester registration fee", amount: 10000 },
      { label: "Caution deposit", amount: 7000 },
      { label: "Orientation fee", amount: 5000 },
      { label: "Matriculation fee", amount: 3000 },
      { label: "I.D. card", amount: 1000 },
      { label: "Library fee", amount: 5000 },
      { label: "ICT administration charge", amount: 7500 },
      { label: "E-facilitation", amount: 7500 },
      { label: "Result verification", amount: 10000 },
      { label: "Student transcript verification", amount: 5000 },
    ],
    returning: [
      { label: "Semester registration fee", amount: 10000 },
      { label: "Library fee", amount: 5000 },
      { label: "ICT administration charge", amount: 7500 },
      { label: "E-facilitation", amount: 7500 },
    ],
  },
  masters: {
    new: [
      { label: "Semester registration fee", amount: 10000 },
      { label: "Caution deposit", amount: 7000 },
      { label: "Orientation fee", amount: 5000 },
      { label: "Matriculation fee", amount: 3000 },
      { label: "I.D. card", amount: 1000 },
      { label: "Library fee", amount: 5000 },
      { label: "ICT administration charge", amount: 7500 },
      { label: "E-facilitation", amount: 7500 },
      { label: "Result verification", amount: 10000 },
      { label: "Student transcript verification", amount: 5000 },
    ],
    returning: [
      { label: "Semester registration fee", amount: 10000 },
      { label: "Library fee", amount: 5000 },
      { label: "ICT administration charge", amount: 7500 },
      { label: "E-facilitation", amount: 7500 },
    ],
  },
};

export const courseRates: Record<StudyLevel, { two: number; three: number; four: number; exam: number }> = {
  undergraduate: { two: 2000, three: 2500, four: 3000, exam: 1500 },
  pgd: { two: 4000, three: 5000, four: 0, exam: 3000 },
  masters: { two: 4000, three: 5000, four: 0, exam: 3000 },
};

export const optionalFees: Record<StudyLevel, FeeLine[]> = {
  undergraduate: [
    { label: "Undergraduate project", amount: 25000 },
    { label: "Undergraduate seminar course", amount: 5000 },
    { label: "Teaching practice / SIWES", amount: 12000 },
    { label: "Health Sciences clinical attachment", amount: 15000 },
    { label: "Faculty of Science practical courses", amount: 5000 },
  ],
  pgd: [
    { label: "Postgraduate Diploma project", amount: 40000 },
    { label: "PGD seminar course", amount: 10000 },
    { label: "PGDE teaching practice", amount: 15000 },
  ],
  masters: [
    { label: "Masters project", amount: 50000 },
    { label: "Masters seminar course", amount: 10000 },
    { label: "Masters practicum / clinical attachment", amount: 20000 },
  ],
};
