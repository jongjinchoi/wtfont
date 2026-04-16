import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { analyze, AnalyzeError } from "../core/analyze.ts";
import type { AnalysisResult } from "../types/font.ts";
import { addHistory } from "../config/history.ts";
import { Spinner } from "./Spinner.tsx";
import { theme } from "./theme.ts";

interface Props {
  url: string;
  dynamic?: boolean;
  timeoutMs?: number;
}

type Phase = "running" | "done" | "error";

export default function AnalyzeView({ url, dynamic, timeoutMs }: Props) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<Phase>("running");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await analyze(url, { dynamic, timeoutMs });
        if (cancelled) return;
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
        if (cancelled) return;
        const msg = err instanceof AnalyzeError ? err.message : String(err);
        setError(msg);
        setPhase("error");
      } finally {
        if (!cancelled) setTimeout(() => exit(), 50);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, dynamic, timeoutMs, exit]);

  if (phase === "running") {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.dim}>$ wtfont analyze {url}</Text>
        <Box marginTop={1}>
          <Spinner label={dynamic ? "Fetching + Playwright..." : "Fetching HTML..."} />
        </Box>
      </Box>
    );
  }

  if (phase === "error") {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.dim}>$ wtfont analyze {url}</Text>
        <Box marginTop={1}>
          <Text color={theme.red}>✗ {error}</Text>
        </Box>
      </Box>
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

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.dim}>$ wtfont analyze {url}</Text>
      <Box marginTop={1}>
        <Text>
          <Text color={theme.green}>✓</Text> Done — {mode}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text color={theme.text} bold>
          Fonts on {result.domain}
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color={theme.dim}>
            {"role".padEnd(11)}
            {"name".padEnd(28)}
            {"source".padEnd(10)}
            {"weights".padEnd(22)}free
          </Text>
        </Box>
        <Box>
          <Text color={theme.dim}>
            {"─".repeat(10)} {"─".repeat(27)} {"─".repeat(9)} {"─".repeat(21)} ───
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
        <Text color={theme.dim}>
          Next: wtfont code &lt;name&gt; --framework nextjs
        </Text>
        <Text color={theme.dim}>
          Visual: wtfont preview {result.fonts[0]?.name ?? ""}
        </Text>
      </Box>
    </Box>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
