/**
 * toast.js
 */

import { icon } from "./icons.js";
import { escapeHTML } from "./utils.js";

let stackEl = null;

function getStack() {
  if (!stackEl) stackEl = document.getElementById("toastStack");
  return stackEl;
}

const ICON_BY_TYPE = { success: "check", error: "alert", info: "info" };

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms before auto-dismiss
 */
export function showToast(message, type = "info", duration = 3800) {
  const stack = getStack();
  if (!stack) return;

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.setAttribute("role", "status");
  el.innerHTML = `
    ${icon(ICON_BY_TYPE[type] || "info", "toast-icon")}
    <span class="toast-msg">${escapeHTML(message)}</span>
    <button class="toast-close" aria-label="Dismiss notification">${icon("close")}</button>
  `;

  const remove = () => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 200);
  };

  el.querySelector(".toast-close").addEventListener("click", remove);
  const timer = setTimeout(remove, duration);
  el.addEventListener("mouseenter", () => clearTimeout(timer));

  stack.appendChild(el);
}
