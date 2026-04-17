import { Box, Text } from "ink";
import { pairFonts } from "../core/pair.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

interface Props {
  name: string;
  targetRole: "heading" | "display";
}

export default function PairView({ name, targetRole }: Props) {
  const result = pairFonts(name, targetRole);

  return (
    <FrameBox
      title={`Pair · ${name}`}
      hints={[
        {
          key: "preview",
          action: `wtfont preview ${name} <suggestion> --compare`,
        },
      ]}
    >
      <Box marginBottom={1}>
        <Text color={theme.dim}>Input: </Text>
        <Text color={theme.text}>{name}</Text>
        <Text color={theme.dim}>
          {" "}
          ({result.input.category ?? "unknown"}
          {result.input.isGoogleFont ? ", Google Fonts" : ""})
        </Text>
      </Box>

      {result.suggestions.length === 0 ? (
        <Text color={theme.dim}>No suggestions found.</Text>
      ) : (
        <Box flexDirection="column">
          {result.suggestions.map((s) => (
            <Box key={s.name} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color={theme.accent}>· </Text>
                <Text color={theme.text} bold>
                  {toTitleCase(s.name)}
                </Text>
                <Text color={theme.dim}> [{s.category}]</Text>
              </Box>
              <Text color={theme.dim}>{"    "}{s.rationale}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={theme.dim}>{result.note}</Text>
      </Box>
    </FrameBox>
  );
}

function toTitleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
