import assert from "node:assert/strict";
import test from "node:test";
import { assertSemesterPassTransaction } from "../../lib/platform/paystack";

const validTransaction = {
  reference: "nc_test_reference",
  status: "success",
  amount: 250000,
  currency: "NGN",
  paid_at: "2026-07-19T12:00:00.000Z",
};

test("accepts an exact successful semester-pass transaction", () => {
  assert.equal(
    assertSemesterPassTransaction(validTransaction),
    validTransaction.paid_at,
  );
});

test("rejects a transaction that is not successful", () => {
  assert.throws(
    () => assertSemesterPassTransaction({ ...validTransaction, status: "abandoned" }),
    /not successful/i,
  );
});

test("rejects an incorrect amount", () => {
  assert.throws(
    () => assertSemesterPassTransaction({ ...validTransaction, amount: 249999 }),
    /amount does not match/i,
  );
});

test("rejects an incorrect currency", () => {
  assert.throws(
    () => assertSemesterPassTransaction({ ...validTransaction, currency: "USD" }),
    /currency does not match/i,
  );
});

test("rejects a transaction without a paid timestamp", () => {
  assert.throws(
    () => assertSemesterPassTransaction({ ...validTransaction, paid_at: null }),
    /no paid timestamp/i,
  );
});
