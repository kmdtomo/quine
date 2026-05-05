"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import styles from "../lp.module.css";

type Variant = "default" | "left" | "right" | "fade";

type Props = {
  variant?: Variant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function RevealOnView({
  variant = "default",
  delay,
  className,
  style,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add(styles.isRevealed);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.isRevealed);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantClass =
    variant === "left"
      ? styles.revealLeft
      : variant === "right"
        ? styles.revealRight
        : variant === "fade"
          ? styles.revealFade
          : "";

  const merged = [styles.reveal, variantClass, className]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CSSProperties =
    delay !== undefined
      ? { ...style, "--reveal-delay": `${delay}ms` } as CSSProperties
      : style ?? {};

  return (
    <div ref={ref} className={merged} style={mergedStyle}>
      {children}
    </div>
  );
}
