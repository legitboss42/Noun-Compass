import { courseMaterials } from "@/lib/course-materials";
import { normalizeCourseCode } from "./course-codes";

export function materialKeyForIndex(index: number) {
  const material = courseMaterials[index];
  if (!material) return "";
  return `${material.code}:${index}`;
}

export function resolveAiPracticeMaterial(key: string) {
  const match = /^([A-Z]{2,4}\d{3}):(\d+)$/i.exec(key.trim());
  if (!match) return null;
  const index = Number(match[2]);
  const material = courseMaterials[index];
  if (!material || material.code !== match[1].toUpperCase()) return null;
  if (!/^https:\/\/nou\.edu\.ng\/coursewarecontent\//i.test(material.url)) return null;
  return material;
}

export function listAiPracticeMaterials(limit = courseMaterials.length) {
  return courseMaterials.slice(0, limit).map((material, index) => ({
    key: materialKeyForIndex(index),
    code: material.code,
    title: material.title,
    creditUnits: material.creditUnits,
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
      creditUnits: material.creditUnits,
      faculty: material.faculty,
      level: material.level,
      semester: material.semester,
    }));
}

export function maxAiPracticeQuestionsForMaterial(
  material: { creditUnits?: string | null },
  premium: boolean,
) {
  if (!premium) return 15;
  const units = Number.parseInt(String(material.creditUnits ?? ""), 10);
  return units >= 3 ? 100 : 70;
}
