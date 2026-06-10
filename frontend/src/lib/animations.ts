/**
 * GSAP animation helpers used across the app.
 * Import these instead of raw GSAP calls to keep animations consistent.
 */

import { gsap } from "gsap";

// ── Page transitions ───────────────────────────────────────────────────────────

export function pageEnter(container: HTMLElement) {
  gsap.fromTo(
    container,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
  );
}

export function pageExit(container: HTMLElement): Promise<void> {
  return new Promise((resolve) =>
    gsap.to(container, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      ease: "power2.in",
      onComplete: resolve,
    })
  );
}

// ── Card stagger reveal ────────────────────────────────────────────────────────

export function staggerCards(selector: string, stagger = 0.07) {
  gsap.fromTo(
    selector,
    { opacity: 0, y: 22, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger,
    }
  );
}

// ── Counter animation ──────────────────────────────────────────────────────────

export function animateCounter(
  element: HTMLElement,
  end: number,
  duration = 1.2,
  decimals = 0
) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: end,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = obj.val.toFixed(decimals);
    },
  });
}

// ── Progress bar fill ──────────────────────────────────────────────────────────

export function animateProgress(element: HTMLElement, percent: number) {
  gsap.fromTo(
    element,
    { width: "0%" },
    { width: `${percent}%`, duration: 1.0, ease: "power2.out" }
  );
}

// ── Sidebar slide-in ───────────────────────────────────────────────────────────

export function sidebarEnter(element: HTMLElement) {
  gsap.fromTo(
    element,
    { x: -60, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
  );
}

// ── Toast / notification pop ───────────────────────────────────────────────────

export function popIn(element: HTMLElement) {
  gsap.fromTo(
    element,
    { scale: 0.85, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
  );
}

// ── Skeleton shimmer (CSS-driven, helper sets class) ──────────────────────────

export function addShimmer(elements: NodeListOf<Element>) {
  elements.forEach((el) => el.classList.add("animate-shimmer"));
}

export function removeShimmer(elements: NodeListOf<Element>) {
  elements.forEach((el) => el.classList.remove("animate-shimmer"));
}

// ── Button hover micro ────────────────────────────────────────────────────────

export function attachButtonHover(button: HTMLElement) {
  button.addEventListener("mouseenter", () =>
    gsap.to(button, { scale: 1.03, duration: 0.18, ease: "power1.out" })
  );
  button.addEventListener("mouseleave", () =>
    gsap.to(button, { scale: 1, duration: 0.18, ease: "power1.in" })
  );
}

// ── Glow pulse on AI response ─────────────────────────────────────────────────

export function glowPulse(element: HTMLElement) {
  gsap
    .timeline()
    .to(element, {
      boxShadow: "0 0 28px rgba(99,102,241,0.45)",
      duration: 0.35,
      ease: "power1.out",
    })
    .to(element, {
      boxShadow: "0 0 0px rgba(99,102,241,0)",
      duration: 0.6,
      ease: "power1.in",
    });
}
