import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import sitemap from "../../app/sitemap";
import nextConfig from "../../next.config";
import {
  getEditorialDispositionManifest,
  type EditorialDecision,
} from "../../lib/editorial-dispositions";

const root = process.cwd();
const articleDirectory = path.join(root, "content", "articles");

const ORIGINAL_ARTICLE_SLUGS = [
  "common-nelfund-problems-noun-students-face",
  "common-noun-tma-mistakes",
  "fix-missing-noun-e-wallet-balance",
  "full-list-of-verified-noun-study-centres-in-nigeria",
  "gst302-summary",
  "how-noun-students-apply-for-nelfund",
  "how-to-apply-for-noun-admission",
  "how-to-check-noun-results",
  "how-to-check-outstanding-courses-on-noun-result-statement",
  "how-to-find-noun-results-on-my-progress",
  "how-to-find-tma-on-noun-elearn",
  "how-to-generate-remita-for-noun",
  "how-to-open-your-noun-result-statement-from-the-support-portal",
  "how-to-pay-noun-school-fees",
  "how-to-read-noun-cgpa-class-of-degree-and-outstanding-credit",
  "how-to-register-noun-courses",
  "how-to-submit-tma-on-noun-elearn",
  "how-to-use-noun-support-or-e-ticketing-for-result-problems",
  "how-to-verify-a-noun-study-centre-before-you-travel",
  "is-noun-eligible-for-nelfund",
  "nelfund-application-status-meanings-explained",
  "nelfund-approval-and-disbursement-guide-for-noun-students",
  "nelfund-frequently-asked-questions-for-noun-students",
  "nelfund-requirements-for-noun-students",
  "noun-admission-requirements",
  "noun-compulsory-fee",
  "noun-core-courses-vs-electives",
  "noun-course-materials-pdf",
  "noun-e-exam-vs-pop",
  "noun-e-wallet-refund",
  "noun-elearn-and-tma-guide",
  "noun-exam-registration-guide",
  "noun-financial-statement",
  "noun-graduation-clearance-fee-convocation-costs",
  "noun-installment-payment",
  "noun-late-registration-fee",
  "noun-maximum-credit-units",
  "noun-missing-course-code",
  "noun-portal-password-reset",
  "noun-postgraduate-school-fees",
  "noun-registration-slip-printout",
  "noun-school-fees-new-students",
  "noun-school-fees-returning-students",
  "noun-study-centres-in-abuja",
  "noun-study-centres-in-benin",
  "noun-study-centres-in-enugu",
  "noun-study-centres-in-kano",
  "noun-study-centres-in-lagos",
  "noun-study-centres-in-ogun",
  "noun-support-ticket-guide",
  "noun-tma-deadline-guide",
  "nouonline-student-dashboard",
  "register-carryover-courses-noun",
  "special-and-correctional-noun-study-centres-guide",
  "update-profile-nouonline",
  "why-nelfund-requests-a-jamb-registration-number",
  "why-noun-course-registration-slip-says-register-for-the-current-semester-first",
  "why-your-noun-result-grade-is-not-showing",
  "why-your-noun-tma-score-is-not-showing",
] as const;

type Frontmatter = Record<string, unknown> & {
  slug: string;
  relatedArticles: string[];
  sourceReviewSummary?: string;
  reviewedSources?: Array<{ label: string; url: string }>;
};

function readArticles() {
  return fs
    .readdirSync(articleDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(articleDirectory, file), "utf8");
      const parsed = matter(source);
      return { file, data: parsed.data as Frontmatter, content: parsed.content };
    });
}

async function configuredRedirects() {
  const redirects = nextConfig.redirects;
  assert.equal(typeof redirects, "function");
  return redirects!() as Promise<Array<{ source: string; destination: string; permanent: boolean }>>;
}

test("the editorial manifest accounts for the exact 59 original article URLs", () => {
  const articles = readArticles();
  const manifest = getEditorialDispositionManifest();
  const expected = [...ORIGINAL_ARTICLE_SLUGS].sort();

  assert.equal(ORIGINAL_ARTICLE_SLUGS.length, 59);
  assert.deepEqual(articles.map(({ data }) => data.slug).sort(), expected);
  assert.deepEqual(manifest.map(({ slug }) => slug).sort(), expected);
  assert.equal(new Set(manifest.map(({ url }) => url)).size, 59);
});

test("every disposition has truthful evidence, ownership, status, and target semantics", () => {
  const allowedDecisions = new Set<EditorialDecision>(["keep", "rewrite", "merge", "retire"]);
  const manifest = getEditorialDispositionManifest();
  const bySlug = new Map(readArticles().map(({ data }) => [data.slug, data]));

  for (const item of manifest) {
    const article = bySlug.get(item.slug);
    assert.ok(article, `${item.slug}: missing MDX source`);
    assert.ok(allowedDecisions.has(item.decision), `${item.slug}: invalid decision`);
    assert.ok(item.intent.trim(), `${item.slug}: missing intent`);
    assert.ok(item.cluster.trim(), `${item.slug}: missing cluster`);
    assert.equal(item.url, `/articles/${item.slug}`);
    assert.equal(item.gscEvidence.status, "unavailable-unverified");
    assert.equal(item.reviewVerification, "pending");
    assert.equal(item.currentSourceReview.reviewedAt, null);
    assert.deepEqual(item.currentSourceReview.officialSourcesChecked, []);
    assert.equal(item.author, article.author);
    assert.equal(item.reviewer, article.reviewer);
    assert.notEqual(item.status, "adsense-ready");
    assert.equal(item.adsenseReadiness, "blocked");
    assert.equal(item.dateMetadata.status, "unverified");

    if (item.decision === "merge") {
      assert.ok(item.canonicalTarget, `${item.slug}: merge requires a canonical target`);
      assert.notEqual(item.canonicalTarget, item.url);
      assert.equal(item.indexable, false);
    } else {
      assert.equal(item.canonicalTarget, null, `${item.slug}: only merges can have canonical targets`);
      assert.equal(item.indexable, item.decision === "keep" || item.decision === "rewrite");
    }
  }
});

test("redirects are permanent, terminate at live content, and do not form chains", async () => {
  const redirects = await configuredRedirects();
  const articleSlugs = new Set(readArticles().map(({ data }) => data.slug));
  const internalRedirects = redirects.filter(({ source, destination }) =>
    source.startsWith("/articles/") && destination.startsWith("/articles/"),
  );
  const redirectSources = new Set(internalRedirects.map(({ source }) => source));

  for (const redirect of internalRedirects) {
    assert.equal(redirect.permanent, true, `${redirect.source}: editorial redirects must be 301/308-class permanent redirects`);
    assert.ok(!redirectSources.has(redirect.destination), `${redirect.source}: redirect chain detected`);
    assert.ok(
      articleSlugs.has(redirect.destination.replace("/articles/", "")),
      `${redirect.source}: redirect target is not a live article`,
    );
  }
});

test("sitemap includes only indexable manifest articles and does not invent last-modified dates", () => {
  const entries = sitemap();
  const manifest = getEditorialDispositionManifest();
  const expectedArticleUrls = manifest.filter(({ indexable }) => indexable).map(({ url }) => `https://nouncompass.me${url}`).sort();
  const actualArticleUrls = entries.map(({ url }) => url).filter((url) => url.includes("/articles/")).sort();

  assert.deepEqual(actualArticleUrls, expectedArticleUrls);
  for (const entry of entries) {
    assert.equal(entry.lastModified, undefined, `${entry.url}: lastModified must be omitted until its date is verified`);
  }
});

test("article frontmatter, source-review evidence, and internal article links are valid", async () => {
  const articles = readArticles();
  const required = [
    "title", "slug", "description", "category", "primaryKeyword", "secondaryKeywords", "author", "reviewer",
    "publishedAt", "updatedAt", "readingTime", "officialSourceUrl", "relatedArticles", "image",
  ];
  const liveSlugs = new Set(articles.map(({ data }) => data.slug));
  const redirectSources = new Set(
    (await configuredRedirects())
      .map(({ source }) => source.match(/^\/articles\/([^/:*]+)$/)?.[1])
      .filter((slug): slug is string => Boolean(slug)),
  );

  for (const { file, data, content } of articles) {
    for (const field of required) {
      assert.ok(data[field] !== undefined && data[field] !== null && data[field] !== "", `${file}: missing ${field}`);
    }
    assert.ok(/^https:\/\//.test(String(data.officialSourceUrl)), `${file}: officialSourceUrl must use HTTPS`);
    assert.ok(Array.isArray(data.relatedArticles), `${file}: relatedArticles must be an array`);
    for (const slug of data.relatedArticles) {
      assert.ok(liveSlugs.has(slug), `${file}: broken relatedArticles slug ${slug}`);
    }
    if (data.sourceReviewSummary) {
      assert.ok(data.reviewedSources?.length, `${file}: sourceReviewSummary requires reviewedSources`);
    }
    for (const match of content.matchAll(/\]\(\/articles\/([^)#?]+)(?:[?#][^)]*)?\)/g)) {
      const linkedSlug = match[1].replace(/\/$/, "");
      assert.ok(liveSlugs.has(linkedSlug) || redirectSources.has(linkedSlug), `${file}: broken inline article link ${linkedSlug}`);
    }
  }
});

test("active product surfaces contain no stale author typo or removed-bank availability claim", () => {
  const activeRoots = ["app", "components", "lib", "data"];
  const files = activeRoots.flatMap((directory) =>
    fs.readdirSync(path.join(root, directory), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(?:ts|tsx|md|mdx)$/.test(entry.name))
      .map((entry) => path.join(entry.parentPath, entry.name)),
  );
  files.push(path.join(root, "README.md"));

  const stalePositiveClaims = [
    /Victoious/g,
    /(?:provides?|includes?|offers?|contains?)\s+(?:NOUN\s+)?(?:past[- ]question|question[- ]bank)/gi,
    /(?:seeded|available)\s+(?:exam[- ]practice\s+)?course banks?/gi,
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of stalePositiveClaims) {
      assert.equal(pattern.test(source), false, `${path.relative(root, file)}: stale claim matched ${pattern}`);
      pattern.lastIndex = 0;
    }
  }
});

test("course-material coverage is valid UTF-8 without mojibake markers", () => {
  const source = fs.readFileSync(path.join(root, "docs", "course-material-coverage.md"), "utf8");
  assert.doesNotMatch(source, /(?:\uFFFD|â€|Ã.|Â\s)/, "course-material coverage still contains malformed UTF-8 text");
});

test("articles with pending reviews describe dated checks only as previous editorial records", () => {
  const dispositions = new Map(getEditorialDispositionManifest().map((item) => [item.slug, item]));
  const currentVerificationClaims = [
    /^##\s+Last Reviewed\s*$/gim,
    /\blast reviewed(?:\s+on)?\b/gi,
    /\breviewed on\s+\d{1,2}\s+[A-Z][a-z]+\s+20\d{2}\b/gi,
    /\b(?:official[- ]source checks|official sources|sources?)\s+(?:were\s+)?reviewed\s+on\b/gi,
    /\b(?:official\s+)?sources?\s+(?:were\s+)?reviewed\b/gi,
    /\breviewed sources?\b/gi,
    /\bverified(?:\s+only)?\s+on\b/gi,
    /\b\d{1,2}\s+[A-Z][a-z]+\s+20\d{2}\s+source review\b/gi,
  ];
  const violations: string[] = [];

  for (const { file, data, content } of readArticles()) {
    const disposition = dispositions.get(data.slug);
    assert.ok(disposition, `${file}: missing disposition`);
    if (disposition.currentSourceReview.reviewedAt !== null) continue;

    for (const pattern of currentVerificationClaims) {
      for (const match of content.matchAll(pattern)) {
        const line = content.slice(0, match.index).split("\n").length;
        violations.push(`${file}:${line}: ${match[0]}`);
      }
      pattern.lastIndex = 0;
    }
  }

  assert.deepEqual(violations, []);
});

test("pending articles do not imply a current review through semantic equivalents", () => {
  const dispositions = new Map(getEditorialDispositionManifest().map((item) => [item.slug, item]));
  const date = String.raw`(?:\*{0,2})?(?:\d{1,2}\s+[A-Z][a-z]+\s+20\d{2}|20\d{2}-\d{2}-\d{2})(?:\*{0,2})?`;
  const currentReviewEquivalents = [
    new RegExp(String.raw`\breview completed on\s+${date}\b`, "i"),
    new RegExp(String.raw`\blive[^.\n]{0,60}\breview(?:ed|\s+completed)?(?:\s+on)?\s+${date}\b`, "i"),
    /\bverification pass\b/i,
    new RegExp(String.raw`\bchecks? completed on\s+${date}\b`, "i"),
    new RegExp(String.raw`\bconfirmed on\s+${date}\b`, "i"),
    /\bvisible steps confirmed\b/i,
    /\bcurrent(?:ly)? verified\b/i,
    /\bcurrently confirmed\b/i,
    new RegExp(String.raw`\bas of (?:the\s+)?${date}\b`, "i"),
    new RegExp(String.raw`\b(?:verified|confirmed|checked|reviewed)\b[^.\n]{0,60}\b${date}\b`, "i"),
    new RegExp(String.raw`\b${date}\b[^.\n]{0,60}\b(?:verified|confirmed|checked|reviewed)\b`, "i"),
    /\breviewed (?:live )?session\b/i,
  ];
  const nonEditorialAllowlist = [
    {
      pattern: /\b(?:future|another) verification pass\b/i,
      reason: "Prospective recheck instruction, not a claim that review is current or complete.",
    },
    {
      pattern: /\bfinal [^.]+ need to be confirmed on official NOUN pages\b/i,
      reason: "Reader instruction to confirm account-specific decisions, not an editorial freshness claim.",
    },
    {
      pattern: /\bverify whether you are looking at a live task or reviewing an old one\b/i,
      reason: "Student task-state instruction; review refers to viewing an old activity.",
    },
    {
      pattern: /\b(?:safer|safest) verification route\b/i,
      reason: "Navigation guidance naming a route, not a completed editorial verification.",
    },
  ];
  const violations: string[] = [];

  for (const { file, data, content } of readArticles()) {
    const disposition = dispositions.get(data.slug);
    assert.ok(disposition, `${file}: missing disposition`);
    if (disposition.reviewVerification !== "pending") continue;

    const publicFrontmatter = [
      ["description", data.description],
      ["seoDescription", data.seoDescription],
      ["sourceReviewSummary", data.sourceReviewSummary],
      ...((Array.isArray(data.reviewHighlights) ? data.reviewHighlights : []).map((value, index) => [`reviewHighlights[${index}]`, value])),
    ].filter((entry): entry is [string, string] => typeof entry[1] === "string");
    const publicLines: Array<[string, string]> = [
      ...content.split(/\r?\n/).map((line, index): [string, string] => [`body:${index + 1}`, line]),
      ...publicFrontmatter,
    ];

    for (const [location, line] of publicLines) {
      if (!currentReviewEquivalents.some((pattern) => pattern.test(line))) continue;
      if (/\b(?:earlier editorial pass|earlier editorial record|previous editorial record|repository records an earlier editorial pass)\b/i.test(line)) continue;
      if (nonEditorialAllowlist.some(({ pattern }) => pattern.test(line))) continue;
      violations.push(`${file}:${location}: ${line.trim()}`);
    }
  }

  assert.ok(nonEditorialAllowlist.every(({ reason }) => reason.length > 20), "Every allowlist entry needs a justification");
  assert.deepEqual(violations, []);

  for (const { file, data, content } of readArticles()) {
    if (dispositions.get(data.slug)?.reviewVerification !== "pending") continue;
    if (!/\bearlier editorial (?:pass|record)\b/i.test(content)) continue;
    assert.equal(
      content.match(/A current source recheck is pending\./g)?.length,
      1,
      `${file}: historical editorial evidence requires exactly one pending-recheck notice`,
    );
  }
});

test("pending articles qualify present-state verified labels in their local context", () => {
  const dispositions = new Map(getEditorialDispositionManifest().map((item) => [item.slug, item]));
  const presentVerifiedClaims = [
    /\bverified (?:address|contact|general centre|general center|entry point|location|route|workflow|session|page|portal|source|match|listing|detail|record|sequence)\b/i,
    /\b(?:address|contact|location|route|workflow|session|centre|center|page|portal|source|match|listing|detail|record|entry point) (?:is |are |was |were )?(?:fully )?verified\b/i,
    /^#{2,4}\s+(?:the\s+)?verified\s+(?:route|workflow|status|location|centre|center|entry point)\b/i,
    /\b(?:that|this) page verified\b/i,
    /\b(?:the|this) verified workflow\b/i,
    /\b(?:the|this) review (?:found|supports?|confirmed|verified|made)\b/i,
    /\b(?:confirmed|verified)\b[^.\n]{0,70}\b(?:in|from) (?:this|the) review\b/i,
    /\b(?:in|from) (?:this|the) review\b[^.\n]{0,70}\b(?:confirmed|verified)\b/i,
    /\breviewed evidence supports?\b/i,
  ];
  const historicalQualifiers = /\b(?:earlier editorial pass|earlier editorial record|previous editorial record|previously (?:classified|recorded|verified)|recorded in the 19 June 2026 editorial pass)\b/i;
  const exactNonEditorialAllowlist = [
    {
      file: "nelfund-application-status-meanings-explained.mdx",
      text: "After successful JAMB verification, the flow displayed a profile review state.",
      reason: "Profile review is the status label returned by the identity-verification flow, not an editorial review claim.",
    },
    {
      file: "common-noun-tma-mistakes.mdx",
      text: "`Review not permitted`",
      reason: "Review not permitted is a quoted eLearn activity-state label, not an editorial claim.",
    },
  ];
  const violations: string[] = [];

  for (const { file, data, content } of readArticles()) {
    if (dispositions.get(data.slug)?.reviewVerification !== "pending") continue;
    const lines = content.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      if (!presentVerifiedClaims.some((pattern) => pattern.test(line))) continue;
      if (historicalQualifiers.test(line)) continue;
      if (exactNonEditorialAllowlist.some((entry) => entry.file === file && line.includes(entry.text))) continue;
      violations.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  }

  assert.ok(exactNonEditorialAllowlist.every(({ reason }) => reason.length > 20));
  assert.deepEqual(violations, []);
});
