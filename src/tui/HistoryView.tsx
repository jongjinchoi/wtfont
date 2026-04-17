import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { loadHistory, type HistoryEntry } from "../config/history.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

export default function HistoryView({ limit = 20 }: { limit?: number }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    loadHistory().then((e) => setEntries(e.slice(0, limit)));
  }, [limit]);

  if (entries === null) return null;

  if (entries.length === 0) {
    return (
      <FrameBox title="History">
        <Text color={theme.dim}>
          No history yet. Run `wtfont analyze &lt;url&gt;`.
        </Text>
      </FrameBox>
    );
  }

  return (
    <FrameBox title="History">
      <Box flexDirection="column">
        {entries.map((e, i) => (
          <Box key={i} flexDirection="column" marginBottom={1}>
            <Box>
              <Text color={theme.text} bold>
                {e.domain}
              </Text>
              <Text color={theme.dim}> · {formatRelative(e.at)}</Text>
              <Text color={theme.dim}> · {e.detection}</Text>
            </Box>
            <Text color={theme.dim}>
              {"  "}
              {e.fontNames.slice(0, 5).join(", ")}
              {e.fontNames.length > 5
                ? ` (+${e.fontNames.length - 5} more)`
                : ""}
            </Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.dim}>
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} ·
          ~/.wtfont/history.json
        </Text>
      </Box>
    </FrameBox>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
