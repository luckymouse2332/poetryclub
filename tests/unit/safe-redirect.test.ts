import { describe, expect, it } from "vitest";

import {
  getLoginPath,
  getSafeRedirectPath,
} from "@/lib/safe-redirect";

describe("getSafeRedirectPath", () => {
  it("accepts internal absolute paths", () => {
    expect(getSafeRedirectPath("/account")).toBe("/account");
    expect(getSafeRedirectPath("/works/123")).toBe("/works/123");
    expect(getSafeRedirectPath("/")).toBe("/");
  });

  it("accepts internal paths with query strings and hashes", () => {
    expect(getSafeRedirectPath("/works/123?tab=recent#top")).toBe(
      "/works/123?tab=recent#top",
    );
    expect(getSafeRedirectPath("/account?page=2")).toBe("/account?page=2");
    expect(getSafeRedirectPath("/works/123#comment-7")).toBe(
      "/works/123#comment-7",
    );
  });

  it("accepts percent-encoded safe internal characters", () => {
    expect(getSafeRedirectPath("/works/%E8%AF%97")).toBe("/works/%E8%AF%97");
  });

  it("rejects external absolute URLs", () => {
    expect(getSafeRedirectPath("https://example.com")).toBe("/");
    expect(getSafeRedirectPath("http://example.com/path")).toBe("/");
    expect(getSafeRedirectPath("https://example.com/account")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeRedirectPath("//example.com")).toBe("/");
    expect(getSafeRedirectPath("//example.com/path")).toBe("/");
  });

  it("rejects non-http protocols", () => {
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(getSafeRedirectPath("file:///etc/passwd")).toBe("/");
    expect(getSafeRedirectPath("data:text/html,<script>1</script>")).toBe("/");
  });

  it("rejects backslashes and mixed separators", () => {
    expect(getSafeRedirectPath("\\example.com")).toBe("/");
    expect(getSafeRedirectPath("/account\\@evil.com")).toBe("/");
    expect(getSafeRedirectPath("\\\\example.com")).toBe("/");
    expect(getSafeRedirectPath("\\/\\/example.com")).toBe("/");
  });

  it("rejects single-encoded external and protocol-relative addresses", () => {
    expect(getSafeRedirectPath("https%3A%2F%2Fexample.com")).toBe("/");
    expect(getSafeRedirectPath("%2F%2Fexample.com")).toBe("/");
    expect(getSafeRedirectPath("/%2F%2Fexample.com")).toBe("/");
  });

  it("rejects double-encoded external and protocol-relative addresses", () => {
    expect(getSafeRedirectPath("https%253A%252F%252Fexample.com")).toBe("/");
    expect(getSafeRedirectPath("%252F%252Fexample.com")).toBe("/");
    expect(getSafeRedirectPath("/%252F%252Fexample.com")).toBe("/");
  });

  it("rejects encoded backslashes", () => {
    expect(getSafeRedirectPath("%5C%5Cexample.com")).toBe("/");
    expect(getSafeRedirectPath("/%5C%5Cexample.com")).toBe("/");
    expect(getSafeRedirectPath("/%5Cevil.com")).toBe("/");
  });

  it("rejects control characters and their encoded forms", () => {
    expect(getSafeRedirectPath("/account\u0000")).toBe("/");
    expect(getSafeRedirectPath("/account%00")).toBe("/");
    expect(getSafeRedirectPath("/account%0d%0a")).toBe("/");
    expect(getSafeRedirectPath("/%09")).toBe("/");
  });

  it("rejects malformed percent encoding", () => {
    expect(getSafeRedirectPath("/%zz")).toBe("/");
    expect(getSafeRedirectPath("/account%")).toBe("/");
    expect(getSafeRedirectPath("%")).toBe("/");
  });

  it("rejects non-string and array inputs", () => {
    expect(getSafeRedirectPath(null)).toBe("/");
    expect(getSafeRedirectPath(undefined)).toBe("/");
    expect(getSafeRedirectPath(42)).toBe("/");
    expect(getSafeRedirectPath(true)).toBe("/");
    expect(getSafeRedirectPath({ path: "/account" })).toBe("/");
    expect(getSafeRedirectPath([" /account"])).toBe("/");
  });

  it("rejects empty and overlong inputs", () => {
    expect(getSafeRedirectPath("")).toBe("/");
    expect(getSafeRedirectPath(`/${"a".repeat(2048)}`)).toBe("/");
  });

  it("accepts a boundary-length internal path", () => {
    const boundary = `/${"a".repeat(2047)}`;
    expect(getSafeRedirectPath(boundary)).toBe(boundary);
  });

  it("rejects relative paths without a leading slash", () => {
    expect(getSafeRedirectPath("account")).toBe("/");
    expect(getSafeRedirectPath("..")).toBe("/");
  });

  it("uses the supplied fallback when it is safe and rejects unsafe fallbacks", () => {
    expect(getSafeRedirectPath("https://example.com", "/fallback")).toBe(
      "/fallback",
    );
    expect(getSafeRedirectPath("https://example.com", "https://evil.com")).toBe(
      "/",
    );
    expect(getSafeRedirectPath("https://example.com", "//evil.com")).toBe("/");
  });
});

describe("getLoginPath", () => {
  it("builds a login URL with an encoded safe return path", () => {
    expect(getLoginPath("/account")).toBe("/login?next=%2Faccount");
    expect(getLoginPath("/works/123?tab=recent")).toBe(
      "/login?next=%2Fworks%2F123%3Ftab%3Drecent",
    );
  });

  it("falls back to the root for unsafe inputs", () => {
    expect(getLoginPath("https://example.com")).toBe("/login?next=%2F");
    expect(getLoginPath("//evil.example")).toBe("/login?next=%2F");
    expect(getLoginPath(undefined)).toBe("/login?next=%2F");
    expect(getLoginPath([" /account"])).toBe("/login?next=%2F");
  });
});
