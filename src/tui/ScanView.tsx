import { Box, Text, useApp } from "ink";
import { useEffect, useState } from "react";
import { scanProject, type ScanResult } from "../core/scan-project.ts";
import { Spinner } from "./Spinner.tsx";
import FrameBox from "./FrameBox.tsx";
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
      <FrameBox title="Project scan">
        <Text color={theme.red}>✗ {error}</Text>
      </FrameBox>
    );
  }

  if (!result) {
    return (
      <FrameBox title={`Scanning ${path}`}>
        <Spinner label="Reading files..." />
      </FrameBox>
    );
  }

  if (result.fonts.length === 0) {
    return (
      <FrameBox title={`Project scan · ${result.rootPath}`}>
        <Text color={theme.dim}>
          Scanned {result.filesScanned} files. No non-system font-family
          detected.
        </Text>
      </FrameBox>
    );
  }

  const freeCount = result.fonts.filter((f) => f.isFree).length;

  return (
    <FrameBox title={`Project scan · ${result.rootPath}`}>
      <Box marginBottom={1}>
        <Text>
          <Text color={theme.green}>✓</Text>
          <Text color={theme.dim}>
            {" "}
            Scanned {result.filesScanned} files
          </Text>
        </Text>
      </Box>

      <Box flexDirection="column">
        {result.fonts.map((f) => (
          <Box key={f.name} flexDirection="column" marginBottom={1}>
            <Box>
              <Text color={f.isFree ? theme.green : theme.yellow}>
                {f.isFree ? "✓" : "·"}
              </Text>
              <Text color={theme.text}> {f.name}</Text>
              <Text color={theme.dim}>
                {" "}
                · {f.occurrences}× in {f.files.length} file
                {f.files.length === 1 ? "" : "s"}
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
                {"    "}(+{f.files.length - 3} more)
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
    </FrameBox>
  );
}
