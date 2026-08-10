import assert from "node:assert/strict";
import test from "node:test";
import { renderBrandedEmail } from "../../lib/email-layout";
import { buildReengagementEmail } from "../../lib/platform/reengagement-email-core";

const SITE = "https://nouncompass.me";

test("the branded shell leaves no unfilled template tokens", () => {
  const { html, text } = renderBrandedEmail({
    preheader: "Preview line",
    eyebrow: "Eyebrow",
    heading: "A heading with a highlight inside",
    headingHighlight: "highlight",
    paragraphs: ["First paragraph.", "Second paragraph."],
    cta: { label: "Do the thing", url: `${SITE}/dashboard` },
    siteUrl: SITE,
  });

  // The shell came from a Supabase auth template full of {{ .ConfirmationURL }}
  // placeholders. A leftover one would ship literally to a student.
  assert.equal(/\{\{|\}\}/.test(html), false);
  assert.match(html, /Do the thing/);
  assert.match(html, /Preview line/);
  assert.match(text, new RegExp(`${SITE}/dashboard`));

  // The footer must point at routes that exist. /privacy is a 404 on this site.
  assert.match(html, /\/privacy-policy/);
  assert.equal(html.includes('href="https://nouncompass.me/privacy"'), false);
});

test("user-supplied text cannot inject markup", () => {
  const { html } = renderBrandedEmail({
    preheader: "p",
    eyebrow: "e",
    heading: "h",
    paragraphs: ["<script>alert(1)</script>"],
    cta: { label: "<b>go</b>", url: `${SITE}/x` },
    siteUrl: SITE,
  });

  assert.equal(html.includes("<script>"), false);
  assert.match(html, /&lt;script&gt;/);
  assert.equal(html.includes("<b>go</b>"), false);
});

test("a highlight phrase that is not in the heading degrades to plain text", () => {
  const { html } = renderBrandedEmail({
    preheader: "p",
    eyebrow: "e",
    heading: "Straightforward heading",
    headingHighlight: "not present",
    paragraphs: ["Body."],
    cta: { label: "Go", url: `${SITE}/x` },
    siteUrl: SITE,
  });

  assert.match(html, /Straightforward heading/);
});

test("the re-engagement email carries its own way out", () => {
  const unsubscribeUrl = `${SITE}/unsubscribe?email=a%40b.com&scope=reengagement&token=abc`;
  const { subject, html, text } = buildReengagementEmail({
    displayName: "Victor Chinukwue",
    siteUrl: SITE,
    ctaUrl: `${SITE}/dashboard/ai-practice`,
    unsubscribeUrl,
  });

  assert.match(subject, /Victor/);
  assert.match(html, /Hi Victor,/);
  assert.match(html, /dashboard\/ai-practice/);
  // Present in both parts: a text-only client must still be able to opt out.
  assert.match(html, /scope=reengagement/);
  assert.match(text, /scope=reengagement/);
});

test("a missing or unusable display name falls back to a neutral greeting", () => {
  for (const displayName of [null, "", "   ", "student@example.com", "Averyveryverylongsinglenametoken"]) {
    const { subject, html } = buildReengagementEmail({
      displayName,
      siteUrl: SITE,
      ctaUrl: `${SITE}/dashboard/ai-practice`,
    });
    assert.match(html, /Hi there,/, `expected neutral greeting for ${JSON.stringify(displayName)}`);
    assert.equal(subject, "Your NounCompass account is still waiting");
  }
});

test("the copy does not promise anything the site does not do", () => {
  const { html, text } = buildReengagementEmail({
    displayName: "Ada",
    siteUrl: SITE,
    ctaUrl: `${SITE}/dashboard/ai-practice`,
  });

  // Question banks were removed. Nothing may imply they are coming back, and
  // nothing may invent an exam date we do not have.
  for (const banned of [/question bank/i, /past question/i, /your exam is on/i, /expires? in \d/i]) {
    assert.equal(banned.test(html), false, `banned phrase in html: ${banned}`);
    assert.equal(banned.test(text), false, `banned phrase in text: ${banned}`);
  }
});
