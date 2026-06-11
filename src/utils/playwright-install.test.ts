import { describe, expect, it } from "vitest";
import { installChromium } from "./playwright-install.ts";

describe("installChromium", () => {
  it("uses the installed playwright-core CLI instead of npx latest", async () => {
    const calls: Array<{ command: string; args: string[] }> = [];

    const result = await installChromium({
      cliPath: "/repo/node_modules/playwright-core/cli.js",
      runCommand: async (command, args) => {
        calls.push({ command, args });
        return { success: true };
      },
    });

    expect(result).toEqual({ success: true });
    expect(calls).toEqual([
      {
        command: process.execPath,
        args: ["/repo/node_modules/playwright-core/cli.js", "install", "chromium"],
      },
    ]);
  });

  it("returns command failures instead of throwing", async () => {
    const result = await installChromium({
      cliPath: "/repo/node_modules/playwright-core/cli.js",
      runCommand: async () => ({ success: false, error: "download failed" }),
    });

    expect(result).toEqual({ success: false, error: "download failed" });
  });
});
