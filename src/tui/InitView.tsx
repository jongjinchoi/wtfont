import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";
import { saveConfig, type Config } from "../config/config.ts";
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
        setThemeIdx((i) => (i - 1 + THEME_NAMES.length) % THEME_NAMES.length);
        setTheme(THEME_NAMES[(themeIdx - 1 + THEME_NAMES.length) % THEME_NAMES.length]);
      } else if (key.downArrow) {
        setThemeIdx((i) => (i + 1) % THEME_NAMES.length);
        setTheme(THEME_NAMES[(themeIdx + 1) % THEME_NAMES.length]);
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
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.dim}>Step 1/2 · Theme</Text>
        <Box marginTop={1} flexDirection="column">
          {THEME_NAMES.map((name, i) => (
            <Box key={name}>
              <Text color={i === themeIdx ? theme.primary : theme.dim}>
                {i === themeIdx ? "▸" : " "}
              </Text>
              <Text color={i === themeIdx ? theme.text : theme.dim}> {name}</Text>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text color={theme.dim}>↑↓ select · ↵ confirm</Text>
        </Box>
      </Box>
    );
  }

  if (step === "playwright") {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.dim}>Step 2/2 · Dynamic detection (optional)</Text>
        <Box marginTop={1}>
          <Text color={theme.text}>
            Playwright lets wtfont detect fonts on JavaScript-rendered sites
            (SPAs). It requires ~150MB of Chromium.
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.dim}>
            Enable? (y/N) — you can install later with:
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.text}>
            {"  "}npm install -g playwright-core
          </Text>
        </Box>
        <Box>
          <Text color={theme.text}>
            {"  "}npx playwright install chromium
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.green}>✓ Setup complete</Text>
      <Box marginTop={1}>
        <Text color={theme.dim}>
          Theme: {THEME_NAMES[themeIdx]} · Playwright acknowledged: {pw ? "yes" : "no"}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>Saved to ~/.wtfont/config.json</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>Press any key to exit.</Text>
      </Box>
    </Box>
  );
}
