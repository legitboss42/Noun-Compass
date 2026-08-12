import assert from "node:assert/strict";
import test from "node:test";
import { getAdSenseConfig, isAdSenseEligiblePath } from "../../lib/adsense";

test("AdSense configuration fails closed unless the public flag is exactly true and the publisher id is valid", () => {
  assert.equal(getAdSenseConfig({}).enabled, false);
  assert.equal(getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "TRUE", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-1234567890" }).enabled, false);
  assert.equal(getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "true", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "pub-1234567890" }).enabled, false);
  assert.deepEqual(
    getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "true", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-4073948936216175" }),
    { enabled: true, publisherId: "ca-pub-4073948936216175" },
  );
});

test("AdSense allows only explicitly public informational paths", () => {
  for (const pathname of ["/", "/admission", "/articles", "/articles/noun-registration-guide", "/about", "/contact", "/privacy-policy", "/terms"]) {
    assert.equal(isAdSenseEligiblePath(pathname), true, pathname);
  }
});

test("AdSense rejects private, transactional, tool, and query-string paths", () => {
  for (const pathname of [
    "/account", "/account/payment/callback", "/dashboard", "/admin", "/api/checkout/initialize",
    "/membership", "/tools", "/course-materials", "/exam-prep", "/unsubscribe", "/auth/callback",
    "/articles/noun-registration-guide?preview=true", "/articles/noun-registration-guide#faq", "https://nouncompass.me/articles/x",
  ]) {
    assert.equal(isAdSenseEligiblePath(pathname), false, pathname);
  }
});
