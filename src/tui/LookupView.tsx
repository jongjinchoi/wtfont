import { Box, Text } from "ink";
import {
  isGoogleFont,
  getGoogleFontCategory,
  getGoogleFontsUrl,
  getGoogleFontCount,
} from "../core/google-fonts-db.ts";
import { specimenUrl } from "../core/preview.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

export default function LookupView({ name }: { name: string }) {
  const found = isGoogleFont(name);

  if (found) {
    const category = getGoogleFontCategory(name);
    const url = getGoogleFontsUrl(name);
    const specimen = specimenUrl(name);

    return (
      <FrameBox
        title={`wtfont lookup ${name}`}
        hints={[{ key: "next", action: `wtfont code "${titleCase(name)}" --framework nextjs` }]}
      >
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
            <Text color={theme.text}>{url}</Text>
          </Text>
          <Text>
            <Text color={theme.dim}>{"  "}Specimen:     </Text>
            <Text color={theme.text}>{specimen}</Text>
          </Text>
        </Box>
      </FrameBox>
    );
  }

  return (
    <FrameBox title={`wtfont lookup ${name}`}>
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
    </FrameBox>
  );
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
