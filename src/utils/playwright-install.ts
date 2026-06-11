import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export interface InstallResult {
  success: boolean;
  error?: string;
}

export type CommandRunner = (
  command: string,
  args: string[],
) => Promise<InstallResult>;

/**
 * Check if the Chromium browser binary managed by playwright-core
 * is available on this machine.
 */
export async function isChromiumInstalled(): Promise<boolean> {
  try {
    const pw = await import("playwright-core");
    const path = pw.chromium.executablePath();
    return !!path && existsSync(path);
  } catch {
    return false;
  }
}

/**
 * Run the installed playwright-core CLI to download the Chromium browser binary.
 */
export async function installChromium(
  opts: {
    cliPath?: string;
    runCommand?: CommandRunner;
  } = {},
): Promise<InstallResult> {
  const cliPath = opts.cliPath ?? require.resolve("playwright-core/cli.js");
  const runCommand = opts.runCommand ?? spawnCommand;
  return runCommand(process.execPath, [cliPath, "install", "chromium"]);
}

function spawnCommand(command: string, args: string[]): Promise<InstallResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
    });
    child.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
        return;
      }
      const details = (stderr || stdout).trim();
      resolve({
        success: false,
        error: details || `playwright-core install exited with code ${code}`,
      });
    });
  });
}
