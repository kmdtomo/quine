"use client";

import { useEffect, useRef } from "react";

export function useRafScroll(effect: () => void, enabled = true) {
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let animationFrame = 0;

    function apply() {
      animationFrame = 0;
      effectRef.current();
    }

    function handleScroll() {
      if (animationFrame !== 0) {
        return;
      }
      animationFrame = window.requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled]);
}
