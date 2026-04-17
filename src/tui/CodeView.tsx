import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import {
  generateCssUsageCode,
  generateFreeImportCode,
  generatePremiumCode,
  type Framework,
} from "../core/code-templates.ts";
import type { MatchedFont } from "../types/font.ts";
import {
  getGoogleFontCategory,
  getGoogleFontsUrl,
  isGoogleFont,
} from "../core/google-fonts-db.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

interface Props {
  name: string;
  framework: Framework;
  weights: string[];
  role: "heading" | "body" | "display" | "monospace";
  alternative?: string;
  embedded?: boolean;
  onBack?: () => void;
}

export default function CodeView({
  name,
  framework,
  weights,
  role,
  alternative,
  embedded,
  onBack,
}: Props) {
  const { exit } = useApp();
  const [confirmation, setConfirmation] = useState("");

  const altName = alternative ?? name;
  const altIsFree = isGoogleFont(altName);
  const category =
    getGoogleFontCategory(altName) ??
    getGoogleFontCategory(name) ??
    "sans-serif";
  const googleFontsUrl = altIsFree ? getGoogleFontsUrl(altName, weights) : null;

  const font: MatchedFont = {
    role,
    originalName: name,
    isFree: altIsFree,
    alternativeName: altName,
    googleFontsUrl,
    fallback: category,
    weights,
  };

  const code = googleFontsUrl
    ? generateFreeImportCode(font)
    : generatePremiumCode(font, framework);

  useInput((input, key) => {
    if (input === "c") {
      const fullCode = googleFontsUrl
        ? code
        : code + "\n\n" + generateCssUsageCode(font);
      const ok = copyToClipboard(fullCode);
      setConfirmation(ok ? "✓ Copied to clipboard" : "✗ Copy failed");
      setTimeout(() => setConfirmation(""), 2000);
    } else if (key.escape || input === "b") {
      if (embedded && onBack) onBack();
      else exit();
    } else if (input === "q") {
      if (embedded && onBack) onBack();
      else exit();
    }
  });

  const hints = embedded
    ? [
        { key: "c", action: "copy code" },
        { key: "esc", action: "back" },
        { key: "q", action: "quit" },
      ]
    : [
        { key: "c", action: "copy code" },
        { key: "q", action: "quit" },
      ];

  const content = (
    <>
      <Box marginBottom={1}>
        <Text color={altIsFree ? theme.green : theme.yellow}>
          {altIsFree
            ? "✓ Free on Google Fonts"
            : "· Commercial font — license required"}
        </Text>
      </Box>

      <Box
        borderStyle="round"
        borderColor={theme.border}
        paddingX={1}
        paddingY={1}
        flexDirection="column"
      >
        {code.split("\n").map((line, i) => (
          <Text key={i} color={theme.text}>
            {line || " "}
          </Text>
        ))}
      </Box>

      {!googleFontsUrl && (
        <>
          <Box marginTop={1} marginBottom={1}>
            <Text color={theme.dim}>CSS usage:</Text>
          </Box>
          <Box
            borderStyle="round"
            borderColor={theme.border}
            paddingX={1}
            paddingY={1}
            flexDirection="column"
          >
            {generateCssUsageCode(font)
              .split("\n")
              .map((line, i) => (
                <Text key={i} color={theme.text}>
                  {line || " "}
                </Text>
              ))}
          </Box>
        </>
      )}

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
  );

  if (embedded) return content;

  return (
    <FrameBox title={`Code · ${name} (${framework})`} hints={hints}>
      {content}
    </FrameBox>
  );
}
