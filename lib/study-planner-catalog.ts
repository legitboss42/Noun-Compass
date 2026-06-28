import { extractedCurricula } from "@/data/curricula";
import { courseMaterials, findCourseMaterial } from "@/lib/course-materials";

export type StudyPlannerCourse = {
  code: string;
  title: string;
  units: number | null;
  materialAvailable: boolean;
  source: "curriculum" | "material-library";
  faculties: string[];
};

const normalizeCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const normalizeUnits = (value: number | string | null | undefined) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const catalogMap = new Map<string, StudyPlannerCourse>();

for (const programme of extractedCurricula) {
  for (const level of programme.levels) {
    for (const semester of level.semesters) {
      for (const course of semester.courses) {
        const code = normalizeCode(course.code);
        if (!code) continue;
        const existing = catalogMap.get(code);
        const material = findCourseMaterial(code, course.title);
        const faculties = new Set([...(existing?.faculties ?? []), programme.faculty]);
        catalogMap.set(code, {
          code,
          title: existing?.title ?? course.title,
          units: existing?.units ?? course.units ?? null,
          materialAvailable: existing?.materialAvailable ?? Boolean(material),
          source: "curriculum",
          faculties: [...faculties].sort(),
        });
      }
    }
  }
}

for (const material of courseMaterials) {
  const code = normalizeCode(material.code);
  if (!code) continue;
  const existing = catalogMap.get(code);
  if (existing) {
    existing.materialAvailable = true;
    if (!existing.faculties.includes(material.sourceFaculty)) {
      existing.faculties = [...existing.faculties, material.sourceFaculty].sort();
    }
    continue;
  }
  catalogMap.set(code, {
    code,
    title: material.title,
    units: normalizeUnits(material.creditUnits),
    materialAvailable: true,
    source: "material-library",
    faculties: [material.sourceFaculty],
  });
}

export const studyPlannerCatalog = [...catalogMap.values()].sort((a, b) => a.code.localeCompare(b.code));
export const recognizedCourseCatalog = studyPlannerCatalog.filter((item) => item.source === "curriculum");
export const studyPlannerStats = {
  totalSuggestionCodes: studyPlannerCatalog.length,
  recognizedCourseCodes: recognizedCourseCatalog.length,
  recognizedWithMaterials: recognizedCourseCatalog.filter((item) => item.materialAvailable).length,
  recognizedWithoutMaterials: recognizedCourseCatalog.filter((item) => !item.materialAvailable).length,
};

function scoreCourseMatch(course: StudyPlannerCourse, query: string) {
  const normalizedQuery = query.trim().toUpperCase();
  const title = course.title.toUpperCase();
  if (!normalizedQuery) return -1;
  if (course.code === normalizedQuery) return 100;
  if (course.code.startsWith(normalizedQuery)) return 90;
  if (course.code.includes(normalizedQuery)) return 80;
  if (title.startsWith(normalizedQuery)) return 70;
  if (title.includes(normalizedQuery)) return 60;
  return -1;
}

export function searchStudyPlannerCourses(query: string, limit = 8) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];
  return studyPlannerCatalog
    .map((course) => ({ course, score: scoreCourseMatch(course, normalizedQuery) }))
    .filter((item) => item.score >= 0)
    .sort((left, right) => right.score - left.score || left.course.code.localeCompare(right.course.code))
    .slice(0, limit)
    .map((item) => item.course);
}
