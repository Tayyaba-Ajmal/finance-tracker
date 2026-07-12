/**
 * loader.js
 */

export function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (!screen) return;
  screen.classList.add("is-hidden");
  setTimeout(() => screen.remove(), 600);
}

/** Applies the .reveal / .is-visible scroll-in effect to a set of elements. */
export function initScrollReveal(selector = ".reveal") {
  const els = document.querySelectorAll(selector);
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  els.forEach((el) => observer.observe(el));
}
