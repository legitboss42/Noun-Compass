import assert from "node:assert/strict";
import test from "node:test";
import { safeInternalReturnPath } from "../../lib/platform/return-path";

test("return paths accept a local application path", () => {
  assert.equal(safeInternalReturnPath("/membership"), "/membership");
  assert.equal(safeInternalReturnPath("/dashboard?notice=Welcome", "/dashboard"), "/dashboard?notice=Welcome");
});

test("return paths reject protocol-relative, absolute, backslash, and encoded escape attempts", () => {
  for (const unsafe of ["//evil.example", "https://evil.example", "\\\\evil.example", "/\\evil.example", "/%2f%2fevil.example", "/%5cevil.example", "%2F%2Fevil.example"]) {
    assert.equal(safeInternalReturnPath(unsafe, "/membership"), "/membership", unsafe);
  }
});
