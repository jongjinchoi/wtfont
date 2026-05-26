import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist", "npm", "index.js");

// Integration test: launch the built MCP server over stdio and verify that
// every byte the server writes to stdout is a valid JSON-RPC message.
// This is a regression guard against accidental `console.log`/stray writes
// that would corrupt the stdio transport (spec §transports/stdio).
describe("mcp stdio transport discipline", () => {
  it("stdout lines during initialize are all valid JSON-RPC", async () => {
    if (!existsSync(DIST)) {
      throw new Error(
        `Expected built bundle at ${DIST}. Run \`bun run build:npm\` before this test.`,
      );
    }

    const child = spawn("node", [DIST, "mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdoutBuf = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString("utf-8");
    });

    const stderrChunks: string[] = [];
    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk.toString("utf-8"));
    });

    const initRequest =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "wtfont-stdio-test", version: "0" },
        },
      }) + "\n";

    child.stdin.write(initRequest);

    // Wait for server to respond (up to 5s).
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Timed out waiting for initialize response")),
        5000,
      );
      const check = setInterval(() => {
        if (stdoutBuf.includes("\n")) {
          clearInterval(check);
          clearTimeout(timer);
          resolve();
        }
      }, 50);
    });

    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 100));

    // Every non-empty line on stdout MUST parse as JSON-RPC.
    const lines = stdoutBuf.split("\n").filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed.jsonrpc).toBe("2.0");
    }

    // The initialize response must include serverInfo.
    const response = lines
      .map((l) => JSON.parse(l))
      .find((m) => m.id === 1 && m.result);
    expect(response).toBeDefined();
    expect(response.result.serverInfo?.name).toBe("wtfont");
  }, 10000);

  it("tool calls include structuredContent", async () => {
    if (!existsSync(DIST)) {
      throw new Error(
        `Expected built bundle at ${DIST}. Run \`bun run build:npm\` before this test.`,
      );
    }

    const child = spawn("node", [DIST, "mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdoutBuf = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString("utf-8");
    });

    const write = (message: unknown) => {
      child.stdin.write(JSON.stringify(message) + "\n");
    };

    write({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "wtfont-structured-test", version: "0" },
      },
    });

    await waitForMessage(() => stdoutBuf, (m) => m.id === 1 && m.result);
    write({ jsonrpc: "2.0", method: "notifications/initialized" });
    write({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "lookup_google_font",
        arguments: { name: "Inter" },
      },
    });

    const response = await waitForMessage(
      () => stdoutBuf,
      (m) => m.id === 2 && m.result,
    );

    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 100));

    expect(response.result.structuredContent).toMatchObject({
      name: "Inter",
      isGoogleFont: true,
      category: "sans-serif",
    });
  }, 10000);

  it("preview_fonts can return a compare file path without opening a browser", async () => {
    if (!existsSync(DIST)) {
      throw new Error(
        `Expected built bundle at ${DIST}. Run \`bun run build:npm\` before this test.`,
      );
    }

    const child = spawn("node", [DIST, "mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdoutBuf = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString("utf-8");
    });

    const write = (message: unknown) => {
      child.stdin.write(JSON.stringify(message) + "\n");
    };

    write({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "wtfont-preview-test", version: "0" },
      },
    });

    await waitForMessage(() => stdoutBuf, (m) => m.id === 1 && m.result);
    write({ jsonrpc: "2.0", method: "notifications/initialized" });
    write({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "preview_fonts",
        arguments: { names: ["Inter", "Fraunces"], open: false },
      },
    });

    const response = await waitForMessage(
      () => stdoutBuf,
      (m) => m.id === 2 && m.result,
    );

    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 100));

    expect(response.result.structuredContent).toMatchObject({
      mode: "compare",
      names: ["Inter", "Fraunces"],
      opened: false,
    });
    expect(response.result.structuredContent.path).toContain("wtfont-compare-");
  }, 10000);
});

async function waitForMessage(
  read: string | (() => string),
  predicate: (message: any) => boolean,
) {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const text = typeof read === "function" ? read() : read;
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      if (predicate(parsed)) return parsed;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Timed out waiting for MCP message");
}
