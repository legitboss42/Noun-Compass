import assert from "node:assert/strict";
import test from "node:test";
import { prepareCheckoutPaymentAttempt } from "../../lib/platform/checkout";

function fakeAdmin(handlers: Array<(table: string, payload: unknown) => { error: unknown }>) {
  return {
    from(table: string) {
      return {
        insert(payload: unknown) {
          const handler = handlers.shift();
          if (!handler) throw new Error(`Unexpected insert into ${table}`);
          return Promise.resolve(handler(table, payload));
        },
        upsert(payload: unknown) {
          const handler = handlers.shift();
          if (!handler) throw new Error(`Unexpected upsert into ${table}`);
          return Promise.resolve(handler(table, payload));
        },
      };
    },
  };
}

test("checkout preparation inserts a payment attempt", async () => {
  const calls: string[] = [];
  const admin = fakeAdmin([
    (table) => {
      calls.push(table);
      return { error: null };
    },
  ]);

  await prepareCheckoutPaymentAttempt(admin as never, {
    reference: "nc_test",
    userId: "00000000-0000-0000-0000-000000000001",
    email: "student@example.com",
  });

  assert.deepEqual(calls, ["payment_attempts"]);
});

test("checkout preparation repairs a missing semester-pass plan and retries", async () => {
  const calls: string[] = [];
  const originalError = console.error;
  console.error = () => {};
  const admin = fakeAdmin([
    (table) => {
      calls.push(table);
      return {
        error: {
          code: "23503",
          message: "insert or update on table payment_attempts violates foreign key constraint",
          details: "Key (plan_key)=(semester-pass) is not present in table membership_plans.",
        },
      };
    },
    (table, payload) => {
      calls.push(table);
      assert.equal((payload as { plan_key: string }).plan_key, "semester-pass");
      return { error: null };
    },
    (table) => {
      calls.push(table);
      return { error: null };
    },
  ]);

  try {
    await prepareCheckoutPaymentAttempt(admin as never, {
      reference: "nc_test",
      userId: "00000000-0000-0000-0000-000000000001",
      email: "student@example.com",
    });
  } finally {
    console.error = originalError;
  }

  assert.deepEqual(calls, ["payment_attempts", "membership_plans", "payment_attempts"]);
});
