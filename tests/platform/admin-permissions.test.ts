import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessAdmin,
  canAssignRole,
  hasAdminPermission,
} from "../../lib/platform/admin-permissions";

test("students cannot access administration", () => {
  assert.equal(canAccessAdmin(["student"]), false);
  assert.equal(hasAdminPermission(["student"], "users.read"), false);
});

test("support staff only receive user-read and support operations", () => {
  assert.equal(hasAdminPermission(["support_agent"], "users.read"), true);
  assert.equal(hasAdminPermission(["support_agent"], "support.manage"), true);
  assert.equal(hasAdminPermission(["support_agent"], "payments.read"), false);
  assert.equal(hasAdminPermission(["support_agent"], "settings.manage"), false);
});

test("content editors cannot manage access or publish questions", () => {
  assert.equal(hasAdminPermission(["content_editor"], "questions.write"), true);
  assert.equal(hasAdminPermission(["content_editor"], "questions.publish"), false);
  assert.equal(hasAdminPermission(["content_editor"], "memberships.manage"), false);
});

test("academic reviewers can publish questions but cannot manage settings", () => {
  assert.equal(
    hasAdminPermission(["academic_reviewer"], "questions.publish"),
    true,
  );
  assert.equal(
    hasAdminPermission(["academic_reviewer"], "settings.manage"),
    false,
  );
});

test("only super administrators can assign elevated roles", () => {
  assert.equal(canAssignRole(["support_agent"], "student"), false);
  assert.equal(canAssignRole(["super_admin"], "support_agent"), true);
  assert.equal(canAssignRole(["super_admin"], "super_admin"), true);
});

test("super administrators receive all protected operations", () => {
  assert.equal(hasAdminPermission(["super_admin"], "settings.manage"), true);
  assert.equal(hasAdminPermission(["super_admin"], "payments.verify"), true);
  assert.equal(hasAdminPermission(["super_admin"], "audit.read"), true);
});
