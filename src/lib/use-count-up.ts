"use client";

import { useEffect, useRef, useState } from "react";
import { useClientValue } from "@/lib/use-client-value";

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates a number from its previous value to `value`.
 *
 * Seeds from the real value rather than zero, and lands on the target even
 * when requestAnimationFrame never fires, because a paused animation (a
 * background tab, reduced motion) used to leave the cart total at Rs. 0.
 */
export function useCountUp(value: number, duration = 500): number {
  const reduced = useClientValue(readReducedMotion, false);
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to || reduced) {
      fromRef.current = to;
      return;
    }

    const start = performance.now();
    let finished = false;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finished = true;
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    // rAF is paused in a background tab, so without this the number can sit
    // at its starting point indefinitely. Land on the target either way.
    const failsafe = window.setTimeout(() => {
      if (finished) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
      setDisplay(to);
    }, duration + 120);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(failsafe);
      fromRef.current = to;
    };
  }, [value, duration, reduced]);

  // Under reduced motion the effect never animates, so read the real value
  // straight through rather than whatever `display` was last set to.
  return reduced ? value : display;
}
