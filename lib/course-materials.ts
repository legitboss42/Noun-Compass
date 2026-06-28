import rawMaterials from "@/data/official-course-materials.json";

export type CourseMaterial = (typeof rawMaterials.materials)[number];

export const courseMaterials = rawMaterials.materials as CourseMaterial[];
export const courseMaterialStats = rawMaterials.stats;
export const courseMaterialsRetrievedAt = rawMaterials.retrievedAt;

const byCode = new Map<string, CourseMaterial[]>();
for (const material of courseMaterials) {
  const existing = byCode.get(material.code) ?? [];
  existing.push(material);
  byCode.set(material.code, existing);
}

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\b(i|ii|iii|iv|v)\b/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function similarity(left: string, right: string) {
  const a = new Set(normalize(left).split(" ").filter((word) => word.length > 2));
  const b = new Set(normalize(right).split(" ").filter((word) => word.length > 2));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / Math.max(a.size, b.size);
}

export function findCourseMaterial(code: string, title: string) {
  const matches = byCode.get(code.toUpperCase().replace(/[^A-Z0-9]/g, "")) ?? [];
  if (matches.length === 1) return matches[0];
  return matches
    .map((material) => ({ material, score: similarity(material.title, title) }))
    .sort((a, b) => b.score - a.score)
    .find((match) => match.score >= 0.6)?.material;
}

export function courseMaterialGuideUrl(material: Pick<CourseMaterial, "code">) {
  return `/student-guides?q=${encodeURIComponent(material.code)}`;
}

export function courseMaterialDownloadUrl(material: Pick<CourseMaterial, "code" | "url">) {
  const params = new URLSearchParams({ code: material.code, url: material.url });
  return `/api/course-materials/download?${params.toString()}`;
}
