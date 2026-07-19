export const TIMED_MOCK_MINUTES = 40;

export function selectQuestionSet<T>(questions: T[], limit: number, random: () => number = Math.random) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.max(0, limit));
}

export function timedMockExpiresAt(startedAt: string | Date) {
  return new Date(new Date(startedAt).getTime() + TIMED_MOCK_MINUTES * 60 * 1000);
}

export function scoreSession(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

