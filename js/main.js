/*
 * main.js
 */

import * as Storage from "./modules/storage.js";
import * as Txn from "./modules/transactions.js";
import * as Cats from "./modules/categories.js";
import * as Filters from "./modules/filters.js";
import * as UI from "./modules/ui.js";
import * as Charts from "./modules/charts.js";
import { initTheme, toggleTheme, currentTheme } from "./modules/theme.js";
import { showToast } from "./modules/toast.js";
import {
  openModal,
  closeModal,
  bindModalDismiss,
  confirmDialog,
} from "./modules/modal.js";
import { exportToCSV, exportToPDF } from "./modules/exportData.js";
import { hideLoadingScreen, initScrollReveal } from "./modules/loader.js";
import { debounce, todayISO, monthLabel } from "./modules/utils.js";
import { icon } from "./modules/icons.js";

/* ------------------------------- DOM handles ------------------------------ */

const el = (id) => document.getElementById(id);

const shell = el("appShell");
const navItems = document.querySelectorAll(".nav-item[data-page]");
const pages = document.querySelectorAll(".page");

const txnTbody = el("txnTableBody");
const txnEmpty = el("txnEmptyState");
const txnTableWrap = el("txnTableWrap");
const searchInput = el("searchInput");
const filterCategory = el("filterCategory");
const filterType = el("filterType");
const filterDateFrom = el("filterDateFrom");
const filterDateTo = el("filterDateTo");
const clearFiltersBtn = el("clearFiltersBtn");

const txnModal = el("txnModal");
const txnForm = el("txnForm");
const txnModalTitle = el("txnModalTitle");
const categorySelect = el("txnCategory");
const typeRadios = document.querySelectorAll('input[name="txnType"]');

const catModal = el("catModal");
const catForm = el("catForm");
const categoryChipsEl = el("categoryChips");
const swatchPicker = el("swatchPicker");
const swatchInput = el("catColor");

let editingTxnId = null;
let currentFilters = Filters.defaultFilters();

/* --------------------------------- Routing -------------------------------- */

function goToPage(pageName) {
  pages.forEach((p) =>
    p.classList.toggle("is-active", p.dataset.page === pageName),
  );
  navItems.forEach((n) =>
    n.classList.toggle("is-active", n.dataset.page === pageName),
  );
  if (window.innerWidth <= 768) shell.setAttribute("data-sidebar", "closed");

  if (pageName === "reports") renderReportsPage();
  if (pageName === "transactions") renderTransactionsPage();
  if (pageName === "categories") renderCategoriesPage();
  if (pageName === "dashboard") renderDashboard();
}

navItems.forEach((btn) =>
  btn.addEventListener("click", () => goToPage(btn.dataset.page)),
);

/* ------------------------------- Sidebar / nav ----------------------------- */

el("sidebarToggle")?.addEventListener("click", () => {
  const collapsed = shell.getAttribute("data-sidebar") === "collapsed";
  shell.setAttribute("data-sidebar", collapsed ? "expanded" : "collapsed");
});

el("hamburgerBtn")?.addEventListener("click", () => {
  const open = shell.getAttribute("data-sidebar") === "open";
  shell.setAttribute("data-sidebar", open ? "closed" : "open");
});

el("sidebarScrim")?.addEventListener("click", () =>
  shell.setAttribute("data-sidebar", "closed"),
);

/* --------------------------------- Theme ----------------------------------- */

el("themeToggle")?.addEventListener("click", () => {
  toggleTheme();
});

document.addEventListener("themechange", () => {
  // Rebuild any visible charts so their colors pick up the new theme tokens.
  const active = document.querySelector(".page.is-active")?.dataset.page;
  if (active === "dashboard") renderDashboard();
  if (active === "reports") renderReportsPage();
});

/* ------------------------------ Dashboard page ----------------------------- */

function renderDashboard() {
  const dashboardRoot = el("page-dashboard");
  UI.setSkeletonVisible(dashboardRoot, true);

  requestAnimationFrame(() => {
    const all = Txn.getAllTransactions();
    const totals = Txn.getTotals();
    const savingsRate = Txn.getSavingsRate();

    const monthly = Txn.getMonthlyBreakdown(2);
    const thisMonth = monthly[1]?.income - monthly[1]?.expense || 0;
    const lastMonth = monthly[0]?.income - monthly[0]?.expense || 0;
    const delta =
      lastMonth === 0
        ? thisMonth > 0
          ? 100
          : 0
        : ((thisMonth - lastMonth) / Math.abs(lastMonth)) * 100;

    UI.renderStats({ ...totals, savingsRate, prevBalanceDelta: delta });
    UI.renderSparkline(el("balanceSparkline"), Txn.getDailyNetFlow(7));

    UI.renderTransactionTable(el("recentTxnBody"), all.slice(0, 5));
    UI.toggleEmptyState(
      el("recentEmptyState"),
      el("recentTableWrap"),
      all.length === 0,
    );

    if (all.length > 0) {
      Charts.renderIncomeExpenseChart(el("incomeExpenseChart"), totals);
      Charts.renderMonthlyTrendChart(
        el("monthlyTrendChart"),
        Txn.getMonthlyBreakdown(6),
      );
    }
    el("chartsEmptyState").style.display = all.length === 0 ? "flex" : "none";
    el("chartsGrid").style.display = all.length === 0 ? "none" : "grid";

    UI.setSkeletonVisible(dashboardRoot, false);
    initScrollReveal("#page-dashboard .reveal");
  });
}

/* ----------------------------- Transactions page ---------------------------- */

function getVisibleTransactions() {
  const all = Txn.getAllTransactions().map((t) => ({
    ...t,
    _categoryName: Cats.getCategoryById(t.category)?.name || "",
  }));
  return Filters.applyFilters(all, currentFilters);
}

function renderTransactionsPage() {
  UI.populateCategorySelect(filterCategory, "all", currentFilters.category);
  const visible = getVisibleTransactions();
  UI.renderTransactionTable(txnTbody, visible);
  UI.toggleEmptyState(txnEmpty, txnTableWrap, visible.length === 0);
  el("txnCount").textContent =
    `${visible.length} transaction${visible.length === 1 ? "" : "s"}`;
}

searchInput?.addEventListener(
  "input",
  debounce((e) => {
    currentFilters.search = e.target.value;
    renderTransactionsPage();
  }, 250),
);

filterCategory?.addEventListener("change", (e) => {
  currentFilters.category = e.target.value;
  renderTransactionsPage();
});
filterType?.addEventListener("change", (e) => {
  currentFilters.type = e.target.value;
  renderTransactionsPage();
});
filterDateFrom?.addEventListener("change", (e) => {
  currentFilters.dateFrom = e.target.value;
  renderTransactionsPage();
});
filterDateTo?.addEventListener("change", (e) => {
  currentFilters.dateTo = e.target.value;
  renderTransactionsPage();
});
clearFiltersBtn?.addEventListener("click", () => {
  currentFilters = Filters.defaultFilters();
  searchInput.value = "";
  filterDateFrom.value = "";
  filterDateTo.value = "";
  renderTransactionsPage();
});

/* Delegated row actions (edit / delete) for both recent + full tables */
document.addEventListener("click", async (e) => {
  const editBtn = e.target.closest('[data-action="edit"]');
  const delBtn = e.target.closest('[data-action="delete"]');

  if (editBtn) openTxnModal(editBtn.dataset.id);

  if (delBtn) {
    const id = delBtn.dataset.id;
    const txn = Txn.getTransactionById(id);
    const ok = await confirmDialog({
      title: "Delete transaction?",
      message: `This will permanently remove "${txn?.description || "this transaction"}". This can't be undone.`,
      confirmLabel: "Delete",
    });
    if (ok) {
      Txn.deleteTransaction(id);
      showToast("Transaction deleted.", "success");
    }
  }
});

/* --------------------------------- Txn modal -------------------------------- */

function openTxnModal(id = null) {
  editingTxnId = id;
  txnForm.reset();
  document
    .querySelectorAll(".field-error")
    .forEach((n) => (n.textContent = ""));

  const txn = id ? Txn.getTransactionById(id) : null;
  const type = txn?.type || "expense";

  document.querySelector(`input[name="txnType"][value="${type}"]`).checked =
    true;
  UI.populateFormCategorySelect(categorySelect, type, txn?.category);

  txnModalTitle.textContent = txn ? "Edit Transaction" : "Add Transaction";
  el("txnAmount").value = txn?.amount ?? "";
  el("txnDescription").value = txn?.description ?? "";
  el("txnDate").value = txn?.date || todayISO();
  el("txnSubmitBtn").textContent = txn ? "Save Changes" : "Add Transaction";

  openModal(txnModal);
}

typeRadios.forEach((r) =>
  r.addEventListener("change", (e) =>
    UI.populateFormCategorySelect(categorySelect, e.target.value),
  ),
);

el("addTxnBtn")?.addEventListener("click", () => openTxnModal());
el("addTxnBtnEmpty")?.addEventListener("click", () => openTxnModal());
el("addTxnBtnRecentEmpty")?.addEventListener("click", () => openTxnModal());

function validateTxnForm(data) {
  let valid = true;
  const amountErr = el("txnAmountError");
  const dateErr = el("txnDateError");
  const catErr = el("txnCategoryError");

  amountErr.textContent = "";
  dateErr.textContent = "";
  catErr.textContent = "";
  el("txnAmount").classList.remove("has-error");
  el("txnDate").classList.remove("has-error");

  if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
    amountErr.textContent = "Enter an amount greater than 0.";
    el("txnAmount").classList.add("has-error");
    valid = false;
  }
  if (!data.date) {
    dateErr.textContent = "Pick a date.";
    el("txnDate").classList.add("has-error");
    valid = false;
  }
  if (!data.category) {
    catErr.textContent = "Choose a category.";
    valid = false;
  }
  return valid;
}

txnForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    type: document.querySelector('input[name="txnType"]:checked').value,
    amount: el("txnAmount").value,
    category: categorySelect.value,
    description: el("txnDescription").value,
    date: el("txnDate").value,
  };

  if (!validateTxnForm(data)) return;

  if (editingTxnId) {
    Txn.updateTransaction(editingTxnId, data);
    showToast("Transaction updated.", "success");
  } else {
    Txn.addTransaction(data);
    showToast("Transaction added.", "success");
  }

  closeModal(txnModal);
  editingTxnId = null;
});

bindModalDismiss(txnModal);

/* -------------------------------- Categories -------------------------------- */

function renderCategoriesPage() {
  UI.renderCategoryChips(categoryChipsEl, Cats.getCategories("all"));
}

function buildSwatchPicker() {
  swatchPicker.innerHTML = Cats.SWATCHES.map(
    (color, i) =>
      `<button type="button" class="swatch ${i === 0 ? "is-selected" : ""}" data-color="${color}" style="background:${color}" aria-label="Select color ${color}"></button>`,
  ).join("");
  swatchInput.value = Cats.SWATCHES[0];
}
buildSwatchPicker();

swatchPicker?.addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch");
  if (!btn) return;
  swatchPicker
    .querySelectorAll(".swatch")
    .forEach((s) => s.classList.remove("is-selected"));
  btn.classList.add("is-selected");
  swatchInput.value = btn.dataset.color;
});

el("addCategoryBtn")?.addEventListener("click", () => {
  catForm.reset();
  el("catNameError").textContent = "";
  buildSwatchPicker();
  openModal(catModal);
});

catForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = el("catName").value.trim();
  const type = el("catType").value;
  const nameErr = el("catNameError");
  nameErr.textContent = "";

  if (!name) {
    nameErr.textContent = "Give this category a name.";
    return;
  }
  if (Cats.isCategoryNameTaken(name)) {
    nameErr.textContent = "A category with this name already exists.";
    return;
  }

  Cats.addCategory({ name, color: swatchInput.value, type });
  showToast(`Category "${name}" created.`, "success");
  closeModal(catModal);
  renderCategoriesPage();
});

bindModalDismiss(catModal);

categoryChipsEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest('[data-action="delete-category"]');
  if (!btn) return;
  const cat = Cats.getCategoryById(btn.dataset.id);
  const ok = await confirmDialog({
    title: "Delete category?",
    message: `"${cat?.name}" will be removed. Existing transactions keep their category id but it will show as Uncategorized.`,
    confirmLabel: "Delete",
  });
  if (ok) {
    Cats.deleteCategory(btn.dataset.id);
    showToast("Category deleted.", "success");
    renderCategoriesPage();
  }
});

/* ---------------------------------- Reports ---------------------------------- */

function renderReportsPage() {
  const monthly = Txn.getMonthlyBreakdown(6).map((m) => ({
    ...m,
    label: monthLabel(m.key),
  }));
  const hasData = monthly.some((m) => m.income > 0 || m.expense > 0);

  UI.renderMonthlyReportTable(el("reportTableBody"), monthly);
  UI.toggleEmptyState(el("reportEmptyState"), el("reportTableWrap"), !hasData);

  if (hasData) {
    Charts.renderMonthlyTrendChart(
      el("reportTrendChart"),
      Txn.getMonthlyBreakdown(6),
    );
    Charts.renderCategoryChart(
      el("reportCategoryChart"),
      Txn.getCategoryBreakdown("expense"),
    );
  }
  el("reportChartsEmpty").style.display = hasData ? "none" : "flex";
  el("reportChartsGrid").style.display = hasData ? "grid" : "none";
}

/* ----------------------------------- Export ----------------------------------- */

el("exportCsvBtn")?.addEventListener("click", () => {
  const data = Txn.getAllTransactions();
  if (data.length === 0) return showToast("Nothing to export yet.", "info");
  exportToCSV(data);
  showToast("CSV export downloaded.", "success");
});

el("exportPdfBtn")?.addEventListener("click", () => {
  const data = Txn.getAllTransactions();
  if (data.length === 0) return showToast("Nothing to export yet.", "info");
  exportToPDF(data, Txn.getTotals());
  showToast("PDF export downloaded.", "success");
});

/* ----------------------------------- Search UI --------------------------------- */

el("mobileSearchToggle")?.addEventListener("click", () => {
  document.querySelector(".topbar").classList.toggle("search-open");
});

/* ------------------------------------- Boot ------------------------------------- */

function bindReactiveUpdates() {
  Txn.onChange(() => {
    const active =
      document.querySelector(".page.is-active")?.dataset.page || "dashboard";
    if (active === "dashboard") renderDashboard();
    if (active === "transactions") renderTransactionsPage();
    if (active === "reports") renderReportsPage();
  });
}

function seedSampleDataIfEmpty() {
  if (Txn.getAllTransactions().length > 0) return;
  // No sample data injected automatically — the empty states are part of
  // the intended first-run UX. Left here as a documented extension point.
}

function init() {
  initTheme();
  el("txnDate") && (el("txnDate").max = todayISO());
  bindReactiveUpdates();
  seedSampleDataIfEmpty();
  renderDashboard();
  goToPage("dashboard");

  window.addEventListener(
    "resize",
    debounce(() => {
      const active = document.querySelector(".page.is-active")?.dataset.page;
      if (active === "dashboard") renderDashboard();
      if (active === "reports") renderReportsPage();
    }, 300),
  );

  setTimeout(hideLoadingScreen, 500);
}

document.addEventListener("DOMContentLoaded", init);
