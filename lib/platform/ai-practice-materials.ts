import { courseMaterials } from "@/lib/course-materials";
import { normalizeCourseCode } from "./course-codes";

export function materialKeyForIndex(index: number) {
  const material = courseMaterials[index];
  if (!material) return "";
  return `${material.code}:${index}`;
}

export function listAiPracticeMaterials(limit = courseMaterials.length) {
  return courseMaterials.slice(0, limit).map((material, index) => ({
    key: materialKeyForIndex(index),
    code: material.code,
    title: material.title,
    faculty: material.faculty,
    level: material.level,
    semester: material.semester,
  }));
}

export function listAiPracticeMaterialsForCourseCodes(codes: string[]) {
  const selected = new Set(codes.map(normalizeCourseCode).filter(Boolean));
  if (!selected.size) return [];
  return courseMaterials
    .map((material, index) => ({ material, index }))
    .filter(({ material }) => selected.has(normalizeCourseCode(material.code)))
    .map(({ material, index }) => ({
      key: materialKeyForIndex(index),
      code: material.code,
      title: material.title,
      faculty: material.faculty,
      level: material.level,
      semester: material.semester,
    }));
}
