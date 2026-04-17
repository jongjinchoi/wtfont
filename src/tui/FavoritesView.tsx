import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import { loadFavorites, type Favorite } from "../config/favorites.ts";
import { isGoogleFont } from "../core/google-fonts-db.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

export default function FavoritesView() {
  const { exit } = useApp();
  useInput((input) => { if (input === "q") exit(); });
  const [favs, setFavs] = useState<Favorite[] | null>(null);

  useEffect(() => {
    loadFavorites().then(setFavs);
  }, []);

  if (favs === null) return null;

  if (favs.length === 0) {
    return (
      <FrameBox title="Favorites" hints={[{ key: "q", action: "quit" }]}>
        <Text color={theme.dim}>
          No favorites. Add with `wtfont favorites add &lt;name&gt;`.
        </Text>
      </FrameBox>
    );
  }

  return (
    <FrameBox title="Favorites">
      <Box flexDirection="column">
        {favs.map((f, i) => (
          <Box key={i}>
            <Text color={isGoogleFont(f.name) ? theme.green : theme.yellow}>
              {isGoogleFont(f.name) ? "✓" : "·"}
            </Text>
            <Text color={theme.text}> {f.name}</Text>
            {f.note && <Text color={theme.dim}> — {f.note}</Text>}
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text color={theme.dim}>
          {favs.length} font{favs.length === 1 ? "" : "s"} ·
          ~/.wtfont/favorites.json
        </Text>
      </Box>
    </FrameBox>
  );
}
