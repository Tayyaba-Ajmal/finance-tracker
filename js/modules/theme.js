/**
 * theme.js
 */

import { read, write, STORAGE_KEYS } from "./storage.js";

const root = document.documentElement;

function systemPrefersLight() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  );
}

export function initTheme() {
  const saved = read(STORAGE_KEYS.THEME, null);
  const theme = saved || (systemPrefersLight() ? "light" : "dark");
  applyTheme(theme, false);
}

export function applyTheme(theme, persist = true) {
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
  if (persist) write(STORAGE_KEYS.THEME, theme);
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
}

export function toggleTheme() {
  const current =
    root.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}

export function currentTheme() {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}
