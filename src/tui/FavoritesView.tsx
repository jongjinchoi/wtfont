import { Box, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import {
  loadFavorites,
  removeFavorite,
  type Favorite,
} from "../config/favorites.ts";
import { isGoogleFont } from "../core/google-fonts-db.ts";
import { specimenUrl } from "../core/preview.ts";
import { openBrowser } from "../utils/browser.ts";
import FrameBox from "./FrameBox.tsx";
import { theme } from "./theme.ts";

export default function FavoritesView() {
  const { exit } = useApp();
  const [favs, setFavs] = useState<Favorite[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    loadFavorites().then(setFavs);
  }, []);

  useInput((input, key) => {
    if (!favs || favs.length === 0) {
      if (input === "q") exit();
      return;
    }
    if (input === "j" || key.downArrow) {
      setCursor((i) => Math.min(i + 1, favs.length - 1));
    } else if (input === "k" || key.upArrow) {
      setCursor((i) => Math.max(i - 1, 0));
    } else if (input === "p" && favs[cursor]) {
      openBrowser(specimenUrl(favs[cursor].name));
      setConfirmation("✓ Opened preview in browser");
      setTimeout(() => setConfirmation(""), 2000);
    } else if (input === "d" && favs[cursor]) {
      const name = favs[cursor].name;
      (async () => {
        const updated = await removeFavorite(name);
        setFavs(updated);
        setCursor((i) => Math.min(i, updated.length - 1));
        setConfirmation(`✓ Removed ${name}`);
        setTimeout(() => setConfirmation(""), 2000);
      })();
    } else if (input === "q") {
      exit();
    }
  });

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
    <FrameBox
      title="Favorites"
      hints={[
        { key: "j/k", action: "move" },
        { key: "p", action: "preview" },
        { key: "d", action: "remove" },
        { key: "q", action: "quit" },
      ]}
    >
      <Box flexDirection="column">
        {favs.map((f, i) => {
          const selected = i === cursor;
          return (
            <Box key={`${f.name}-${i}`}>
              <Text color={selected ? theme.primary : undefined}>
                {selected ? "▸ " : "  "}
              </Text>
              <Text
                color={isGoogleFont(f.name) ? theme.green : theme.yellow}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {isGoogleFont(f.name) ? "✓" : "·"}
              </Text>
              <Text
                color={theme.text}
                backgroundColor={selected ? theme.surface : undefined}
              >
                {" "}{f.name}
              </Text>
              {f.note && (
                <Text
                  color={theme.dim}
                  backgroundColor={selected ? theme.surface : undefined}
                >
                  {" "}— {f.note}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={theme.dim}>
          {favs.length} font{favs.length === 1 ? "" : "s"} ·
          ~/.wtfont/favorites.json
        </Text>
        {confirmation && <Text color={theme.green}>{confirmation}</Text>}
      </Box>
    </FrameBox>
  );
}
