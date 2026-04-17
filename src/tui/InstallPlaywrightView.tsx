import { Text, useApp } from "ink";
import { useEffect, useState } from "react";
import {
  isChromiumInstalled,
  installChromium,
} from "../utils/playwright-install.ts";
import { Spinner } from "./Spinner.tsx";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

type Phase = "checking" | "already" | "installing" | "done" | "failed";

export default function InstallPlaywrightView() {
  const { exit } = useApp();
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const already = await isChromiumInstalled();
      if (already) {
        setPhase("already");
        setTimeout(() => exit(), 50);
        return;
      }
      setPhase("installing");
      const result = installChromium();
      if (result.success) {
        setPhase("done");
      } else {
        setError(result.error ?? "Unknown error");
        setPhase("failed");
      }
      setTimeout(() => exit(), 50);
    })();
  }, [exit]);

  if (phase === "checking") {
    return (
      <FrameBox title="install-playwright">
        <Spinner label="Checking Chromium..." />
      </FrameBox>
    );
  }

  if (phase === "already") {
    return (
      <FrameBox title="install-playwright">
        <Text color={theme.green}>
          ✓ Chromium is already installed. Ready for --dynamic.
        </Text>
      </FrameBox>
    );
  }

  if (phase === "installing") {
    return (
      <FrameBox title="install-playwright">
        <Spinner label="Downloading Chromium (~150MB)..." />
      </FrameBox>
    );
  }

  if (phase === "failed") {
    return (
      <FrameBox title="install-playwright">
        <Text color={theme.red}>✗ Install failed: {error}</Text>
      </FrameBox>
    );
  }

  return (
    <FrameBox title="install-playwright">
      <Text color={theme.green}>
        ✓ Chromium installed. Ready for --dynamic.
      </Text>
    </FrameBox>
  );
}
