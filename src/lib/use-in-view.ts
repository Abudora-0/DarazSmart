"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds `is-visible` to a `.reveal` element the first time it scrolls into
 * view. One observer per element, disconnected as soon as it has fired, so
 * long grids do not keep dozens of live observers around.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "0px 0px -12% 0px"
) {
  const ref = useRef<T>(null);
  // Always starts hidden so the server and the client agree on the markup.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without the API there is nothing to wait for. Reveal the element
    // directly rather than through state, so the server-rendered class list
    // is never contradicted on hydration.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
