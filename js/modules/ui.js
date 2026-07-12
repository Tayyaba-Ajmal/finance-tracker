/**
 * ui.js
 */

import { formatCurrency, formatDate, escapeHTML } from "./utils.js";
import { getCategoryById, getCategories } from "./categories.js";
import { icon } from "./icons.js";

/* ------------------------------- Stat cards ------------------------------ */

export function renderStats({
  income,
  expense,
  balance,
  savingsRate,
  prevBalanceDelta,
}) {
  document.getElementById("statBalance").textContent = formatCurrency(balance);
  document.getElementById("statIncome").textContent = formatCurrency(income);
  document.getElementById("statExpense").textContent = formatCurrency(expense);
  document.getElementById("statSavings").textContent = `${savingsRate}%`;

  const deltaEl = document.getElementById("statBalanceDelta");
  if (deltaEl) {
    const up = prevBalanceDelta >= 0;
    deltaEl.className = `stat-delta ${up ? "is-up" : "is-down"}`;
    deltaEl.innerHTML = `${icon(up ? "trendUp" : "trendDown")} ${up ? "+" : ""}${prevBalanceDelta.toFixed(1)}% vs last month`;
  }
}

/** Draws the mini SVG sparkline inside the balance card. */
export function renderSparkline(svgEl, values) {
  if (!svgEl) return;
  const w = 280;
  const h = 48;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const step = w / (values.length - 1 || 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return [x, y];
  });

  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];

  svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svgEl.innerHTML = `
    <path class="spark-line" d="${d}" fill="none" stroke="var(--accent-mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="var(--accent-mint)" />
  `;
}

/* ----------------------------- Transaction table -------------------------- */

function categoryChipHTML(categoryId) {
  const cat = getCategoryById(categoryId);
  const name = cat ? cat.name : "Uncategorized";
  const color = cat ? cat.color : "#9ba3b4";
  return `<span class="txn-cat" style="background:${color}22;color:${color}"><span class="dot" style="background:${color}"></span>${escapeHTML(name)}</span>`;
}

export function renderTransactionTable(tbodyEl, transactions) {
  if (!tbodyEl) return;

  if (transactions.length === 0) {
    tbodyEl.innerHTML = "";
    return;
  }

  tbodyEl.innerHTML = transactions
    .map(
      (t) => `
      <tr data-id="${t.id}">
        <td data-label="Date">${formatDate(t.date)}</td>
        <td data-label="Description">${escapeHTML(t.description) || '<span style="color:var(--text-tertiary)">No description</span>'}</td>
        <td data-label="Category">${categoryChipHTML(t.category)}</td>
        <td data-label="Type" style="text-transform:capitalize">${t.type}</td>
        <td data-label="Amount" class="cell-amount ${t.type === "income" ? "is-income" : "is-expense"}">
          ${t.type === "income" ? "+" : "−"}${formatCurrency(t.amount)}
        </td>
        <td data-label="Actions">
          <div class="row-actions">
            <button class="btn-icon" data-action="edit" data-id="${t.id}" aria-label="Edit transaction">${icon("edit")}</button>
            <button class="btn-icon" data-action="delete" data-id="${t.id}" aria-label="Delete transaction">${icon("trash")}</button>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");
}

export function toggleEmptyState(emptyEl, tableWrapEl, isEmpty) {
  if (!emptyEl || !tableWrapEl) return;
  emptyEl.style.display = isEmpty ? "flex" : "none";
  tableWrapEl.style.display = isEmpty ? "none" : "block";
}

/* -------------------------------- Categories ------------------------------ */

export function renderCategoryChips(containerEl, categories) {
  if (!containerEl) return;
  containerEl.innerHTML = categories
    .map(
      (c) => `
      <div class="category-chip" data-id="${c.id}">
        <span class="dot" style="background:${c.color}"></span>
        <span class="chip-name">${escapeHTML(c.name)}</span>
        ${c.isDefault ? "" : `<button data-action="delete-category" data-id="${c.id}" aria-label="Delete ${escapeHTML(c.name)} category">${icon("trash")}</button>`}
      </div>
    `,
    )
    .join("");
}

/** Populates a <select> with categories, optionally filtered by transaction type. */
export function populateCategorySelect(
  selectEl,
  type = "all",
  selectedId = "",
) {
  if (!selectEl) return;
  const cats = type === "all" ? getCategories("all") : getCategories(type);
  const options = ['<option value="all">All categories</option>'];
  cats.forEach((c) => {
    options.push(
      `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${escapeHTML(c.name)}</option>`,
    );
  });
  selectEl.innerHTML = options.join("");
}

export function populateFormCategorySelect(selectEl, type, selectedId = "") {
  if (!selectEl) return;
  const cats = getCategories(type);
  selectEl.innerHTML = cats
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${escapeHTML(c.name)}</option>`,
    )
    .join("");
}

/* --------------------------------- Skeletons ------------------------------ */

export function setSkeletonVisible(root, visible) {
  const skeletons = root.querySelectorAll("[data-skeleton]");
  const real = root.querySelectorAll("[data-real]");
  skeletons.forEach((el) => (el.style.display = visible ? "" : "none"));
  real.forEach((el) => (el.style.display = visible ? "none" : ""));
}

/* ---------------------------------- Reports -------------------------------- */

export function renderMonthlyReportTable(tbodyEl, monthlyData) {
  if (!tbodyEl) return;
  if (monthlyData.every((m) => m.income === 0 && m.expense === 0)) {
    tbodyEl.innerHTML = "";
    return;
  }
  tbodyEl.innerHTML = monthlyData
    .slice()
    .reverse()
    .map((m) => {
      const net = m.income - m.expense;
      return `
      <tr>
        <td data-label="Month">${m.label}</td>
        <td data-label="Income" class="cell-amount is-income">${formatCurrency(m.income)}</td>
        <td data-label="Expenses" class="cell-amount is-expense">${formatCurrency(m.expense)}</td>
        <td data-label="Net" class="cell-amount ${net >= 0 ? "is-income" : "is-expense"}">${formatCurrency(net)}</td>
      </tr>`;
    })
    .join("");
}
