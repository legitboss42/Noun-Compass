import { courseMaterials } from "@/lib/course-materials";

export function materialKeyForIndex(index: number) {
  const material = courseMaterials[index];
  if (!material) return "";
  return `${material.code}:${index}`;
}

export function listAiPracticeMaterials(limit = 1200) {
  return courseMaterials.slice(0, limit).map((material, index) => ({
    key: materialKeyForIndex(index),
    code: material.code,
    title: material.title,
    faculty: material.faculty,
    level: material.level,
    semester: material.semester,
  }));
}

