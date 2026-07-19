export const revisionIntervalsDays = [1, 3, 7, 14, 30] as const;

export function nextRevisionState(currentBox: number, correct: boolean, answeredAt = new Date()) {
  const box = correct ? Math.min(5, Math.max(1, currentBox) + 1) : 1;
  const intervalDays = revisionIntervalsDays[box - 1];
  const dueAt = new Date(answeredAt.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return { box, intervalDays, dueAt };
}
