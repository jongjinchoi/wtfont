import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const CONFIG_DIR = join(homedir(), ".wtfont");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface Config {
  theme: string;
  /** User acknowledged the Playwright opt-in notice. */
  playwrightAcknowledged?: boolean;
  /** Default framework for `wtfont code` when not specified. */
  defaultFramework?: "html" | "nextjs" | "nuxt" | "react";
}

const DEFAULT_CONFIG: Config = {
  theme: "default",
};

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(partial: Partial<Config>): Promise<Config> {
  const current = await loadConfig();
  const next = { ...current, ...partial };
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
