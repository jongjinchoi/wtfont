import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import {
  getGoogleFontsByCategory,
  getGoogleFontCount,
} from "../core/google-fonts-db.ts";
import { specimenUrl } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import { addFavorite } from "../config/favorites.ts";
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
  const { exit } = useApp();
  const [cursor, setCursor] = useState(0);
  const [confirmation, setConfirmation] = useState("");

  if (!VALID.has(category.toLowerCase())) {
    return (
      <FrameBox title="Browse" hints={[{ key: "q", action: "quit" }]}>
        <Text color={theme.red}>
          Unknown category: {category}. Valid: sans-serif, serif, display,
          handwriting, monospace.
        </Text>
      </FrameBox>
    );
  }

  const all = getGoogleFontsByCategory(category);
  const fonts = all.slice(0, limit);

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      setCursor((i) => Math.min(i + 1, fonts.length - 1));
    } else if (input === "k" || key.upArrow) {
      setCursor((i) => Math.max(i - 1, 0));
    } else if (input === "p" && fonts[cursor]) {
      openBrowser(specimenUrl(toTitleCase(fonts[cursor])));
      setConfirmation("✓ Opened preview in browser");
      setTimeout(() => setConfirmation(""), 2000);
    } else if (input === "f" && fonts[cursor]) {
      addFavorite(toTitleCase(fonts[cursor]));
      setConfirmation(`✓ Added ${toTitleCase(fonts[cursor])} to favorites`);
      setTimeout(() => setConfirmation(""), 2000);
    } else if (input === "q") {
      exit();
    }
  });

  return (
    <FrameBox
      title={`Google Fonts — ${category}`}
      hints={[
        { key: "j/k", action: "move" },
        { key: "p", action: "preview" },
        { key: "f", action: "favorite" },
        { key: "q", action: "quit" },
      ]}
    >
      <Box flexDirection="column">
        {fonts.map((name, i) => {
          const selected = i === cursor;
          return (
            <Box key={name}>
              <Text color={selected ? theme.primary : undefined}>
                {selected ? "▸ " : "  "}
              </Text>
              <Text
                color={theme.text}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {toTitleCase(name)}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.dim}>
          Showing {fonts.length} of {all.length} ({getGoogleFontCount()} total)
        </Text>
        {confirmation && <Text color={theme.green}>{confirmation}</Text>}
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
