import { Box, Text } from "ink";
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
import { theme } from "./theme.ts";

interface Props {
  name: string;
  framework: Framework;
  weights: string[];
  role: "heading" | "body" | "display" | "monospace";
  alternative?: string;
}

export default function CodeView({
  name,
  framework,
  weights,
  role,
  alternative,
}: Props) {
  const altName = alternative ?? name;
  const altIsFree = isGoogleFont(altName);
  const category =
    getGoogleFontCategory(altName) ?? getGoogleFontCategory(name) ?? "sans-serif";
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

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.dim}>
        $ wtfont code {name} --framework {framework}
      </Text>
      <Box marginTop={1}>
        <Text color={altIsFree ? theme.green : theme.yellow}>
          {altIsFree ? "✓ Free on Google Fonts" : "· Commercial font — license required"}
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {code.split("\n").map((line, i) => (
          <Text key={i} color={theme.text}>
            {line || " "}
          </Text>
        ))}
      </Box>

      {!googleFontsUrl && (
        <Box marginTop={1}>
          <Text color={theme.dim}>CSS usage only:</Text>
        </Box>
      )}
      {!googleFontsUrl && (
        <Box marginTop={1} flexDirection="column">
          {generateCssUsageCode(font)
            .split("\n")
            .map((line, i) => (
              <Text key={i} color={theme.text}>
                {line || " "}
              </Text>
            ))}
        </Box>
      )}
    </Box>
  );
}
