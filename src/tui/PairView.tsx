import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import { pairFonts } from "../core/pair.ts";
import { generateComparePage } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

interface Props {
  name: string;
  targetRole: "heading" | "display";
}

export default function PairView({ name, targetRole }: Props) {
  const { exit } = useApp();
  const [confirmation, setConfirmation] = useState("");
  const result = pairFonts(name, targetRole);

  useInput((input) => {
    if (input === "q") {
      exit();
    } else if (input === "p" && result.suggestions.length > 0) {
      (async () => {
        const names = [name, ...result.suggestions.map((s) => s.name)];
        const path = await generateComparePage(names);
        openBrowser(`file://${path}`);
        setConfirmation("Opened compare page in browser.");
        setTimeout(() => setConfirmation(""), 2000);
      })();
    }
  });

  return (
    <FrameBox
      title={`Pair · ${name}`}
      hints={
        result.suggestions.length > 0
          ? [
              { key: "p", action: "preview compare" },
              { key: "q", action: "quit" },
            ]
          : [{ key: "q", action: "quit" }]
      }
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
              <Text color={theme.dim}>
                {"    "}
                {s.rationale}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.dim}>{result.note}</Text>
        {confirmation && <Text color={theme.green}>{confirmation}</Text>}
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
