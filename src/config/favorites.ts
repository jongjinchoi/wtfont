import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CONFIG_DIR } from "./config.ts";

const FAVORITES_PATH = join(CONFIG_DIR, "favorites.json");

export interface Favorite {
  name: string;
  addedAt: string;
  note?: string;
}

export async function loadFavorites(): Promise<Favorite[]> {
  try {
    const raw = await readFile(FAVORITES_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addFavorite(
  name: string,
  note?: string,
): Promise<Favorite[]> {
  const list = await loadFavorites();
  const norm = name.trim();
  const existsIdx = list.findIndex(
    (f) => f.name.toLowerCase() === norm.toLowerCase(),
  );
  if (existsIdx === -1) {
    list.push({ name: norm, addedAt: new Date().toISOString(), note });
  } else if (note !== undefined) {
    list[existsIdx].note = note;
  }
  await persist(list);
  return list;
}

export async function removeFavorite(name: string): Promise<Favorite[]> {
  const list = await loadFavorites();
  const filtered = list.filter(
    (f) => f.name.toLowerCase() !== name.trim().toLowerCase(),
  );
  await persist(filtered);
  return filtered;
}

async function persist(list: Favorite[]): Promise<void> {
  await mkdir(dirname(FAVORITES_PATH), { recursive: true });
  await writeFile(FAVORITES_PATH, JSON.stringify(list, null, 2), "utf-8");
}
