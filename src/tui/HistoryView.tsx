import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import {
  loadHistory,
  removeHistoryAt,
  type HistoryEntry,
} from "../config/history.ts";
import { generateComparePage } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

export default function HistoryView({ limit = 20 }: { limit?: number }) {
  const { exit } = useApp();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    loadHistory().then((e) => setEntries(e.slice(0, limit)));
  }, [limit]);

  useInput((input, key) => {
    if (!entries || entries.length === 0) {
      if (input === "q") exit();
      return;
    }
    if (input === "j" || key.downArrow) {
      setCursor((i) => Math.min(i + 1, entries.length - 1));
    } else if (input === "k" || key.upArrow) {
      setCursor((i) => Math.max(i - 1, 0));
    } else if (input === "p" && entries[cursor]) {
      const fontNames = entries[cursor].fontNames;
      if (fontNames.length > 0) {
        (async () => {
          const path = await generateComparePage(fontNames);
          openBrowser(`file://${path}`);
          setConfirmation("✓ Opened compare page in browser");
          setTimeout(() => setConfirmation(""), 2000);
        })();
      }
    } else if (input === "d" && entries[cursor]) {
      const domain = entries[cursor].domain;
      (async () => {
        const updated = await removeHistoryAt(cursor);
        setEntries(updated.slice(0, limit));
        setCursor((i) => Math.min(i, updated.length - 1));
        setConfirmation(`✓ Removed ${domain}`);
        setTimeout(() => setConfirmation(""), 2000);
      })();
    } else if (input === "q") {
      exit();
    }
  });

  if (entries === null) return null;

  if (entries.length === 0) {
    return (
      <FrameBox title="History" hints={[{ key: "q", action: "quit" }]}>
        <Text color={theme.dim}>
          No history yet. Run `wtfont analyze &lt;url&gt;`.
        </Text>
      </FrameBox>
    );
  }

  return (
    <FrameBox
      title="History"
      hints={[
        { key: "j/k", action: "move" },
        { key: "p", action: "preview fonts" },
        { key: "d", action: "delete" },
        { key: "q", action: "quit" },
      ]}
    >
      <Box flexDirection="column">
        {entries.map((e, i) => {
          const selected = i === cursor;
          return (
            <Box key={`${e.url}-${i}`} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color={selected ? theme.primary : undefined}>
                  {selected ? "▸ " : "  "}
                </Text>
                <Text
                  color={theme.text}
                  bold
                  backgroundColor={selected ? theme.surface : undefined}
                >
                  {e.domain}
                </Text>
                <Text
                  color={theme.dim}
                  backgroundColor={selected ? theme.surface : undefined}
                >
                  {" "}· {formatRelative(e.at)} · {e.detection}
                </Text>
              </Box>
              <Text color={theme.dim}>
                {"    "}
                {e.fontNames.slice(0, 5).join(", ")}
                {e.fontNames.length > 5
                  ? ` (+${e.fontNames.length - 5} more)`
                  : ""}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.dim}>
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} ·
          ~/.wtfont/history.json
        </Text>
        {confirmation && <Text color={theme.green}>{confirmation}</Text>}
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
