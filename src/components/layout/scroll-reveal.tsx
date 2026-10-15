"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Progressive-enhancement scroll reveal.
 * When JS is active it adds `js-reveal` to <html>, tags content sections inside
 * <main> (skipping anything marked `data-no-animate`) and fades them up as they
 * enter the viewport. Re-scans for streamed / client-navigated content so every
 * page is covered. Without JS nothing is hidden.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );

    let queued = false;
    const scan = () => {
      queued = false;
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("main section, main article, main [data-animate]"),
      ).filter((el) => !el.hasAttribute("data-animate") && !el.hasAttribute("data-no-animate"));
      if (nodes.length === 0) return;
      root.classList.add("js-reveal");
      for (const el of nodes) {
        el.setAttribute("data-animate", "");
        // Anything already on screen shows immediately (no flash); only
        // below-the-fold sections animate in on scroll.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add("in-view");
        } else {
          observer.observe(el);
        }
      }
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(scan);
    };

    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    const t1 = window.setTimeout(scan, 600);
    const t2 = window.setTimeout(scan, 1600);

    return () => {
      mo.disconnect();
      observer.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
