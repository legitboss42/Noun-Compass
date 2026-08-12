import assert from "node:assert/strict";
import test from "node:test";
import { currentAdSenseLocation, getAdSenseConfig, isAdSenseEligiblePath, shouldLoadAdSenseForLocation } from "../../lib/adsense";

const enabledConfig = getAdSenseConfig({
  NEXT_PUBLIC_ADSENSE_ENABLED: "true",
  NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-4073948936216175",
});

test("AdSense configuration fails closed unless the public flag is exactly true and the publisher id is valid", () => {
  assert.equal(getAdSenseConfig({}).enabled, false);
  assert.equal(getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "TRUE", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-1234567890" }).enabled, false);
  assert.equal(getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "true", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "pub-1234567890" }).enabled, false);
  assert.deepEqual(
    getAdSenseConfig({ NEXT_PUBLIC_ADSENSE_ENABLED: "true", NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: "ca-pub-4073948936216175" }),
    { enabled: true, publisherId: "ca-pub-4073948936216175" },
  );
});

test("AdSense allows only explicitly public content-dominant paths", () => {
  for (const pathname of ["/", "/admission", "/articles", "/articles/noun-registration-guide", "/about", "/contact", "/privacy-policy", "/terms", "/examinations", "/gst", "/portal", "/results", "/student-guides", "/study-centres"]) {
    assert.equal(isAdSenseEligiblePath(pathname), true, pathname);
  }
});

test("AdSense rejects private, transactional, tool, and query-string paths", () => {
  for (const pathname of [
    "/account", "/account/payment/callback", "/dashboard", "/admin", "/api/checkout/initialize",
    "/membership", "/tools", "/course-materials", "/exam-prep", "/unsubscribe", "/auth/callback", "/fees",
    "/articles/noun-registration-guide?preview=true", "/articles/noun-registration-guide#faq", "https://nouncompass.me/articles/x",
  ]) {
    assert.equal(isAdSenseEligiblePath(pathname), false, pathname);
  }
});

test("AdSense loader rejects query and hash variants before injecting the global script", () => {
  assert.equal(shouldLoadAdSenseForLocation(enabledConfig, "/articles/noun-registration-guide", "", ""), true);
  assert.equal(shouldLoadAdSenseForLocation(enabledConfig, "/articles/noun-registration-guide", "preview=true", ""), false);
  assert.equal(shouldLoadAdSenseForLocation(enabledConfig, "/articles/noun-registration-guide", "", "#faq"), false);
  assert.equal(shouldLoadAdSenseForLocation(enabledConfig, "/fees", "", ""), false);
  assert.equal(shouldLoadAdSenseForLocation({ enabled: false }, "/articles/noun-registration-guide", "", ""), false);
});

test("AdSense loader reads the initial browser hash atomically before its first decision", () => {
  const location = currentAdSenseLocation("/articles/noun-registration-guide", { search: "", hash: "#faq" });
  assert.equal(shouldLoadAdSenseForLocation(enabledConfig, location.pathname, location.search, location.hash), false);
});
