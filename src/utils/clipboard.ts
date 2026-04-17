import { execSync } from "node:child_process";

export function copyToClipboard(text: string): boolean {
  try {
    switch (process.platform) {
      case "darwin":
        execSync("pbcopy", { input: text });
        return true;
      case "linux":
        execSync("xclip -selection clipboard", { input: text });
        return true;
      case "win32":
        execSync("clip", { input: text });
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
