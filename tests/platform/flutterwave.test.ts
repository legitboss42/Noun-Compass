import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { assertSemesterPassTransaction, verifyFlutterwaveSignature } from "../../lib/platform/flutterwave";

const validTransaction = { status: "successful", amount: 2500, currency: "NGN", created_at: "2026-07-19T12:00:00.000Z" };

test("accepts an exact successful semester-pass transaction", () => {
  assert.equal(assertSemesterPassTransaction(validTransaction), validTransaction.created_at);
});

test("rejects a transaction that is not successful", () => {
  assert.throws(() => assertSemesterPassTransaction({ ...validTransaction, status: "failed" }), /not successful/i);
});

test("rejects an incorrect amount", () => {
  assert.throws(() => assertSemesterPassTransaction({ ...validTransaction, amount: 2499.99 }), /amount does not match/i);
});

test("rejects an incorrect currency", () => {
  assert.throws(() => assertSemesterPassTransaction({ ...validTransaction, currency: "USD" }), /currency does not match/i);
});

test("rejects a transaction without a valid timestamp", () => {
  assert.throws(() => assertSemesterPassTransaction({ ...validTransaction, created_at: null }), /no valid transaction timestamp/i);
});

test("accepts Flutterwave HMAC webhook signatures and rejects bad signatures", () => {
  const previous = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  process.env.FLUTTERWAVE_WEBHOOK_SECRET = "test-webhook-secret";
  const rawBody = JSON.stringify({ type: "charge.completed", data: { id: 42 } });
  const signature = createHmac("sha256", "test-webhook-secret").update(rawBody).digest("base64");
  assert.equal(verifyFlutterwaveSignature(rawBody, signature), true);
  assert.equal(verifyFlutterwaveSignature(rawBody, "invalid"), false);
  if (previous === undefined) delete process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  else process.env.FLUTTERWAVE_WEBHOOK_SECRET = previous;
});
