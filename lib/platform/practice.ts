export const TIMED_MOCK_MINUTES = 40;

export function selectQuestionSet<T>(questions: T[], limit: number, random: () => number = Math.random) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.max(0, limit));
}

type QuestionMetadata = { module_label?: string | null; unit_label?: string | null; concept_key?: string | null };

export function selectBalancedQuestionSet<T extends QuestionMetadata>(questions: T[], limit: number, random: () => number = Math.random) {
  const shuffled = selectQuestionSet(questions, questions.length, random);
  const uniqueConcepts: T[] = [];
  const seenConcepts = new Set<string>();
  for (const question of shuffled) {
    const concept = question.concept_key?.trim().toLowerCase();
    if (concept && seenConcepts.has(concept)) continue;
    if (concept) seenConcepts.add(concept);
    uniqueConcepts.push(question);
  }
  const byModule = new Map<string, T[]>();
  for (const question of uniqueConcepts) {
    const key = question.module_label || "Unassigned";
    byModule.set(key, [...(byModule.get(key) ?? []), question]);
  }
  const selected: T[] = [];
  while (selected.length < limit && [...byModule.values()].some((items) => items.length)) {
    for (const items of byModule.values()) {
      const next = items.shift();
      if (next) selected.push(next);
      if (selected.length >= limit) break;
    }
  }
  return selected;
}

export function shuffledOptions<T>(options: T[], random: () => number = Math.random) {
  return selectQuestionSet(options, options.length, random);
}

export function timedMockExpiresAt(startedAt: string | Date) {
  return new Date(new Date(startedAt).getTime() + TIMED_MOCK_MINUTES * 60 * 1000);
}

export function scoreSession(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}
