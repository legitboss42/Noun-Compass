export function normalizeCourseCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isPlausibleCourseCode(value: string) {
  return /^[A-Z]{2,5}\d{3}$/.test(normalizeCourseCode(value));
}

export function uniqueCourseCodes(values: string[]) {
  return [...new Set(values.map(normalizeCourseCode).filter(Boolean))];
}
