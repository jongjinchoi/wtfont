export interface ThemePalette {
  text: string;
  primary: string;
  green: string;
  red: string;
  yellow: string;
  blue: string;
  dim: string;
  border: string;
  accent: string;
}

const PALETTES: Record<string, ThemePalette> = {
  default: {
    text: "#e8e8e8",
    primary: "#af87ff",
    green: "#6bdc99",
    red: "#e05555",
    yellow: "#f0c060",
    blue: "#6aa9ff",
    dim: "#7f848a",
    border: "#3a3d44",
    accent: "#ff8a5c",
  },
  monochrome: {
    text: "#f0f0f0",
    primary: "#f0f0f0",
    green: "#bfbfbf",
    red: "#bfbfbf",
    yellow: "#dcdcdc",
    blue: "#bfbfbf",
    dim: "#7f7f7f",
    border: "#4a4a4a",
    accent: "#dcdcdc",
  },
  solarized: {
    text: "#93a1a1",
    primary: "#268bd2",
    green: "#859900",
    red: "#dc322f",
    yellow: "#b58900",
    blue: "#268bd2",
    dim: "#586e75",
    border: "#586e75",
    accent: "#cb4b16",
  },
};

export const THEME_NAMES = Object.keys(PALETTES);

const defaultPalette = PALETTES["default"]!;
export const theme: ThemePalette = { ...defaultPalette };

export function setTheme(name: string) {
  const next = PALETTES[name];
  if (next) Object.assign(theme, next);
}
