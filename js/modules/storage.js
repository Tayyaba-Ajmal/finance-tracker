/**
 * storage.js
 */

const NAMESPACE = "pft"; // Personal Finance Tracker

const key = (name) => `${NAMESPACE}:${name}`;

/**
 * Read a JSON value from localStorage.
 * @param {string} name
 * @param {*} fallback value returned if the key is missing or corrupt
 */
export function read(name, fallback) {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Failed to read "${name}", using fallback.`, err);
    return fallback;
  }
}

/**
 * Persist a JSON-serializable value to localStorage.
 * @param {string} name
 * @param {*} value
 */
export function write(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] Failed to write "${name}".`, err);
    return false;
  }
}

export function remove(name) {
  localStorage.removeItem(key(name));
}

export const STORAGE_KEYS = {
  TRANSACTIONS: "transactions",
  CATEGORIES: "categories",
  THEME: "theme",
  SIDEBAR: "sidebarCollapsed",
};
