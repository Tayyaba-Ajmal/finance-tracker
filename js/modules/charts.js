/**
 * charts.js
 */

import { getCategoryById } from "./categories.js";
import { monthLabel } from "./utils.js";

const instances = {};

function themeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    text: styles.getPropertyValue("--text-secondary").trim(),
    grid: styles.getPropertyValue("--border-color").trim(),
    mint: styles.getPropertyValue("--accent-mint").trim(),
    coral: styles.getPropertyValue("--accent-coral").trim(),
    indigo: styles.getPropertyValue("--accent-indigo").trim(),
  };
}

function destroy(key) {
  if (instances[key]) {
    instances[key].destroy();
    delete instances[key];
  }
}

/** Doughnut: total income vs total expense. */
export function renderIncomeExpenseChart(canvas, { income, expense }) {
  destroy("incomeExpense");
  const c = themeColors();
  instances.incomeExpense = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: [c.mint, c.coral],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: { duration: 700, easing: "easeOutQuart" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: c.text,
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
            font: { family: "'Inter', sans-serif", size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.label}: $${ctx.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        },
      },
    },
  });
}

/** Line chart: income vs expense over the last N months. */
export function renderMonthlyTrendChart(canvas, monthlyData) {
  destroy("monthlyTrend");
  const c = themeColors();
  instances.monthlyTrend = new Chart(canvas, {
    type: "line",
    data: {
      labels: monthlyData.map((m) => monthLabel(m.key).split(" ")[0]),
      datasets: [
        {
          label: "Income",
          data: monthlyData.map((m) => m.income),
          borderColor: c.mint,
          backgroundColor: "rgba(52,211,153,0.12)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: c.mint,
        },
        {
          label: "Expenses",
          data: monthlyData.map((m) => m.expense),
          borderColor: c.coral,
          backgroundColor: "rgba(248,113,113,0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: c.coral,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: c.text,
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
            font: { family: "'Inter', sans-serif", size: 12 },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: c.text, font: { size: 11 } },
        },
        y: {
          grid: { color: c.grid },
          ticks: {
            color: c.text,
            font: { size: 11 },
            callback: (v) => `$${v}`,
          },
        },
      },
    },
  });
}

/** Horizontal bar: spend by category. */
export function renderCategoryChart(canvas, breakdown) {
  destroy("category");
  const c = themeColors();
  const sorted = [...breakdown].sort((a, b) => b.total - a.total).slice(0, 8);
  instances.category = new Chart(canvas, {
    type: "bar",
    data: {
      labels: sorted.map(
        (b) => getCategoryById(b.category)?.name || b.category,
      ),
      datasets: [
        {
          data: sorted.map((b) => b.total),
          backgroundColor: sorted.map(
            (b) => getCategoryById(b.category)?.color || c.indigo,
          ),
          borderRadius: 6,
          maxBarThickness: 22,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` $${ctx.parsed.x.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: c.text, font: { size: 11 } },
        },
      },
    },
  });
}

export function destroyAllCharts() {
  Object.keys(instances).forEach(destroy);
}
