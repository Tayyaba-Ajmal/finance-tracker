/**
 * icons.js
 */

export const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  transactions: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
  categories:
    '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>',
  reports: '<path d="M4 20V10M11 20V4M18 20v-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  wallet:
    '<path d="M21 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h17a1 1 0 0 0 1-1v-4"/><path d="M2 9V6a2 2 0 0 1 2-2h13"/><circle cx="17" cy="13" r="1.5"/>',
  trendUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  trendDown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  piggy:
    '<path d="M19 9V6a1 1 0 0 0-1-1h-1a3 3 0 0 0-3-2c-1.5 0-2.7 1-3 2.2-3.4.4-6 3-6 6.3v1c-1 .3-2 1.2-2 2.5s1 2.2 2 2.5v1.5a2 2 0 0 0 2 2h2v-2h3v2h3v-2c1.7-.5 3-2 3-3.9V11h1a1 1 0 0 0 1-1V9Z"/><circle cx="16" cy="11" r=".6" fill="currentColor" stroke="none"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  filter: '<path d="M4 4h16l-6.5 8v6l-3 2v-8Z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  alert:
    '<path d="M12 9v4"/><circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5"/><circle cx="12" cy="8" r=".6" fill="currentColor" stroke="none"/>',
  empty:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
};

/** Returns a full <svg> string for the given icon key.  */
export function icon(name, extraClass = "") {
  const body = ICONS[name] || "";
  return `<svg class="${extraClass}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
