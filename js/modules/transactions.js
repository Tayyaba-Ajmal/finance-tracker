/**
 * transactions.js
 */

import { read, write, STORAGE_KEYS } from "./storage.js";
import { generateId, monthKey } from "./utils.js";

let transactions = read(STORAGE_KEYS.TRANSACTIONS, []);

/** Small pub/sub so UI can re-render whenever data changes. */
const listeners = new Set();
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn(transactions));
}

function persist() {
  write(STORAGE_KEYS.TRANSACTIONS, transactions);
  notify();
}

export function getAllTransactions() {
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getTransactionById(id) {
  return transactions.find((t) => t.id === id);
}

/**
 * @param {{type:'income'|'expense', amount:number, category:string, description:string, date:string}} data
 */
export function addTransaction(data) {
  const txn = {
    id: generateId(),
    type: data.type,
    amount: Math.abs(Number(data.amount)),
    category: data.category,
    description: data.description?.trim() || "",
    date: data.date,
    createdAt: new Date().toISOString(),
  };
  transactions = [...transactions, txn];
  persist();
  return txn;
}

export function updateTransaction(id, data) {
  transactions = transactions.map((t) =>
    t.id === id
      ? { ...t, ...data, amount: Math.abs(Number(data.amount ?? t.amount)) }
      : t,
  );
  persist();
}

export function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  persist();
}

export function deleteAllTransactions() {
  transactions = [];
  persist();
}

/* ---------------------------- Derived analytics --------------------------- */

export function getTotals(list = transactions) {
  const income = list
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = list
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

/** Groups totals by YYYY-MM for the last `months` months, oldest first. */
export function getMonthlyBreakdown(months = 6) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys.map((k) => {
    const inMonth = transactions.filter((t) => monthKey(t.date) === k);
    const { income, expense } = getTotals(inMonth);
    return { key: k, income, expense };
  });
}

/** Totals broken down by category, for the given transaction type. */
export function getCategoryBreakdown(type = "expense", list = transactions) {
  const map = new Map();
  list
    .filter((t) => t.type === type)
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
  return [...map.entries()].map(([category, total]) => ({ category, total }));
}

/** Net daily flow for the last `days` days — powers the balance sparkline. */
export function getDailyNetFlow(days = 7) {
  const now = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dayTxns = transactions.filter((t) => t.date === iso);
    const { balance } = getTotals(dayTxns);
    out.push(balance);
  }
  return out;
}

export function getSavingsRate() {
  const { income, expense } = getTotals();
  if (income === 0) return 0;
  return Math.round(((income - expense) / income) * 100);
}
