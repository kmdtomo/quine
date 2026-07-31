import styles from "../lp.module.css";
import { RevealOnScroll } from "./RevealOnScroll";

export function FinalCtaSection({ onSignupOpen }: { onSignupOpen: () => void }) {
  return (
    <section className={styles.section}>
      <div className={styles.cta}>
        <RevealOnScroll>
          <h2 className={styles.ctaTitle}>
            Built in stack.
            <br />
            <span className={styles.ctaTitleAccent}>Found by stack.</span>
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={90}>
          <p className={styles.ctaSubtitle}>
            Show what you ship. Discover who&rsquo;s shipping it.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={180}>
          <button
            type="button"
            className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
            onClick={onSignupOpen}
          >
            Get started
          </button>
        </RevealOnScroll>
        <RevealOnScroll variant="fade" delay={270}>
          <div className={styles.ctaNote}>
            Free during beta. Sign in with GitHub.
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
