import styles from "../lp.module.css";
import { RevealOnView } from "./RevealOnView";

export function FinalCtaSection({ onSignupOpen }: { onSignupOpen: () => void }) {
  return (
    <section className={styles.section}>
      <div className={styles.cta}>
        <RevealOnView>
          <h2 className={styles.ctaTitle}>
            Built in stack.
            <br />
            <span className={styles.ctaTitleAccent}>Found by stack.</span>
          </h2>
        </RevealOnView>
        <RevealOnView delay={90}>
          <p className={styles.ctaSubtitle}>
            Show what you ship. Discover who&rsquo;s shipping it.
          </p>
        </RevealOnView>
        <RevealOnView delay={180}>
          <button
            type="button"
            className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
            onClick={onSignupOpen}
          >
            Get started
          </button>
        </RevealOnView>
        <RevealOnView variant="fade" delay={270}>
          <div className={styles.ctaNote}>
            Free during beta. Sign in with GitHub.
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
