import assert from "node:assert/strict";
import test from "node:test";
import { isCheckoutReleaseEnabled, isFlutterwaveConfigurationValid } from "../../lib/platform/config";

test("releases checkout for a configured live environment", () => {
  assert.equal(isCheckoutReleaseEnabled("live", "false", undefined), true);
});

test("keeps test checkout behind its explicit feature flag", () => {
  assert.equal(isCheckoutReleaseEnabled("test", "false", undefined), false);
  assert.equal(isCheckoutReleaseEnabled("test", "true", undefined), true);
});

test("emergency disable overrides both live mode and the feature flag", () => {
  assert.equal(isCheckoutReleaseEnabled("live", "true", "true"), false);
});

test("rejects keys that do not match the configured Flutterwave environment", () => {
  assert.equal(isFlutterwaveConfigurationValid("test", "FLWSECK_TEST-example", "webhook-secret"), true);
  assert.equal(isFlutterwaveConfigurationValid("live", "FLWSECK_TEST-example", "webhook-secret"), false);
  assert.equal(isFlutterwaveConfigurationValid("live", "FLWSECK-example", "webhook-secret"), true);
  assert.equal(isFlutterwaveConfigurationValid("invalid", "FLWSECK-example", "webhook-secret"), false);
});
