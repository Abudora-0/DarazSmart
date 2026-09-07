"use client";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "darazsmart-theme";

/**
 * Runs before first paint, inlined into <head>, so the page never flashes the
 * wrong theme. Kept in one place so the script and the runtime helpers below
 * can never drift apart. Stringified as-is, so no imports or closures here.
 */
export const themeBootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_KEY}");
    var choice = stored === "light" || stored === "dark" ? stored : "system";
    var resolved =
      choice === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : choice;
    document.documentElement.setAttribute("data-theme", resolved);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

const listeners = new Set<(choice: ThemeChoice) => void>();

export function getStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === "system" ? systemTheme() : choice;
}

/** Writes the attribute and cross-fades the colours for a single beat. */
export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  root.setAttribute("data-theme", resolveTheme(choice));
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Private browsing or blocked storage: the theme still applies for the
    // life of this page, it just will not be remembered.
  }
  applyTheme(choice);
  listeners.forEach((fn) => fn(choice));
}

export function subscribeTheme(fn: (choice: ThemeChoice) => void) {
  listeners.add(fn);
  // Returns void, not Set.delete's boolean, so it can be a useEffect cleanup.
  return () => {
    listeners.delete(fn);
  };
}
