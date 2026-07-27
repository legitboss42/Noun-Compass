export const OFFICIAL_NOUN_RESULT_PORTAL = "https://database.nou.edu.ng/erp/";

export function normalizeMatriculationNumber(value: unknown) {
  return typeof value === "string"
    ? value.toUpperCase().replace(/[^A-Z0-9/-]/g, "").slice(0, 30)
    : "";
}

export function isValidMatriculationNumber(value: string) {
  return value.length >= 6 && value.length <= 30;
}
