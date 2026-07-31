"use client";

import { useEffect, useRef } from "react";

import styles from "../lp.module.css";
import { LanguageMarquee } from "./LanguageMarquee";
import { PrismBackground } from "./PrismBackground";
import { RevealOnScroll } from "./RevealOnScroll";

export function HeroSection({ onSignupOpen }: { onSignupOpen: () => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const bg = stage?.querySelector<HTMLElement>(`.${styles.stageBg}`);
    const inner = innerRef.current;
    if (!stage) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const stageH = stage.offsetHeight || 1;
      const scrollTop = window.scrollY;
      const p = Math.min(1, Math.max(0, scrollTop / stageH));

      if (bg) {
        bg.style.transform = `translate3d(0, ${scrollTop * 0.28}px, 0)`;
      }
      if (inner) {
        inner.style.transform = `translate3d(0, ${-scrollTop * 0.16}px, 0)`;
        inner.style.opacity = String(Math.max(0, 1 - p * 1.35));
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage}>
      <PrismBackground />
      <div className={styles.stageVeil} aria-hidden="true" />

      <section className={styles.hero}>
        <div ref={innerRef} className={styles.heroInner}>
          <RevealOnScroll delay={200}>
            <h1 className={styles.heroTitle}>
              Built in stack.
              <br />
              Found by stack.
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={360}>
            <p className={styles.heroSubtitle}>
              Show what you ship. Discover who&rsquo;s shipping it.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={520}>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                onClick={onSignupOpen}
              >
                Get started
              </button>
              <a
                href="#profile"
                className={`${styles.heroBtn} ${styles.heroBtnGhost}`}
              >
                See how it works
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <RevealOnScroll variant="fade" delay={720}>
        <LanguageMarquee />
      </RevealOnScroll>
    </div>
  );
}
