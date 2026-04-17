import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { analyze, AnalyzeError } from "../core/analyze.ts";
import type { AnalysisResult } from "../types/font.ts";
import { addHistory } from "../config/history.ts";
import { installChromium } from "../utils/playwright-install.ts";
import { Spinner } from "./Spinner.tsx";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

interface Props {
  url: string;
  dynamic?: boolean;
  timeoutMs?: number;
}

type Phase = "running" | "prompt_install" | "installing" | "done" | "error";

export default function AnalyzeView({ url, dynamic, timeoutMs }: Props) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<Phase>("running");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

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
        setPhase("done");
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

  useInput((input) => {
    if (phase === "prompt_install") {
      if (input === "y" || input === "Y") {
        setPhase("installing");
        const { success, error: installError } = installChromium();
        if (success) {
          runAnalysis(true);
        } else {
          setError(`Chromium install failed: ${installError}`);
          setPhase("done");
        }
      } else if (input === "n" || input === "N") {
        setPhase("done");
        addHistory({
          url: result!.url,
          domain: result!.domain,
          fontNames: result!.fonts.map((f) => f.name),
          detection: result!.detection,
          at: result!.analyzedAt,
        });
        setTimeout(() => exit(), 50);
      }
    } else if (phase === "done" || phase === "error") {
      setTimeout(() => exit(), 50);
    }
  });

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

  if (phase === "error") {
    return (
      <FrameBox title={`wtfont analyze ${url}`}>
        <Text color={theme.red}>✗ {error}</Text>
      </FrameBox>
    );
  }

  if (!result) return null;

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
              { key: "code", action: "wtfont code <name>" },
              { key: "preview", action: "wtfont preview <name>" },
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
          <Text color={theme.dim}>
            Install now? (~150MB download)
          </Text>
        </Box>
      )}

      <Box flexDirection="column">
        <Box>
          <Text color={theme.dim}>
            {"role".padEnd(11)}
            {"name".padEnd(28)}
            {"source".padEnd(10)}
            {"weights".padEnd(22)}free
          </Text>
        </Box>
        <Box>
          <Text color={theme.border}>
            {"─".repeat(10)} {"─".repeat(27)} {"─".repeat(9)} {"─".repeat(21)}{" "}
            ───
          </Text>
        </Box>
        {result.fonts.map((f, i) => (
          <Box key={`${f.name}-${i}`}>
            <Text>{f.role.padEnd(11)}</Text>
            <Text color={theme.text}>{truncate(f.name, 27).padEnd(28)}</Text>
            <Text color={theme.dim}>{f.source.padEnd(10)}</Text>
            <Text color={theme.dim}>
              {truncate(f.weights.join(","), 21).padEnd(22)}
            </Text>
            <Text color={f.isFree ? theme.green : theme.yellow}>
              {f.isFree ? "✓" : "·"}
            </Text>
          </Box>
        ))}
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
      </Box>
    </FrameBox>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
