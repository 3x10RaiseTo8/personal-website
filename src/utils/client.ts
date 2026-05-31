/**
 * client.ts
 *
 * Shared utilities for persisting and applying user preferences (theme, font)
 * via localStorage and data-attributes on <html>.
 *
 * Designed to be imported by Astro component <script> blocks.
 * Can also be inlined in <head> (via a thin wrapper) to prevent FOUC.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";
export type Font = "serif" | "sans";

export type PreferenceKey = "theme" | "font";
export type PreferenceValue = Theme | Font;

// ─── Constants ────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  theme: "theme",
  font: "font",
} as const satisfies Record<PreferenceKey, string>;

export const DATA_ATTRS = {
  theme: "data-theme",
  font: "data-font",
} as const satisfies Record<PreferenceKey, string>;

export const DEFAULTS = {
  theme: "system" as Theme,
  font: "sans" as Font,
} as const;

// ─── Core helpers ─────────────────────────────────────────────────────────────

/** Read a value from localStorage safely (SSR / private-browsing guard). */
export function readStorage(key: PreferenceKey): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS[key]);
  } catch {
    return null;
  }
}

/** Write a value to localStorage safely. */
export function writeStorage(key: PreferenceKey, value: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], value);
  } catch {
    // ignore – storage may be unavailable
  }
}

/** Set a data-attribute on <html>. */
export function setHtmlAttr(key: PreferenceKey, value: string): void {
  document.documentElement.setAttribute(DATA_ATTRS[key], value);
}

/** Read a data-attribute from <html>. */
export function getHtmlAttr(key: PreferenceKey): string | null {
  return document.documentElement.getAttribute(DATA_ATTRS[key]);
}

// ─── Preference apply/init helpers ───────────────────────────────────────────

/**
 * Resolve the *effective* theme to apply to the DOM.
 * "system" defers to the OS preference.
 */
export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Apply a theme: persists to storage, writes to <html>.
 * The data-theme value is always the raw user choice ("light" | "dark" | "system"),
 * but we also write a resolved effective theme as data-theme-effective for CSS use.
 */
export function applyTheme(theme: Theme): void {
  writeStorage("theme", theme);
  setHtmlAttr("theme", theme);
  // Also expose the resolved value so CSS can target it without JS media queries
  document.documentElement.setAttribute(
    "data-theme-effective",
    resolveTheme(theme)
  );
}

/**
 * Apply a font: persists to storage, writes to <html>.
 */
export function applyFont(font: Font): void {
  writeStorage("font", font);
  setHtmlAttr("font", font);
}

// ─── Init functions (call these ASAP – ideally in <head> to prevent FOUC) ────

/**
 * Initialise theme from storage (or system default) as early as possible.
 * Safe to call in an inline script in <head>.
 */
export function initTheme(): Theme {
  const stored = readStorage("theme") as Theme | null;
  const theme: Theme =
    stored && ["light", "dark", "system"].includes(stored)
      ? stored
      : DEFAULTS.theme;
  applyTheme(theme);
  return theme;
}

/**
 * Initialise font from storage (or default) as early as possible.
 * Safe to call in an inline script in <head>.
 */
export function initFont(): Font {
  const stored = readStorage("font") as Font | null;
  const font: Font =
    stored && ["serif", "sans"].includes(stored) ? stored : DEFAULTS.font;
  applyFont(font);
  return font;
}

/**
 * Initialise all preferences at once.
 * Returns the applied values so the caller can sync UI state.
 */
export function initPreferences(): { theme: Theme; font: Font } {
  return {
    theme: initTheme(),
    font: initFont(),
  };
}

// ─── System theme change listener ─────────────────────────────────────────────

/**
 * Watch OS-level colour scheme changes and re-apply when the user's stored
 * preference is "system". Returns a cleanup function.
 */
export function watchSystemTheme(): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = () => {
    const stored = readStorage("theme") as Theme | null;
    if (!stored || stored === "system") {
      applyTheme("system");
    }
  };

  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
