export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "poetryclub-theme";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function resolveTheme(preference: unknown, systemDark: boolean): Theme {
  return parseTheme(preference) ?? (systemDark ? "dark" : "light");
}

// Fixed application code only: run while parsing head, before first paint/hydration.
export const THEME_INITIALIZATION_SCRIPT = `(() => {
  let preference = null;
  try { preference = localStorage.getItem("${THEME_STORAGE_KEY}"); } catch {}
  const theme = preference === "light" || preference === "dark"
    ? preference
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
})();`;
