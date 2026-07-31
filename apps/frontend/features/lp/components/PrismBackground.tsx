"use client";

import { useEffect, useRef } from "react";

import { loadCreatePrism } from "@/lib/prism-loader";

import styles from "../lp.module.css";

export function PrismBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    loadCreatePrism()
      .then((createPrism) => {
        if (cancelled) return;
        cleanup = createPrism(el, {
          animationType: "rotate",
          timeScale: 0.5,
          height: 3.5,
          baseWidth: 5.5,
          scale: 3.0,
          hueShift: 0,
          colorFrequency: 1,
          noise: 0,
          glow: 0.7,
          suspendWhenOffscreen: true,
        });
      })
      .catch((err) => {
        console.error("Failed to load prism background", err);
      });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return <div ref={ref} className={styles.stageBg} aria-hidden="true" />;
}
