/**
 * categories.js
 * Manages the default + user-created transaction categories.
 */

import { read, write, STORAGE_KEYS } from "./storage.js";
import { generateId } from "./utils.js";

const DEFAULT_CATEGORIES = [
  {
    id: "cat-salary",
    name: "Salary",
    color: "#34d399",
    type: "income",
    isDefault: true,
  },
  {
    id: "cat-freelance",
    name: "Freelance",
    color: "#38bdf8",
    type: "income",
    isDefault: true,
  },
  {
    id: "cat-investing",
    name: "Investments",
    color: "#818cf8",
    type: "income",
    isDefault: true,
  },
  {
    id: "cat-food",
    name: "Food & Dining",
    color: "#fb923c",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-transport",
    name: "Transport",
    color: "#facc15",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-housing",
    name: "Housing",
    color: "#a78bfa",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-utilities",
    name: "Utilities",
    color: "#22d3ee",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-shopping",
    name: "Shopping",
    color: "#f472b6",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-health",
    name: "Health",
    color: "#4ade80",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-entertainment",
    name: "Entertainment",
    color: "#f87171",
    type: "expense",
    isDefault: true,
  },
  {
    id: "cat-other",
    name: "Other",
    color: "#9ba3b4",
    type: "both",
    isDefault: true,
  },
];

export const SWATCHES = [
  "#34d399",
  "#818cf8",
  "#f87171",
  "#fbbf24",
  "#38bdf8",
  "#f472b6",
  "#a78bfa",
  "#22d3ee",
  "#fb923c",
  "#4ade80",
];

let categories = read(STORAGE_KEYS.CATEGORIES, null) || DEFAULT_CATEGORIES;
if (!read(STORAGE_KEYS.CATEGORIES, null))
  write(STORAGE_KEYS.CATEGORIES, categories);

export function getCategories(type = "all") {
  if (type === "all") return categories;
  return categories.filter((c) => c.type === type || c.type === "both");
}

export function getCategoryById(id) {
  return categories.find((c) => c.id === id);
}

export function addCategory({ name, color, type }) {
  const cat = {
    id: generateId(),
    name: name.trim(),
    color,
    type,
    isDefault: false,
  };
  categories = [...categories, cat];
  write(STORAGE_KEYS.CATEGORIES, categories);
  return cat;
}

export function deleteCategory(id) {
  categories = categories.filter((c) => c.id !== id);
  write(STORAGE_KEYS.CATEGORIES, categories);
}

export function isCategoryNameTaken(name) {
  return categories.some(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
}
