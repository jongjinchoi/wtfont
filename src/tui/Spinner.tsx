import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { theme } from "./theme.ts";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner({ label }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % FRAMES.length), 80);
    return () => clearInterval(t);
  }, []);
  return (
    <Box>
      <Text color={theme.primary}>
        {FRAMES[i]}
        {label ? ` ${label}` : ""}
      </Text>
    </Box>
  );
}
