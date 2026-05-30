import { describe, it, expect } from "vitest";
import { generateUserSig } from "@/lib/tencent-im";

describe("generateUserSig", () => {
  it("returns a string with correct TLSSigAPIv2 format (sig.signature)", () => {
    const sig = generateUserSig("1400000000", "test-secret-key-for-unit-test", "testuser");
    expect(sig).toBeTypeOf("string");
    // TLSSigAPIv2 format: base64url(deflate(json)) + "." + base64url(hmac)
    const parts = sig.split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  it("generates different sigs for different users", () => {
    const sig1 = generateUserSig("1400000000", "key12345678901234567890", "userA");
    const sig2 = generateUserSig("1400000000", "key12345678901234567890", "userB");
    expect(sig1).not.toBe(sig2);
  });

  it("generates different sigs for different times", () => {
    // Different expire = different JSON → different sig
    const sig1 = generateUserSig("1400000000", "key12345678901234567890", "userA", 3600);
    const sig2 = generateUserSig("1400000000", "key12345678901234567890", "userA", 7200);
    expect(sig1).not.toBe(sig2);
  });

  it("generates with numeric-only sdkAppId string", () => {
    // Number("1400000000") should work fine
    const sig = generateUserSig("1400000000", "key12345678901234567890", "userA", 86400);
    expect(sig.split(".")).toHaveLength(2);
  });
});
