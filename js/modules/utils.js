/**
 * utils.js
 */

/** Generates a reasonably unique id without external libraries. */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Formats a number as USD-style currency (adapts to browser locale). */
export function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formats an ISO date string as "Jan 4, 2026". */
export function formatDate(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Returns YYYY-MM-DD for <input type="date"> defaults. */
export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

/** Returns "2026-01" style month key for grouping. */
export function monthKey(isoDate) {
  return isoDate.slice(0, 7);
}

/** Debounce: delays invoking fn until `wait` ms after the last call. */
export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Clamp a number between min and max. */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/** Escapes user text before it is ever placed in innerHTML. */
export function escapeHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Human readable relative month label, e.g. "March 2026". */
export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
