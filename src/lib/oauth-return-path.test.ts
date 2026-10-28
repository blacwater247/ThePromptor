import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return boundaries", () => {
  test("preserves the consent request and fragment", () => {
    assert.equal(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#decision"), "/.lovable/oauth/consent?authorization_id=abc#decision");
  });
  test("rejects external and malformed return paths", () => {
    for (const value of ["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/\ninvalid", null]) assert.equal(oauthReturnPath(value), "/");
  });
});