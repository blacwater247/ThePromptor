import { describe, expect, test } from "bun:test";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return boundaries", () => {
  test("preserves the consent request and fragment", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#decision")).toBe("/.lovable/oauth/consent?authorization_id=abc#decision");
  });
  test("rejects external and malformed return paths", () => {
    for (const value of ["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/\ninvalid", null]) expect(oauthReturnPath(value)).toBe("/");
  });
});