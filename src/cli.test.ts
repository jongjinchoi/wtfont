import { describe, expect, it } from "vitest";
import { spawn } from "node:child_process";

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runCli(args: string[]): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", ["run", "src/index.ts", ...args], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`CLI timed out: ${args.join(" ")}`));
    }, 8000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin.end();
  });
}

describe("CLI non-TTY fallback", () => {
  it("lookup prints text instead of crashing when stdin is not a TTY", async () => {
    const result = await runCli(["lookup", "Inter"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Inter");
    expect(result.stdout).toContain("Google Fonts");
    expect(result.stderr).not.toContain("Raw mode is not supported");
  });

  it("code emits Next.js Google font code when stdin is not a TTY", async () => {
    const result = await runCli([
      "code",
      "Inter",
      "--framework",
      "nextjs",
      "--weights",
      "400,700",
    ]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("import { Inter } from 'next/font/google'");
    expect(result.stdout).toContain("weight: ['400', '700']");
    expect(result.stderr).not.toContain("Raw mode is not supported");
  });

  it("scan supports json output", async () => {
    const result = await runCli([
      "scan",
      "assets/fixtures/scan-demo",
      "--format",
      "json",
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.filesScanned).toBeGreaterThan(0);
    expect(parsed.fonts.some((font: { name: string }) => font.name === "Inter")).toBe(true);
  });
});
