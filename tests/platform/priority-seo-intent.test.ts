import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getArticleSearchIntentOverride } from "../../lib/search-intent-overrides";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("carryover search intent leads with the pass-mark question supported by current NOUN guidance", () => {
  const override = getArticleSearchIntentOverride("register-carryover-courses-noun");
  assert.ok(override);
  assert.equal(override.seoTitle, "NOUN Carryover Pass Mark: Is 40 a Pass?");
  assert.equal(override.primaryKeyword, "noun carryover pass mark");
  assert.match(override.seoDescription, /40%/);
  assert.match(override.intentSection.summary, /Nursing programmes/);
  assert.match(override.intentSection.summary, /postgraduate programmes/);
  assert.equal(override.intentSection.officialSource.href, "https://nou.edu.ng/faqs/");
  assert.ok(override.secondaryKeywords.includes("register carryover courses noun"));
});

test("Remita and school-fee pages own distinct search intents", () => {
  const remita = getArticleSearchIntentOverride("how-to-generate-remita-for-noun");
  const fees = getArticleSearchIntentOverride("how-to-pay-noun-school-fees");
  assert.ok(remita);
  assert.ok(fees);

  assert.equal(remita.seoTitle, "NOUN Remita Payment Portal: Generate RRR");
  assert.equal(remita.primaryKeyword, "noun remita payment portal");
  assert.match(remita.intentSection.summary, /Manage Wallet/);
  assert.equal(remita.intentSection.nextStep?.href, "/articles/how-to-pay-noun-school-fees");

  assert.equal(fees.seoTitle, "Pay NOUN School Fees & Fund Your E-Wallet");
  assert.doesNotMatch(fees.seoTitle, /Remita/i);
  assert.equal(fees.intentSection.heading, "How to Fund Your NOUN E-Wallet");
  assert.ok(fees.secondaryKeywords.includes("how to fund my noun wallet"));
  assert.equal(fees.intentSection.nextStep?.href, "/articles/how-to-generate-remita-for-noun");
});

test("article rendering applies priority search intent to metadata, visible copy, schema, and the intent section", () => {
  const source = read("app/articles/[slug]/page.tsx");
  assert.match(source, /getArticleSearchIntentOverride/);
  assert.match(source, /intentOverride\?\.seoTitle/);
  assert.match(source, /headline: displayTitle/);
  assert.match(source, /<h1>\{displayTitle\}<\/h1>/);
  assert.match(source, /intentOverride\?\.intentSection/);
  assert.match(source, /officialSource\.href/);
});

test("CGPA and result-checker snippets stay concise and query-led", () => {
  const cgpa = read("app/tools/cgpa-calculator/page.tsx");
  const result = read("app/tools/result-checker/page.tsx");

  assert.match(cgpa, /"NOUN CGPA Calculator & GPA Checker"/);
  assert.match(cgpa, /Free NOUN CGPA calculator/);
  assert.match(result, /"NOUN Result Checker: Open Your Official Result"/);
  assert.match(result, /official result statement/);
});

test("editorial-team profile is a distinct collective entity with named founder and reviewer links", () => {
  const source = read("app/authors/editorial-team/page.tsx");
  assert.match(source, /collective editorial byline/);
  assert.match(source, /href="\/authors\/victor"/);
  assert.match(source, /href="\/reviewers\/student-workflow"/);
  assert.match(source, /href="\/reviewers\/student-finance"/);
  assert.match(source, /shared editorial responsibility/);
  assert.ok(source.length > 5000, "editorial-team profile should contain substantive entity content");
});

test("healthy fees-checker snippet is preserved instead of rewritten without evidence", () => {
  const source = read("app/fees/page.tsx");
  assert.match(source, /NOUN Fees Checker \(2026\): Cost by Programme/);
  assert.match(source, /<h1>NOUN school fees checker<\/h1>/);
});
