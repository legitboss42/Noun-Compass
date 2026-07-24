import assert from "node:assert/strict";
import test from "node:test";
import {
  isPlatformSettingKey,
  parsePlatformSettingValue,
} from "../../lib/platform/admin-settings";

test("platform settings reject arbitrary secret-like keys", () => {
  assert.equal(isPlatformSettingKey("support_email"), true);
  assert.equal(isPlatformSettingKey("SUPABASE_SERVICE_ROLE_KEY"), false);
  assert.equal(isPlatformSettingKey("FLUTTERWAVE_SECRET_KEY"), false);
});

test("boolean settings are parsed as strict booleans", () => {
  assert.equal(parsePlatformSettingValue("checkout_available", "true"), true);
  assert.equal(parsePlatformSettingValue("checkout_available", "false"), false);
  assert.equal(parsePlatformSettingValue("checkout_available", "anything"), false);
});

test("email settings require a valid address", () => {
  assert.equal(
    parsePlatformSettingValue("support_email", "help@nouncompass.me"),
    "help@nouncompass.me",
  );
  assert.throws(
    () => parsePlatformSettingValue("support_email", "not-an-email"),
    /valid email/,
  );
});
