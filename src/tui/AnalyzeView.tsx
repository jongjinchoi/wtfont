import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { analyze, AnalyzeError } from "../core/analyze.ts";
import type { AnalysisResult } from "../types/font.ts";
import { addHistory } from "../config/history.ts";
import { specimenUrl } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import { installChromium } from "../utils/playwright-install.ts";
import { Spinner } from "./Spinner.tsx";
import FrameBox from "./FrameBox.tsx";
import CodeView from "./CodeView.tsx";
import LookupView from "./LookupView.tsx";
import { theme } from "./theme.ts";

interface Props {
  url: string;
  dynamic?: boolean;
  timeoutMs?: number;
}

type Phase =
  | "running"
  | "prompt_install"
  | "installing"
  | "selecting"
  | "code"
  | "lookup"
  | "error";

export default function AnalyzeView({ url, dynamic, timeoutMs }: Props) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<Phase>("running");
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [confirmation, setConfirmation] = useState("");

  const runAnalysis = (retryDynamic?: boolean) => {
    setPhase("running");
    (async () => {
      try {
        const r = await analyze(url, {
          dynamic: retryDynamic ?? dynamic,
          timeoutMs,
        });

        if (
          dynamic &&
          (r.dynamicStatus === "no_browser" ||
            r.dynamicStatus === "no_library")
        ) {
          setResult(r);
          setPhase("prompt_install");
          return;
        }

        setResult(r);
        setPhase("selecting");
        await addHistory({
          url: r.url,
          domain: r.domain,
          fontNames: r.fonts.map((f) => f.name),
          detection: r.detection,
          at: r.analyzedAt,
        });
      } catch (err) {
        const msg = err instanceof AnalyzeError ? err.message : String(err);
        setError(msg);
        setPhase("error");
      }
    })();
  };

  useEffect(() => {
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Parent input — active only when not in code/lookup sub-views
  useInput(
    (input, key) => {
      if (phase === "prompt_install") {
        if (input === "y" || input === "Y") {
          setPhase("installing");
          const { success, error: installError } = installChromium();
          if (success) {
            runAnalysis(true);
          } else {
            setError(`Chromium install failed: ${installError}`);
            setPhase("selecting");
          }
        } else if (input === "n" || input === "N") {
          setPhase("selecting");
          if (result) {
            addHistory({
              url: result.url,
              domain: result.domain,
              fontNames: result.fonts.map((f) => f.name),
              detection: result.detection,
              at: result.analyzedAt,
            });
          }
        }
      } else if (phase === "selecting" && result) {
        if (input === "j" || key.downArrow) {
          setCursor((i) => Math.min(i + 1, result.fonts.length - 1));
        } else if (input === "k" || key.upArrow) {
          setCursor((i) => Math.max(i - 1, 0));
        } else if (input === "p") {
          const font = result.fonts[cursor];
          if (font) {
            const url = specimenUrl(font.name);
            openBrowser(url);
            setConfirmation("Opened preview in browser.");
            setTimeout(() => setConfirmation(""), 2000);
          }
        } else if (input === "c") {
          setPhase("code");
        } else if (key.return) {
          setPhase("lookup");
        } else if (input === "q") {
          exit();
        }
      } else if (phase === "error") {
        if (input === "q") exit();
      }
    },
    { isActive: phase !== "code" && phase !== "lookup" },
  );

  // --- Loading / Installing ---
  if (phase === "running") {
    return (
      <FrameBox title={`wtfont analyze ${url}`}>
        <Spinner
          label={dynamic ? "Fetching + Playwright..." : "Fetching HTML..."}
        />
      </FrameBox>
    );
  }

  if (phase === "installing") {
    return (
      <FrameBox title={`wtfont analyze ${url}`}>
        <Spinner label="Installing Chromium (~150MB)..." />
      </FrameBox>
    );
  }

  // --- Error ---
  if (phase === "error") {
    return (
      <FrameBox
        title={`wtfont analyze ${url}`}
        hints={[{ key: "q", action: "quit" }]}
      >
        <Text color={theme.red}>✗ {error}</Text>
      </FrameBox>
    );
  }

  if (!result) return null;

  const selectedFont = result.fonts[cursor];

  // --- Code sub-view ---
  if (phase === "code" && selectedFont) {
    return (
      <FrameBox
        title={`Code · ${selectedFont.name} (nextjs)`}
        hints={[
          { key: "c", action: "copy code" },
          { key: "esc", action: "back" },
          { key: "q", action: "quit" },
        ]}
      >
        <CodeView
          name={selectedFont.name}
          framework="nextjs"
          weights={selectedFont.weights}
          role={selectedFont.role}
          embedded
          onBack={() => setPhase("selecting")}
        />
      </FrameBox>
    );
  }

  // --- Lookup sub-view ---
  if (phase === "lookup" && selectedFont) {
    return (
      <FrameBox
        title={`wtfont lookup ${selectedFont.name}`}
        hints={[
          ...(selectedFont.isFree
            ? [
                { key: "p", action: "preview" },
                { key: "c", action: "copy URL" },
              ]
            : []),
          { key: "esc", action: "back" },
          { key: "q", action: "quit" },
        ]}
      >
        <LookupView
          name={selectedFont.name}
          embedded
          onBack={() => setPhase("selecting")}
        />
      </FrameBox>
    );
  }

  // --- Selecting (main result table) ---
  const mode =
    result.detection === "merged"
      ? "static + dynamic"
      : result.detection === "dynamic"
        ? "dynamic (Playwright)"
        : "static parsing only";

  const freeCount = result.fonts.filter((f) => f.isFree).length;
  const showDynamicHint =
    !dynamic && result.fonts.length <= 2 && result.detection === "static";

  return (
    <FrameBox
      title={`Fonts on ${result.domain}`}
      hints={
        phase === "prompt_install"
          ? [
              { key: "y", action: "install & retry" },
              { key: "n", action: "continue with static" },
            ]
          : [
              { key: "j/k", action: "move" },
              { key: "p", action: "preview" },
              { key: "c", action: "code" },
              { key: "enter", action: "lookup" },
              { key: "q", action: "quit" },
            ]
      }
    >
      <Box marginBottom={1}>
        <Text>
          <Text color={theme.green}>✓</Text>
          <Text color={theme.dim}> Done — {mode}</Text>
        </Text>
      </Box>

      {phase === "prompt_install" && (
        <Box
          marginBottom={1}
          flexDirection="column"
          borderStyle="round"
          borderColor={theme.yellow}
          paddingX={1}
          paddingY={1}
        >
          <Text color={theme.yellow}>
            ⚠ Dynamic detection requested but Chromium not found.
          </Text>
          <Text color={theme.dim}>Install now? (~150MB download)</Text>
        </Box>
      )}

      <Box flexDirection="column">
        <Box>
          <Text color={theme.dim}>
            {"  "}
            {"role".padEnd(11)}
            {"name".padEnd(28)}
            {"source".padEnd(10)}
            {"weights".padEnd(22)}free
          </Text>
        </Box>
        <Box>
          <Text color={theme.border}>
            {"  "}
            {"─".repeat(10)} {"─".repeat(27)} {"─".repeat(9)} {"─".repeat(21)}{" "}
            ───
          </Text>
        </Box>
        {result.fonts.map((f, i) => {
          const selected = i === cursor && phase === "selecting";
          return (
            <Box key={`${f.name}-${i}`}>
              <Text color={selected ? theme.primary : undefined}>
                {selected ? "▸ " : "  "}
              </Text>
              <Text
                color={theme.text}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {f.role.padEnd(11)}
                {truncate(f.name, 27).padEnd(28)}
              </Text>
              <Text
                color={theme.dim}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {f.source.padEnd(10)}
                {truncate(f.weights.join(","), 21).padEnd(22)}
              </Text>
              <Text
                color={f.isFree ? theme.green : theme.yellow}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {f.isFree ? "✓" : "·"}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.dim}>
          {freeCount}/{result.fonts.length} on Google Fonts ·{" "}
          {result.fonts.length} total
        </Text>
        {showDynamicHint && (
          <Text color={theme.accent}>
            {result.fonts.length <= 1 ? "Few" : "Only 2"} font
            {result.fonts.length === 1 ? "" : "s"} detected. SPA? Try:{" "}
            wtfont analyze {url} --dynamic
          </Text>
        )}
        {confirmation && <Text color={theme.green}>{confirmation}</Text>}
      </Box>
    </FrameBox>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
