import assert from "node:assert/strict";
import test from "node:test";
import {
  STAGE_META,
  buildStageEmail,
  stageNotification,
  type InactiveStage,
} from "../../lib/platform/stage-email-core";

const SITE = "https://nouncompass.me";
const STAGES: InactiveStage[] = ["s1", "s2", "s3", "s4"];

test("every stage renders a complete branded email with no leftover tokens", () => {
  for (const stage of STAGES) {
    const { subject, html, text } = buildStageEmail({
      stage,
      displayName: "Ada",
      siteUrl: SITE,
      unsubscribeUrl: `${SITE}/unsubscribe?email=a%40b.com&scope=reengagement&token=abc`,
      context: { course_code: "MTH101", course_title: "Elementary Mathematics I", resume_session_id: "sess-1" },
    });
    assert.ok(subject.length > 0, `${stage} has a subject`);
    assert.equal(/\{\{|\}\}/.test(html), false, `${stage} has no template tokens`);
    assert.match(html, /Hi Ada,/, `${stage} greets by name`);
    assert.match(html, /scope=reengagement/, `${stage} html has unsubscribe`);
    assert.match(text, /scope=reengagement/, `${stage} text has unsubscribe`);
  }
});

test("s4 names the abandoned course and deep-links to resume it", () => {
  const { subject, html } = buildStageEmail({
    stage: "s4",
    displayName: "Ada",
    siteUrl: SITE,
    context: { course_code: "MTH101", course_title: "Elementary Mathematics I", resume_session_id: "sess-9" },
  });
  assert.match(subject, /Elementary Mathematics I|MTH101/);
  assert.match(html, /session=sess-9/);
});

test("s4 without course context degrades to the plain practice CTA", () => {
  const noCtx = buildStageEmail({ stage: "s4", displayName: "Ada", siteUrl: SITE });
  assert.match(noCtx.html, /dashboard\/ai-practice/);
  assert.equal(/session=/.test(noCtx.html), false);
});

test("an unusable display name falls back to a neutral greeting for every stage", () => {
  for (const stage of STAGES) {
    for (const displayName of [null, "", "   ", "student@example.com", "Averyveryverylongsinglenametoken"]) {
      const { html } = buildStageEmail({ stage, displayName, siteUrl: SITE });
      assert.match(html, /Hi there,/, `${stage} neutral greeting for ${JSON.stringify(displayName)}`);
    }
  }
});

test("no stage invents an exam date or mentions removed question banks", () => {
  for (const stage of STAGES) {
    const { html, text } = buildStageEmail({
      stage, displayName: "Ada", siteUrl: SITE,
      context: { course_title: "Elementary Mathematics I", resume_session_id: "s" },
    });
    for (const banned of [/question bank/i, /past question/i, /your exam is on/i, /expires? in \d/i]) {
      assert.equal(banned.test(html), false, `${stage} html banned: ${banned}`);
      assert.equal(banned.test(text), false, `${stage} text banned: ${banned}`);
    }
  }
});

test("stageNotification returns a relative action_url with the s4 resume id", () => {
  assert.equal(stageNotification("s1").actionUrl, "/dashboard");
  assert.equal(stageNotification("s3").actionUrl, "/dashboard/ai-practice");
  assert.equal(
    stageNotification("s4", { resume_session_id: "sess-2" }).actionUrl,
    "/dashboard/ai-practice?session=sess-2",
  );
  for (const stage of STAGES) {
    const n = stageNotification(stage);
    assert.ok(n.title.length > 0 && n.body.length > 0, `${stage} notification copy`);
  }
});

test("STAGE_META covers all four stages with labels", () => {
  for (const stage of STAGES) assert.ok(STAGE_META[stage].label.length > 0);
});
