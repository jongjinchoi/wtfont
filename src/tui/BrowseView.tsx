import { Box, Text } from "ink";
import { getGoogleFontsByCategory } from "../core/google-fonts-db.ts";
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
      <Box paddingY={1}>
        <Text color={theme.red}>
          Unknown category: {category}. Valid: sans-serif, serif, display,
          handwriting, monospace.
        </Text>
      </Box>
    );
  }

  const fonts = getGoogleFontsByCategory(category).slice(0, limit);
  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.dim}>
        Google Fonts — {category} ({fonts.length})
      </Text>
      <Box marginTop={1} flexDirection="column">
        {fonts.map((name) => (
          <Text key={name} color={theme.text}>
            {toTitleCase(name)}
          </Text>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>
          Showing {fonts.length}. Preview any: wtfont preview &lt;name&gt;
        </Text>
      </Box>
    </Box>
  );
}

function toTitleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
