import { describe, it, expect } from "vitest";
import { assertPublicUrl, SsrfBlockedError } from "./url-guard.ts";

async function expectBlocked(
  raw: string,
  expectedCode?: SsrfBlockedError["code"],
) {
  await expect(assertPublicUrl(raw)).rejects.toMatchObject({
    name: "SsrfBlockedError",
    ...(expectedCode ? { code: expectedCode } : {}),
  });
}

describe("assertPublicUrl — scheme checks", () => {
  it("rejects plain http:// (https-only policy)", async () => {
    await expectBlocked("http://example.com/", "BAD_SCHEME");
  });
  it("rejects http:// even for public IP", async () => {
    await expectBlocked("http://8.8.8.8/", "BAD_SCHEME");
  });
  it("rejects http:// for a well-known site", async () => {
    await expectBlocked("http://stripe.com/", "BAD_SCHEME");
  });
  it("rejects file://", async () => {
    await expectBlocked("file:///etc/passwd", "BAD_SCHEME");
  });
  it("rejects javascript:", async () => {
    await expectBlocked("javascript:alert(1)", "BAD_SCHEME");
  });
  it("rejects data:", async () => {
    await expectBlocked("data:text/plain,hello", "BAD_SCHEME");
  });
  it("rejects ftp:", async () => {
    await expectBlocked("ftp://example.com/", "BAD_SCHEME");
  });
  it("rejects malformed URL", async () => {
    await expectBlocked("not a url", "INVALID_URL");
  });
});

describe("assertPublicUrl — IPv4 literals", () => {
  it("blocks loopback 127.0.0.1", async () => {
    await expectBlocked("https://127.0.0.1/", "PRIVATE_IP");
  });
  it("blocks loopback 127.255.255.254", async () => {
    await expectBlocked("https://127.255.255.254/", "PRIVATE_IP");
  });
  it("blocks private 10.0.0.5", async () => {
    await expectBlocked("https://10.0.0.5/", "PRIVATE_IP");
  });
  it("blocks private 192.168.1.1", async () => {
    await expectBlocked("https://192.168.1.1/", "PRIVATE_IP");
  });
  it("blocks private 172.16.0.1", async () => {
    await expectBlocked("https://172.16.0.1/", "PRIVATE_IP");
  });
  it("blocks private 172.31.255.255", async () => {
    await expectBlocked("https://172.31.255.255/", "PRIVATE_IP");
  });
  it("blocks cloud metadata 169.254.169.254", async () => {
    await expectBlocked(
      "https://169.254.169.254/latest/meta-data/",
      "PRIVATE_IP",
    );
  });
  it("blocks carrier-grade NAT 100.64.0.1", async () => {
    await expectBlocked("https://100.64.0.1/", "PRIVATE_IP");
  });
  it("blocks unspecified 0.0.0.0", async () => {
    await expectBlocked("https://0.0.0.0/", "PRIVATE_IP");
  });
  it("blocks broadcast 255.255.255.255", async () => {
    await expectBlocked("https://255.255.255.255/", "PRIVATE_IP");
  });
  it("allows public 8.8.8.8 over https", async () => {
    const r = await assertPublicUrl("https://8.8.8.8/");
    expect(r.ips).toContain("8.8.8.8");
  });
  it("allows public 1.1.1.1 over https", async () => {
    const r = await assertPublicUrl("https://1.1.1.1/");
    expect(r.ips).toContain("1.1.1.1");
  });
});

describe("assertPublicUrl — IPv6 literals", () => {
  it("blocks loopback [::1]", async () => {
    await expectBlocked("https://[::1]/", "PRIVATE_IP");
  });
  it("blocks unique-local [fc00::1]", async () => {
    await expectBlocked("https://[fc00::1]/", "PRIVATE_IP");
  });
  it("blocks unique-local [fd12:3456:789a::1]", async () => {
    await expectBlocked("https://[fd12:3456:789a::1]/", "PRIVATE_IP");
  });
  it("blocks link-local [fe80::1]", async () => {
    await expectBlocked("https://[fe80::1]/", "PRIVATE_IP");
  });
  it("blocks IPv4-mapped loopback [::ffff:127.0.0.1]", async () => {
    await expectBlocked("https://[::ffff:127.0.0.1]/", "PRIVATE_IP");
  });
  it("blocks IPv4-mapped private [::ffff:10.0.0.1]", async () => {
    await expectBlocked("https://[::ffff:10.0.0.1]/", "PRIVATE_IP");
  });
  it("allows public IPv4-mapped [::ffff:8.8.8.8] over https", async () => {
    const r = await assertPublicUrl("https://[::ffff:8.8.8.8]/");
    expect(r.ips.length).toBeGreaterThan(0);
  });
});

describe("assertPublicUrl — DNS resolved hosts", () => {
  it("blocks 'localhost' (resolves to loopback)", async () => {
    await expectBlocked("https://localhost/", "PRIVATE_IP");
  });
  it("blocks 'ip6-localhost' if resolvable (loopback)", async () => {
    // On Linux this resolves to ::1; on macOS it may not resolve at all.
    // Accept either PRIVATE_IP or UNRESOLVABLE as a pass condition.
    await expect(assertPublicUrl("https://ip6-localhost/")).rejects.toMatchObject(
      { name: "SsrfBlockedError" },
    );
  });
  it("rejects unresolvable host", async () => {
    await expectBlocked(
      "https://this-host-does-not-exist-wtfont-12345.invalid/",
      "UNRESOLVABLE",
    );
  });
});
