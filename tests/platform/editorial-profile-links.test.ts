import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const editorialPolicySource = fs.readFileSync(
  path.join(process.cwd(), "app", "editorial-policy", "page.tsx"),
  "utf8",
);

test("editorial policy links Victorious and the editorial team to their distinct profile pages", () => {
  assert.match(
    editorialPolicySource,
    /<a href=\{getEditorialProfile\("Victorious"\)\.href\}>Victorious<\/a>/,
  );
  assert.match(
    editorialPolicySource,
    /<a href=\{EDITORIAL_PROFILE_URL\}>NOUN Compass Editorial Team<\/a>/,
  );
});
