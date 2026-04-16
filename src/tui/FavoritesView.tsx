import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { loadFavorites, type Favorite } from "../config/favorites.ts";
import { isGoogleFont } from "../core/google-fonts-db.ts";
import { theme } from "./theme.ts";

export default function FavoritesView() {
  const [favs, setFavs] = useState<Favorite[] | null>(null);

  useEffect(() => {
    loadFavorites().then(setFavs);
  }, []);

  if (favs === null) return null;

  if (favs.length === 0) {
    return (
      <Box paddingY={1}>
        <Text color={theme.dim}>
          No favorites. Add with `wtfont favorites add &lt;name&gt;`.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={theme.dim}>Favorites</Text>
      <Box marginTop={1} flexDirection="column">
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
    </Box>
  );
}
