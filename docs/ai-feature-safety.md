# NounCompass AI feature safety

## Implemented features

- Performance coaching from completed Practice Exam aggregates.
- Registered-course material Q&A with exact page citations.
- On-demand answer explanations for completed Practice Exam questions.
- Adaptive Practice Exam focus: balanced, weak topics, or exam simulation.
- Study-plan adjustment using saved course performance and recent scheduling history.
- Restricted admissions, fee, and academic guidance.
- Student support-ticket drafting and staff-only reply suggestions.
- Staff-only MDX content review suggestions.

## Provider and cost controls

- No AI request runs automatically on page load.
- Every feature has an independent daily quota.
- A global daily request ceiling defaults to `250` and is controlled by `AI_GLOBAL_DAILY_LIMIT`.
- Requests are recorded in `ai_feature_usage`.
- Identical eligible requests use `ai_feature_cache` before claiming quota.
- Provider calls have a 45-second timeout and no automatic retry.
- Output is capped by feature and never exceeds 1,800 requested tokens.
- Practice Exam batches remain sequential and resumable.

## Data boundaries

- Provider keys remain server-only.
- Course Q&A is limited to registered courses and indexed official materials.
- The provider receives only selected relevant material chunks, not the student's full account.
- Common email addresses, phone numbers, matriculation-like identifiers, and long payment-card-like numbers are redacted from free text.
- Correct answers, source chunks, support internal notes, and cached outputs are service-role-only database data.
- Staff AI suggestions never send replies, edit content, publish questions, change payments, or alter memberships.

## Grounding and validation

- Course answers and student guidance require exact quotes from supplied sources.
- Unsupported citations fail closed and are not shown.
- Practice Exam weak-topic focus uses only completed saved answers and falls back to balanced coverage when history is insufficient.
- Fee assistance explains the deterministic saved result; AI does not calculate or modify fees.
- Admissions guidance cannot guarantee admission or replace official NOUN requirements.

## Operational requirements

1. Apply `supabase/migrations/202608020003_ai_feature_governance.sql`.
2. Keep the configured Groq or OpenRouter key server-only.
3. Set `AI_GLOBAL_DAILY_LIMIT` in production; `250` is the conservative default.
4. Review `ai_feature_usage` before increasing any quota.
5. Do not expose `ai_feature_cache` or `ai_feature_usage` to authenticated browser clients.

## Known limitations

- Text-only PDF extraction cannot read image-only scanned materials without OCR.
- Keyword retrieval is intentionally lightweight and avoids a paid embedding service.
- AI outputs remain study guidance and should not be described as official NOUN advice, results, fees, or examination predictions.
