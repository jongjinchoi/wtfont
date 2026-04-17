import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { saveConfig, type Config } from "../config/config.ts";
import {
  isChromiumInstalled,
  installChromium,
} from "../utils/playwright-install.ts";
import { Spinner } from "./Spinner.tsx";
import FrameBox from "./FrameBox.tsx";
import { theme, THEME_NAMES, setTheme } from "./theme.ts";

interface Props {
  currentConfig: Config;
}

type Step = "theme" | "playwright_check" | "playwright_prompt" | "playwright_installing" | "done";

export default function InitView({ currentConfig }: Props) {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("theme");
  const [themeIdx, setThemeIdx] = useState(
    Math.max(0, THEME_NAMES.indexOf(currentConfig.theme)),
  );
  const [chromiumReady, setChromiumReady] = useState<boolean | null>(null);
  const [installError, setInstallError] = useState<string>("");

  useEffect(() => {
    if (step === "playwright_check") {
      isChromiumInstalled().then((ok) => {
        setChromiumReady(ok);
        if (ok) {
          void saveConfig({ playwrightAcknowledged: true });
          setStep("done");
        } else {
          setStep("playwright_prompt");
        }
      });
    }
  }, [step]);

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
        setStep("playwright_check");
      }
    } else if (step === "playwright_prompt") {
      if (input === "y" || input === "Y") {
        setStep("playwright_installing");
        const result = installChromium();
        if (result.success) {
          setChromiumReady(true);
          void saveConfig({ playwrightAcknowledged: true });
        } else {
          setInstallError(result.error ?? "Unknown error");
        }
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

  if (step === "playwright_check") {
    return (
      <FrameBox title="wtfont init" minHeight={10}>
        <Box marginBottom={1}>
          <Text color={theme.accent}>Step 2/2</Text>
          <Text color={theme.dim}> · Dynamic detection</Text>
        </Box>
        <Spinner label="Checking Chromium..." />
      </FrameBox>
    );
  }

  if (step === "playwright_prompt") {
    return (
      <FrameBox
        title="wtfont init"
        hints={[
          { key: "y", action: "install" },
          { key: "n", action: "skip" },
        ]}
        minHeight={10}
      >
        <Box marginBottom={1}>
          <Text color={theme.accent}>Step 2/2</Text>
          <Text color={theme.dim}> · Dynamic detection</Text>
        </Box>
        <Box marginBottom={1}>
          <Text color={theme.dim}>Chromium status: </Text>
          <Text color={theme.yellow}>✗ not installed</Text>
        </Box>
        <Text color={theme.text}>
          Install Chromium now? (~150MB download)
        </Text>
        <Box marginTop={1}>
          <Text color={theme.dim}>
            Skip: install later with `wtfont install-playwright`
          </Text>
        </Box>
      </FrameBox>
    );
  }

  if (step === "playwright_installing") {
    return (
      <FrameBox title="wtfont init" minHeight={10}>
        <Spinner label="Installing Chromium (~150MB)..." />
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
          <Text color={theme.dim}>{"  "}Chromium:   </Text>
          <Text color={chromiumReady ? theme.green : theme.yellow}>
            {chromiumReady ? "✓ installed" : "✗ not installed"}
          </Text>
        </Text>
      </Box>
      {installError && (
        <Box marginTop={1}>
          <Text color={theme.red}>Install error: {installError}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={theme.dim}>Saved to ~/.wtfont/config.json</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.dim}>Press any key to exit.</Text>
      </Box>
    </FrameBox>
  );
}
