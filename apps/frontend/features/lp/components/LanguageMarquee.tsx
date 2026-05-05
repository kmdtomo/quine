import { MARQUEE_TECHNOLOGIES, techLogoSrc } from "../data/showcase";
import styles from "../lp.module.css";

export function LanguageMarquee() {
  return (
    <section className={styles.marquee} aria-label="Supported technologies">
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeSet}>
            {MARQUEE_TECHNOLOGIES.map((tech) => (
              <img
                key={`a-${tech.key}`}
                className={styles.marqueeIcon}
                src={techLogoSrc(tech.key)}
                alt={tech.name}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <div className={styles.marqueeSet} aria-hidden="true">
            {MARQUEE_TECHNOLOGIES.map((tech) => (
              <img
                key={`b-${tech.key}`}
                className={styles.marqueeIcon}
                src={techLogoSrc(tech.key)}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
