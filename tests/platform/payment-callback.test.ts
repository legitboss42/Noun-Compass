import assert from "node:assert/strict";
import test from "node:test";
import {
  isPaymentReference,
  isTransactionIdentifier,
  shouldVerifyPaymentCallback,
} from "../../lib/platform/payment-callback";

test("payment callback validates NounCompass references and provider transaction identifiers", () => {
  assert.equal(isPaymentReference("nc_mabc123_abcdef123456"), true);
  assert.equal(isPaymentReference("external-reference"), false);
  assert.equal(isTransactionIdentifier("123456789"), true);
  assert.equal(isTransactionIdentifier("transaction_123-abc"), true);
  assert.equal(isTransactionIdentifier("bad transaction"), false);
});

test("payment callback verifies safe redirect states instead of relying on one success label", () => {
  assert.equal(shouldVerifyPaymentCallback("successful", "123456789"), true);
  assert.equal(shouldVerifyPaymentCallback("completed", "123456789"), true);
  assert.equal(shouldVerifyPaymentCallback(undefined, "123456789"), true);
  assert.equal(shouldVerifyPaymentCallback("failed", "123456789"), false);
  assert.equal(shouldVerifyPaymentCallback("cancelled", "123456789"), false);
  assert.equal(shouldVerifyPaymentCallback("successful", "bad transaction"), false);
});
