import { describe, it, expect } from "vitest";
import { isAllowedTargetUrl } from "../src/modules/links/links.schemas";

// Covers the open-redirect/SSRF-adjacent guard added after a security
// review: a link shortener that redirects to whatever URL a user submits
// needs a scheme/host allow-list, or it becomes a redirector for
// javascript:-adjacent schemes and an SSRF probe for internal/metadata IPs.

describe("isAllowedTargetUrl", () => {
  it("allows ordinary public http(s) URLs", () => {
    expect(isAllowedTargetUrl("https://example.com/a/b?c=1")).toBe(true);
    expect(isAllowedTargetUrl("http://example.com")).toBe(true);
  });

  it("rejects non-http(s) schemes", () => {
    expect(isAllowedTargetUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedTargetUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedTargetUrl("ftp://example.com/file")).toBe(false);
  });

  it("rejects loopback and private/link-local hosts", () => {
    expect(isAllowedTargetUrl("http://localhost:3000")).toBe(false);
    expect(isAllowedTargetUrl("http://127.0.0.1")).toBe(false);
    expect(isAllowedTargetUrl("http://10.0.0.5")).toBe(false);
    expect(isAllowedTargetUrl("http://192.168.1.1")).toBe(false);
    expect(isAllowedTargetUrl("http://172.16.0.1")).toBe(false);
  });

  it("rejects the cloud-metadata IP and hostname", () => {
    expect(isAllowedTargetUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isAllowedTargetUrl("http://metadata.google.internal/")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isAllowedTargetUrl("not a url")).toBe(false);
    expect(isAllowedTargetUrl("")).toBe(false);
  });
});
