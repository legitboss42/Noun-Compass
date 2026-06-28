import rawCurricula from "@/data/puredu-curricula.json";
import rawFeeSnapshot from "@/data/puredu-fee-snapshot.json";
import rawNounUpdateFeeSnapshot from "@/data/nounupdate-fee-snapshot.json";
import { officialCurricula } from "@/data/official-curricula";

export type ExtractedCourse = {
  code: string;
  title: string;
  units: number;
  status: string;
  courseFee: number;
  examFee: number;
};

export type ExtractedSemester = {
  semester: string;
  label: string;
  semesterFee: number;
  courses: ExtractedCourse[];
  feeSource?: "puredu-live-snapshot" | "nounupdate-live-snapshot";
  feeRetrievedAt?: string;
  sourceTotals?: {
    courseFee: number;
    examFee: number;
    semesterFee: number;
    allFees: number;
  };
};

export type ExtractedLevel = {
  level: string;
  label: string;
  semesters: ExtractedSemester[];
};

export type ExtractedProgramme = {
  faculty: string;
  program: string;
  levels: ExtractedLevel[];
  sourceType?: "official-handbook" | "official-programme-document";
  sourceUrl?: string;
  sourceLabel?: string;
};

const pureduCurricula = rawCurricula as ExtractedProgramme[];
const feeSnapshot = rawFeeSnapshot as {
  retrievedAt: string;
  results: Array<{
    faculty: string;
    program: string;
    level: string;
    semester: string;
    semesterLabel: string;
    status: string;
    courses: ExtractedCourse[];
    totals: {
      courseFee: number;
      examFee: number;
      semesterFee: number;
      allFees: number;
    };
  }>;
};
const capturedFeeResults = new Map(
  feeSnapshot.results
    .filter((item) => item.status === "captured")
    .map((item) => [`${item.faculty}|${item.program}|${item.level}|${item.semester}`, item]),
);
const refreshedPureduCurricula = pureduCurricula.map((programme) => ({
  ...programme,
  levels: programme.levels.map((level) => ({
    ...level,
    semesters: level.semesters.map((semester) => {
      const result = capturedFeeResults.get(`${programme.faculty}|${programme.program}|${level.level}|${semester.semester}`);
      return result ? {
        ...semester,
        semesterFee: result.totals.semesterFee,
        courses: result.courses,
        feeSource: "puredu-live-snapshot" as const,
        feeRetrievedAt: feeSnapshot.retrievedAt,
        sourceTotals: result.totals,
      } : semester;
    }),
  })),
}));
const officialProgrammeKeys = new Set(officialCurricula.map((item) => `${item.faculty}|${item.program}`));
const combinedCurricula = [
  ...refreshedPureduCurricula.filter((item) => !officialProgrammeKeys.has(`${item.faculty}|${item.program}`)),
  ...officialCurricula,
];

const nounUpdateFeeSnapshot = rawNounUpdateFeeSnapshot as typeof feeSnapshot;
const normalizeProgramme = (value: string) => value
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/sciences/g, "science")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const nounUpdateResults = new Map(
  nounUpdateFeeSnapshot.results
    .filter((item) => item.status === "captured")
    .map((item) => [`${normalizeProgramme(item.program)}|${item.level}|${item.semester}`, item]),
);

export const extractedCurricula = combinedCurricula.map((programme) => ({
  ...programme,
  levels: programme.levels.map((level) => ({
    ...level,
    semesters: level.semesters.map((semester) => {
      if (semester.feeSource) return semester;
      const result = nounUpdateResults.get(`${normalizeProgramme(programme.program)}|${level.level}|${semester.semester}`);
      return result ? {
        ...semester,
        semesterFee: result.totals.semesterFee,
        courses: result.courses,
        feeSource: "nounupdate-live-snapshot" as const,
        feeRetrievedAt: nounUpdateFeeSnapshot.retrievedAt,
        sourceTotals: result.totals,
      } : semester;
    }),
  })),
})).sort((a, b) => a.faculty.localeCompare(b.faculty) || a.program.localeCompare(b.program));
export const extractedFaculties = [...new Set(extractedCurricula.map((item) => item.faculty))];
export const pureduFeeSnapshotRetrievedAt = feeSnapshot.retrievedAt;
export const nounUpdateFeeSnapshotRetrievedAt = nounUpdateFeeSnapshot.retrievedAt;
