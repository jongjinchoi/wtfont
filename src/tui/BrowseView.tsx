import { Box, Text } from "ink";
import {
  getGoogleFontsByCategory,
  getGoogleFontCount,
} from "../core/google-fonts-db.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

const VALID = new Set([
  "sans-serif",
  "serif",
  "display",
  "handwriting",
  "monospace",
]);

export default function BrowseView({
  category,
  limit = 60,
}: {
  category: string;
  limit?: number;
}) {
  if (!VALID.has(category.toLowerCase())) {
    return (
      <FrameBox title="Browse">
        <Text color={theme.red}>
          Unknown category: {category}. Valid: sans-serif, serif, display,
          handwriting, monospace.
        </Text>
      </FrameBox>
    );
  }

  const all = getGoogleFontsByCategory(category);
  const fonts = all.slice(0, limit);

  return (
    <FrameBox
      title={`Google Fonts — ${category}`}
      hints={[{ key: "preview", action: "wtfont preview <name>" }]}
    >
      <Box flexDirection="column">
        {fonts.map((name) => (
          <Text key={name} color={theme.text}>
            {toTitleCase(name)}
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.dim}>
          Showing {fonts.length} of {all.length} ({getGoogleFontCount()} total)
        </Text>
      </Box>
    </FrameBox>
  );
}

function toTitleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
