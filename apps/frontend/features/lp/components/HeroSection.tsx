"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import styles from "../lp.module.css";
import { useRafScroll } from "../use-raf-scroll";
import { LanguageMarquee } from "./LanguageMarquee";
import { PrismBackground } from "./PrismBackground";
import { RevealOnScroll } from "./RevealOnScroll";

export function HeroSection({ onSignupOpen }: { onSignupOpen: () => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useRafScroll(() => {
    const stage = stageRef.current;
    const bg = stage?.querySelector<HTMLElement>(`.${styles.stageBg}`);
    const inner = innerRef.current;
    if (!stage) return;

    const stageH = stage.offsetHeight || 1;
    const scrollTop = window.scrollY;
    const progress = Math.min(1, Math.max(0, scrollTop / stageH));

    if (bg) {
      bg.style.transform = `translate3d(0, ${scrollTop * 0.28}px, 0)`;
    }
    if (inner) {
      inner.style.transform = `translate3d(0, ${-scrollTop * 0.16}px, 0)`;
      inner.style.opacity = String(Math.max(0, 1 - progress * 1.35));
    }
  }, reducedMotion !== true);

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
