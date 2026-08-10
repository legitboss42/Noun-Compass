export type SummarySourceChunk = {
  heading: string;
  pageStart: number;
  pageEnd: number;
  text: string;
};

/**
 * The Groq account is capped at 8,000 tokens per minute, and prompt tokens plus
 * max_tokens must fit inside that ceiling or the request is rejected with 413.
 * This corpus measures at roughly 3.6 characters per token, so a 10,000-character
 * excerpt costs about 2,700 prompt tokens and leaves room for the reply.
 */
export const MAX_EXCERPT_LENGTH = 10_000;
export const EXCERPT_WINDOWS = 6;
export const EXCERPT_SEPARATOR = "\n\n[...]\n\n";

/**
 * NOUN materials open with course information, a contents list and sometimes a
 * course guide before any teaching content. Unit headings cannot separate those
 * from the body, because chunking carries the first detected heading forward
 * across every earlier chunk. What does separate them is shape: a contents page
 * is mostly short lines ending in a page number.
 */
export function isFrontMatter(chunk: SummarySourceChunk) {
  const lines = chunk.text.split("\n").map((line) => line.trim()).filter((line) => line.length > 12);
  if (lines.length < 6) return false;
  const listingLines = lines.filter((line) => /\s\d{1,3}$/.test(line) || /\.{3,}\s*\d{1,3}$/.test(line));
  return listingLines.length / lines.length > 0.4;
}

/**
 * Drop leading front matter, but never more than the first quarter of the
 * material: a mid-document index or a genuinely list-shaped unit should not be
 * able to swallow the body.
 */
export function findFirstBodyChunk(chunks: SummarySourceChunk[]) {
  const limit = Math.floor(chunks.length / 4);
  let index = 0;
  while (index < limit && isFrontMatter(chunks[index])) index += 1;
  return index;
}

/**
 * Sample evenly across the body rather than reading one leading slice, so a long
 * material is represented by its whole arc instead of its first two percent.
 * Each window takes the head of a chunk, where NOUN units state their objectives
 * and core definitions.
 */
export function selectSummaryExcerpt(chunks: SummarySourceChunk[], limit = MAX_EXCERPT_LENGTH) {
  if (!chunks.length) return "";
  const body = chunks.slice(findFirstBodyChunk(chunks)).filter((chunk) => !isFrontMatter(chunk));
  const source = body.length ? body : chunks;
  const windowCount = Math.min(EXCERPT_WINDOWS, source.length);
  const separatorCost = EXCERPT_SEPARATOR.length * (windowCount - 1);
  const windowSize = Math.max(400, Math.floor((limit - separatorCost) / windowCount));

  const sections: string[] = [];
  for (let index = 0; index < windowCount; index += 1) {
    const position = windowCount === 1
      ? Math.floor((source.length - 1) / 2)
      : Math.round((index * (source.length - 1)) / (windowCount - 1));
    const chunk = source[position];
    // Page markers ground practice questions but only burn tokens in a summary.
    const text = chunk.text.replace(/\[Page \d+\]/g, " ").replace(/\s+/g, " ")
      .slice(0, windowSize).replace(/\s+\S*$/, "").trim();
    if (text) sections.push(`${chunk.heading} (pages ${chunk.pageStart}-${chunk.pageEnd})\n${text}`);
  }
  return sections.join(EXCERPT_SEPARATOR).slice(0, limit);
}
