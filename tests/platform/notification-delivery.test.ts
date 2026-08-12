import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverNotificationBatch,
  operationalDatabaseError,
  selectionFailureAuditMetadata,
} from "../../lib/platform/notification-delivery-core";

type Candidate = { userId: string; email: string | null };

const candidates: Candidate[] = [
  { userId: "student-1", email: "student@example.com" },
];

function database(error?: { code?: string; message?: string }) {
  return {
    insertNotification: async () => ({ error: error ?? null }),
    markEmailed: async () => ({ error: null, persisted: true }),
  };
}

test("delivery records SMTP acceptance as emailed after persisting the cooldown", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: database(),
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => undefined,
  });

  assert.deepEqual(result, {
    candidates: 1,
    emailed: 1,
    failed: 0,
    deduped: 0,
    databaseFailed: 0,
    errors: [],
  });
});

test("delivery classifies a notification unique violation as deduped", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: database({ code: "23505", message: "duplicate key includes student@example.com" }),
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => assert.fail("deduped candidates must not be emailed"),
  });

  assert.equal(result.deduped, 1);
  assert.equal(result.databaseFailed, 0);
  assert.deepEqual(result.errors, []);
});

test("delivery reports non-unique notification errors as sanitized database failures", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: database({ code: "42501", message: "permission denied for student@example.com" }),
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => assert.fail("database failures must not send email"),
  });

  assert.equal(result.databaseFailed, 1);
  assert.deepEqual(result.errors, [{ operation: "notificationInsert", code: "42501", category: "databaseFailed" }]);
  assert.doesNotMatch(JSON.stringify(result), /student@example\.com/);
});

test("delivery turns rejected notification writes into sanitized database failures", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: {
      insertNotification: async () => { throw { code: "42501", message: "permission denied for student@example.com" }; },
      markEmailed: async () => ({ error: null, persisted: true }),
    },
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => assert.fail("database failures must not send email"),
  });

  assert.equal(result.databaseFailed, 1);
  assert.deepEqual(result.errors, [{ operation: "notificationInsert", code: "42501", category: "databaseFailed" }]);
});

test("delivery reports SMTP rejection as failed without claiming emailed", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: database(),
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => { throw new Error("SMTP rejected student@example.com"); },
  });

  assert.equal(result.emailed, 0);
  assert.equal(result.failed, 1);
  assert.deepEqual(result.errors, [{ operation: "emailSend", code: "provider_failed", category: "failed" }]);
  assert.doesNotMatch(JSON.stringify(result), /student@example\.com/);
});

test("delivery counts a failed emailed_at write without claiming the cooldown", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: {
      insertNotification: async () => ({ error: null }),
      markEmailed: async () => ({ error: { code: "42501", message: "permission denied for student@example.com" }, persisted: false }),
    },
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => undefined,
  });

  assert.equal(result.emailed, 1);
  assert.equal(result.databaseFailed, 1);
  assert.deepEqual(result.errors, [{ operation: "emailedAtUpdate", code: "42501", category: "databaseFailed" }]);
  assert.doesNotMatch(JSON.stringify(result), /student@example\.com/);
});

test("delivery turns rejected emailed_at writes into sanitized database failures", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: {
      insertNotification: async () => ({ error: null }),
      markEmailed: async () => { throw { code: "42501", message: "permission denied for student@example.com" }; },
    },
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => undefined,
  });

  assert.equal(result.emailed, 1);
  assert.equal(result.databaseFailed, 1);
  assert.deepEqual(result.errors, [{ operation: "emailedAtUpdate", code: "42501", category: "databaseFailed" }]);
});

test("delivery treats an error-free zero-row emailed_at update as an unconfirmed cooldown", async () => {
  const result = await deliverNotificationBatch({
    candidates,
    database: {
      insertNotification: async () => ({ error: null }),
      markEmailed: async () => ({ error: null, persisted: false }),
    },
    makeNotification: () => ({ kind: "reengagement", title: "Start", body: "Open the dashboard", actionUrl: "/dashboard" }),
    sendEmail: async () => undefined,
  });

  assert.equal(result.emailed, 1);
  assert.equal(result.databaseFailed, 1);
  assert.deepEqual(result.errors, [{ operation: "emailedAtUpdate", code: "not_persisted", category: "databaseFailed" }]);
});

test("selection-failure audit metadata keeps only the safe operational fields", () => {
  const result = selectionFailureAuditMetadata({
    operation: "candidateSelection",
    code: "42501",
    category: "databaseFailed",
    message: "permission denied for student@example.com",
    recipient: "student@example.com",
  });

  assert.deepEqual(result, {
    operation: "candidateSelection",
    code: "42501",
    category: "databaseFailed",
    database_failed: 1,
  });
  assert.doesNotMatch(JSON.stringify(result), /student@example\.com/);
});

test("candidate-selection errors are sanitised as operational database failures", () => {
  const result = operationalDatabaseError("candidateSelection", { code: "42501", message: "permission denied for student@example.com" });

  assert.deepEqual(result, { operation: "candidateSelection", code: "42501", category: "databaseFailed" });
  assert.doesNotMatch(JSON.stringify(result), /student@example\.com/);
});
