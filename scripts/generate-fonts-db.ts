/**
 * Regenerates src/core/google-fonts-db.ts from the live
 * https://fonts.google.com/metadata/fonts endpoint.
 *
 * Run manually:   bun run scripts/generate-fonts-db.ts
 * Run by CI:      .github/workflows/update-fonts-db.yml
 */
import { readFile, writeFile } from "node:fs/promises";

const METADATA_URL = "https://fonts.google.com/metadata/fonts";
const OUT_PATH = "src/core/google-fonts-db.ts";

interface FamilyMeta {
  family: string;
  category: string;
}
interface Payload {
  familyMetadataList: FamilyMeta[];
}

async function main() {
  console.log(`Fetching ${METADATA_URL}...`);
  const res = await fetch(METADATA_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Payload;
  const fams = data.familyMetadataList;
  if (!Array.isArray(fams) || fams.length === 0) {
    throw new Error("familyMetadataList is empty or missing");
  }

  const entries: Array<[string, string]> = fams
    .map((f) => [
      f.family.toLowerCase(),
      f.category.toLowerCase().replace(/\s+/g, "-"),
    ] as [string, string])
    .sort(([a], [b]) => a.localeCompare(b));

  // Preserve the existing exported helper functions — read the old file
  // and splice them in after the regenerated Map literal.
  const existing = await readFile(OUT_PATH, "utf-8");
  const helperMatch = existing.match(/(export function isGoogleFont[\s\S]+)$/);
  if (!helperMatch) {
    throw new Error(
      `Could not find helper functions in ${OUT_PATH}. Aborting to avoid losing them.`,
    );
  }
  const helpers = helperMatch[1];

  const body =
    `// Auto-generated from fonts.google.com/metadata/fonts\n` +
    `// ${entries.length} fonts\n` +
    `// Last updated: ${new Date().toISOString()}\n\n` +
    `const GOOGLE_FONTS: Map<string, string> = new Map([\n` +
    entries
      .map(([n, c]) => `  [${JSON.stringify(n)}, ${JSON.stringify(c)}],`)
      .join("\n") +
    `\n]);\n\n` +
    helpers;

  await writeFile(OUT_PATH, body, "utf-8");
  console.log(`✓ Wrote ${OUT_PATH} — ${entries.length} fonts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
