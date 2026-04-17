import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

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
 * Run `npx playwright install chromium` to download the browser binary.
 * Blocks until the download finishes (~150 MB).
 */
export function installChromium(): { success: boolean; error?: string } {
  try {
    execSync("npx playwright install chromium", {
      stdio: "inherit",
      timeout: 300_000,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
