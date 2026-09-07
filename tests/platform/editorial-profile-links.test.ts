import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import EditorialPolicyPage from "../../app/editorial-policy/page";

test("editorial policy links Victorious and the editorial team to their distinct profile pages", () => {
  const html = renderToStaticMarkup(EditorialPolicyPage());

  assert.match(html, /href="\/authors\/victor"[^>]*>Victorious<\/a>/);
  assert.match(html, /href="\/authors\/editorial-team"[^>]*>NOUN Compass Editorial Team<\/a>/);
});
