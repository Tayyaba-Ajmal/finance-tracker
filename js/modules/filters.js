/**
 * filters.js
 */

export const defaultFilters = () => ({
  search: "",
  category: "all",
  type: "all",
  dateFrom: "",
  dateTo: "",
});

export function applyFilters(list, filters) {
  const { search, category, type, dateFrom, dateTo } = filters;
  const term = search.trim().toLowerCase();

  return list.filter((t) => {
    if (
      term &&
      !t.description.toLowerCase().includes(term) &&
      !t.category.toLowerCase().includes(term)
    ) {
      // description or raw category id didn't match; caller resolves category name separately if needed
      if (!(t._categoryName && t._categoryName.toLowerCase().includes(term)))
        return false;
    }
    if (category !== "all" && t.category !== category) return false;
    if (type !== "all" && t.type !== type) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });
}
