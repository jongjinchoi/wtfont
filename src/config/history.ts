import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CONFIG_DIR } from "./config.ts";

const HISTORY_PATH = join(CONFIG_DIR, "history.json");
const MAX_ENTRIES = 100;

export interface HistoryEntry {
  url: string;
  domain: string;
  fontNames: string[];
  detection: "static" | "dynamic" | "merged";
  at: string; // ISO timestamp
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await readFile(HISTORY_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addHistory(entry: HistoryEntry): Promise<void> {
  const list = await loadHistory();
  // Deduplicate by URL — most recent wins
  const filtered = list.filter((e) => e.url !== entry.url);
  filtered.unshift(entry);
  const trimmed = filtered.slice(0, MAX_ENTRIES);
  await mkdir(dirname(HISTORY_PATH), { recursive: true });
  await writeFile(HISTORY_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
}

export async function clearHistory(): Promise<void> {
  await mkdir(dirname(HISTORY_PATH), { recursive: true });
  await writeFile(HISTORY_PATH, "[]", "utf-8");
}
