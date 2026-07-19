import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { assertFlutterwaveCustomerIdentity, assertSemesterPassTransaction, verifyFlutterwaveSignature } from "../../lib/platform/flutterwave";

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

test("uses provider-signed metadata to bind sandbox payments to the local account", () => {
  const previous = process.env.FLUTTERWAVE_ENVIRONMENT;
  process.env.FLUTTERWAVE_ENVIRONMENT = "test";
  assert.doesNotThrow(() => assertFlutterwaveCustomerIdentity({
    customer: { email: "mock-customer@nouncompass.me" },
    meta: { nouncompass_customer_email: "student@example.com", nouncompass_plan_key: "semester-pass" },
  }, "student@example.com"));
  if (previous === undefined) delete process.env.FLUTTERWAVE_ENVIRONMENT;
  else process.env.FLUTTERWAVE_ENVIRONMENT = previous;
});

test("still requires the provider customer email to match in live mode", () => {
  const previous = process.env.FLUTTERWAVE_ENVIRONMENT;
  process.env.FLUTTERWAVE_ENVIRONMENT = "live";
  assert.throws(() => assertFlutterwaveCustomerIdentity({
    customer: { email: "different@example.com" },
    meta: { nouncompass_customer_email: "student@example.com", nouncompass_plan_key: "semester-pass" },
  }, "student@example.com"), /email mismatch/i);
  if (previous === undefined) delete process.env.FLUTTERWAVE_ENVIRONMENT;
  else process.env.FLUTTERWAVE_ENVIRONMENT = previous;
});

test("rejects mismatched customer or plan metadata", () => {
  assert.throws(() => assertFlutterwaveCustomerIdentity({
    customer: { email: "student@example.com" },
    meta: { nouncompass_customer_email: "other@example.com", nouncompass_plan_key: "semester-pass" },
  }, "student@example.com"), /customer metadata mismatch/i);
  assert.throws(() => assertFlutterwaveCustomerIdentity({
    customer: { email: "student@example.com" },
    meta: { nouncompass_customer_email: "student@example.com", nouncompass_plan_key: "wrong-plan" },
  }, "student@example.com"), /plan metadata mismatch/i);
});
