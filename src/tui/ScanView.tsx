import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { scanProject, type ScanResult } from "../core/scan-project.ts";
import { Spinner } from "./Spinner.tsx";
import { theme } from "./theme.ts";

export default function ScanView({ path }: { path: string }) {
  const { exit } = useApp();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    scanProject(path)
      .then((r) => setResult(r))
      .catch((e) => setError(String(e)))
      .finally(() => setTimeout(() => exit(), 50));
  }, [path, exit]);

  if (error) {
    return (
      <Box paddingY={1}>
        <Text color={theme.red}>✗ {error}</Text>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box paddingY={1}>
        <Spinner label={`Scanning ${path}...`} />
      </Box>
    );
  }

  if (result.fonts.length === 0) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.dim}>
          Scanned {result.filesScanned} files in {result.rootPath}.
        </Text>
        <Text color={theme.dim}>No non-system font-family usage detected.</Text>
      </Box>
    );
  }

  const freeCount = result.fonts.filter((f) => f.isFree).length;

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.dim}>
        $ wtfont scan {result.rootPath}
      </Text>
      <Box marginTop={1}>
        <Text>
          <Text color={theme.green}>✓</Text> Scanned {result.filesScanned} files
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text color={theme.text} bold>
          Fonts detected in project
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {result.fonts.map((f) => (
          <Box key={f.name} flexDirection="column" marginBottom={1}>
            <Box>
              <Text color={f.isFree ? theme.green : theme.yellow}>
                {f.isFree ? "✓" : "·"}
              </Text>
              <Text color={theme.text}> {f.name}</Text>
              <Text color={theme.dim}>
                {" "}
                · {f.occurrences} occurrence{f.occurrences === 1 ? "" : "s"} in{" "}
                {f.files.length} file{f.files.length === 1 ? "" : "s"}
              </Text>
            </Box>
            {f.files.slice(0, 3).map((file) => (
              <Text key={file} color={theme.dim}>
                {"    "}
                {file}
              </Text>
            ))}
            {f.files.length > 3 && (
              <Text color={theme.dim}>
                {"    "}
                (+{f.files.length - 3} more files)
              </Text>
            )}
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.dim}>
          {freeCount}/{result.fonts.length} are free Google Fonts
        </Text>
      </Box>
    </Box>
  );
}
