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
  surface: string;
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
    surface: "#262630",
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
    surface: "#333333",
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
    surface: "#073642",
  },
  "catppuccin-mocha": {
    text: "#cdd6f4",
    primary: "#cba6f7",
    green: "#a6e3a1",
    red: "#f38ba8",
    yellow: "#f9e2af",
    blue: "#89b4fa",
    dim: "#6c7086",
    border: "#585b70",
    accent: "#fab387",
    surface: "#313244",
  },
  dracula: {
    text: "#f8f8f2",
    primary: "#bd93f9",
    green: "#50fa7b",
    red: "#ff5555",
    yellow: "#f1fa8c",
    blue: "#8be9fd",
    dim: "#6272a4",
    border: "#4e516e",
    accent: "#ffb86c",
    surface: "#44475a",
  },
};

export const THEME_NAMES = Object.keys(PALETTES);

const defaultPalette = PALETTES["default"]!;
export const theme: ThemePalette = { ...defaultPalette };

export function setTheme(name: string) {
  const next = PALETTES[name];
  if (next) Object.assign(theme, next);
}
