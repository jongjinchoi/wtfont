import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import {
  isGoogleFont,
  getGoogleFontCategory,
  getGoogleFontsUrl,
  getGoogleFontCount,
} from "../core/google-fonts-db.ts";
import { specimenUrl } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

interface Props {
  name: string;
  embedded?: boolean;
  onBack?: () => void;
}

export default function LookupView({ name, embedded, onBack }: Props) {
  const { exit } = useApp();
  const [confirmation, setConfirmation] = useState("");
  const found = isGoogleFont(name);

  const category = found ? getGoogleFontCategory(name) : null;
  const cssUrl = found ? getGoogleFontsUrl(name) : null;
  const specimen = found ? specimenUrl(name) : null;

  const handleExit = () => {
    if (embedded && onBack) onBack();
    else exit();
  };

  useInput((input, key) => {
    if (input === "q" || key.escape || input === "b") {
      handleExit();
    } else if (input === "p" && specimen) {
      openBrowser(specimen);
      setConfirmation("✓ Opened preview in browser");
      setTimeout(() => setConfirmation(""), 2000);
    } else if (input === "c" && cssUrl) {
      const ok = copyToClipboard(cssUrl);
      setConfirmation(ok ? "✓ URL copied to clipboard" : "✗ Copy failed");
      setTimeout(() => setConfirmation(""), 2000);
    }
  });

  const hintsFound = embedded
    ? [
        { key: "p", action: "preview" },
        { key: "c", action: "copy URL" },
        { key: "esc", action: "back" },
      ]
    : [
        { key: "p", action: "preview" },
        { key: "c", action: "copy URL" },
        { key: "q", action: "quit" },
      ];

  const hintsNotFound = embedded
    ? [{ key: "esc", action: "back" }]
    : [{ key: "q", action: "quit" }];

  const content = found ? (
    <>
      <Box marginBottom={1}>
        <Text color={theme.green}>✓ </Text>
        <Text color={theme.text} bold>
          {titleCase(name)}
        </Text>
      </Box>
      <Box flexDirection="column">
        <Text>
          <Text color={theme.dim}>{"  "}Category:     </Text>
          <Text color={theme.text}>{category}</Text>
        </Text>
        <Text>
          <Text color={theme.dim}>{"  "}Google Fonts: </Text>
          <Text color={theme.green}>yes</Text>
        </Text>
        <Text>
          <Text color={theme.dim}>{"  "}CSS URL:      </Text>
          <Text color={theme.text}>{cssUrl}</Text>
        </Text>
        <Text>
          <Text color={theme.dim}>{"  "}Specimen:     </Text>
          <Text color={theme.text}>{specimen}</Text>
        </Text>
      </Box>
      {confirmation && (
        <Box marginTop={1}>
          <Text
            color={confirmation.startsWith("✓") ? theme.green : theme.red}
          >
            {confirmation}
          </Text>
        </Box>
      )}
    </>
  ) : (
    <>
      <Box marginBottom={1}>
        <Text color={theme.yellow}>✗ </Text>
        <Text color={theme.text} bold>
          {name}
        </Text>
      </Box>
      <Box flexDirection="column">
        <Text color={theme.dim}>
          {"  "}Not found on Google Fonts ({getGoogleFontCount()} entries).
        </Text>
        <Text color={theme.dim}>
          {"  "}This is likely a commercial typeface.
        </Text>
        <Text color={theme.dim}>
          {"  "}Tip: via MCP, ask Claude for free alternatives.
        </Text>
      </Box>
    </>
  );

  if (embedded) return content;

  return (
    <FrameBox
      title={`wtfont lookup ${name}`}
      hints={found ? hintsFound : hintsNotFound}
    >
      {content}
    </FrameBox>
  );
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
