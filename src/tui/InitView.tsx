import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import { saveConfig, type Config } from "../config/config.ts";
import FrameBox from "./FrameBox.tsx";
import { theme, THEME_NAMES, setTheme } from "./theme.ts";

interface Props {
  currentConfig: Config;
}

type Step = "theme" | "playwright" | "done";

export default function InitView({ currentConfig }: Props) {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("theme");
  const [themeIdx, setThemeIdx] = useState(
    Math.max(0, THEME_NAMES.indexOf(currentConfig.theme)),
  );
  const [pw, setPw] = useState<boolean>(
    currentConfig.playwrightAcknowledged ?? false,
  );

  useInput((input, key) => {
    if (step === "theme") {
      if (key.upArrow) {
        const next =
          (themeIdx - 1 + THEME_NAMES.length) % THEME_NAMES.length;
        setThemeIdx(next);
        setTheme(THEME_NAMES[next]);
      } else if (key.downArrow) {
        const next = (themeIdx + 1) % THEME_NAMES.length;
        setThemeIdx(next);
        setTheme(THEME_NAMES[next]);
      } else if (key.return) {
        void saveConfig({ theme: THEME_NAMES[themeIdx] });
        setStep("playwright");
      }
    } else if (step === "playwright") {
      if (input === "y" || input === "Y") {
        setPw(true);
        void saveConfig({ playwrightAcknowledged: true });
        setStep("done");
      } else if (input === "n" || input === "N" || key.return) {
        void saveConfig({ playwrightAcknowledged: false });
        setStep("done");
      }
    } else if (step === "done") {
      exit();
    }
  });

  if (step === "theme") {
    return (
      <FrameBox
        title="wtfont init"
        hints={[
          { key: "↑↓", action: "select" },
          { key: "↵", action: "confirm" },
        ]}
        minHeight={10}
      >
        <Box marginBottom={1}>
          <Text color={theme.accent}>Step 1/2</Text>
          <Text color={theme.dim}> · Theme</Text>
        </Box>
        <Box flexDirection="column">
          {THEME_NAMES.map((name, i) => (
            <Box key={name}>
              <Text color={i === themeIdx ? theme.primary : theme.dim}>
                {i === themeIdx ? "  ● " : "  ○ "}
              </Text>
              <Text
                color={i === themeIdx ? theme.text : theme.dim}
                bold={i === themeIdx}
              >
                {name}
              </Text>
            </Box>
          ))}
        </Box>
      </FrameBox>
    );
  }

  if (step === "playwright") {
    return (
      <FrameBox
        title="wtfont init"
        hints={[
          { key: "y", action: "enable" },
          { key: "n", action: "skip" },
        ]}
        minHeight={10}
      >
        <Box marginBottom={1}>
          <Text color={theme.accent}>Step 2/2</Text>
          <Text color={theme.dim}> · Dynamic detection (optional)</Text>
        </Box>
        <Text color={theme.text}>
          Playwright lets wtfont detect fonts on JavaScript-rendered sites
          (SPAs). It requires ~150MB of Chromium.
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text color={theme.dim}>Install later with:</Text>
          <Text color={theme.text}>{"  "}npm install -g playwright-core</Text>
          <Text color={theme.text}>
            {"  "}npx playwright install chromium
          </Text>
        </Box>
      </FrameBox>
    );
  }

  return (
    <FrameBox title="wtfont init">
      <Text color={theme.green}>✓ Setup complete</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={theme.dim}>{"  "}Theme:      </Text>
          <Text color={theme.text}>{THEME_NAMES[themeIdx]}</Text>
        </Text>
        <Text>
          <Text color={theme.dim}>{"  "}Playwright: </Text>
          <Text color={theme.text}>{pw ? "acknowledged" : "skipped"}</Text>
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>Saved to ~/.wtfont/config.json</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>Press any key to exit.</Text>
      </Box>
    </FrameBox>
  );
}
