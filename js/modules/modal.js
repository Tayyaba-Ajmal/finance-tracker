/**
 * modal.js
 */

let lastFocused = null;

export function openModal(overlayEl) {
  lastFocused = document.activeElement;
  overlayEl.classList.add("is-open");
  overlayEl.setAttribute("aria-hidden", "false");
  const focusTarget =
    overlayEl.querySelector("[data-autofocus]") ||
    overlayEl.querySelector("input, select, textarea, button");
  focusTarget?.focus();
  document.addEventListener("keydown", onKeydown);
}

export function closeModal(overlayEl) {
  overlayEl.classList.remove("is-open");
  overlayEl.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", onKeydown);
  lastFocused?.focus();
}

function onKeydown(e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.is-open").forEach(closeModal);
  }
}

/** Wires up click-outside-to-close and [data-close] buttons for a modal overlay. */
export function bindModalDismiss(overlayEl) {
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl || e.target.closest("[data-close]")) {
      closeModal(overlayEl);
    }
  });
}

/**
 * Shows the shared confirmation modal and resolves true/false based on
 * the user's choice.
 * @param {{title:string, message:string, confirmLabel?:string, danger?:boolean}} opts
 */
export function confirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = true,
}) {
  const overlay = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const msgEl = document.getElementById("confirmMessage");
  const confirmBtn = document.getElementById("confirmActionBtn");

  titleEl.textContent = title;
  msgEl.textContent = message;
  confirmBtn.textContent = confirmLabel;
  confirmBtn.className = danger ? "btn btn-danger" : "btn btn-primary";

  openModal(overlay);

  return new Promise((resolve) => {
    const cleanup = (result) => {
      confirmBtn.removeEventListener("click", onConfirm);
      overlay.removeEventListener("click", onOverlay);
      closeModal(overlay);
      resolve(result);
    };
    const onConfirm = () => cleanup(true);
    const onOverlay = (e) => {
      if (e.target === overlay || e.target.closest("[data-close]"))
        cleanup(false);
    };
    confirmBtn.addEventListener("click", onConfirm);
    overlay.addEventListener("click", onOverlay);
  });
}
