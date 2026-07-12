/**
 * exportData.js
 * Client-side export of the transaction list to CSV or JSON.
 *
 */

import { getCategoryById } from "./categories.js";

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportToCSV(transactions) {
  const headers = ["Date", "Type", "Category", "Description", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    getCategoryById(t.category)?.name || t.category,
    t.description,
    t.amount.toFixed(2),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");
  downloadBlob(
    csv,
    `transactions-${Date.now()}.csv`,
    "text/csv;charset=utf-8;",
  );
}

/**
 * Generates a clean, printable PDF report: a title, a summary line
 * (income / expenses / net), and a full transaction table.
 * Uses jsPDF + the autotable plugin, both loaded globally via CDN
 * in index.html (see window.jspdf.jsPDF).
 */
export function exportToPDF(transactions, totals = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const income =
    totals.income ??
    transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
  const expense =
    totals.expense ??
    transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CashTrack — Transaction Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 25);

  // Summary line
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(`Total Income: $${income.toFixed(2)}`, 14, 36);
  doc.text(`Total Expenses: $${expense.toFixed(2)}`, 80, 36);
  doc.text(`Net Balance: $${balance.toFixed(2)}`, 150, 36);

  // Transaction table
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    getCategoryById(t.category)?.name || t.category,
    t.description || "—",
    `${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: 44,
    head: [["Date", "Type", "Category", "Description", "Amount"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [23, 27, 38], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 246, 249] },
    columnStyles: { 4: { halign: "right" } },
  });

  doc.save(`transactions-${Date.now()}.pdf`);
}
