import { HUB_SHOWCASE, techLogoSrc } from "../data/showcase";
import styles from "../lp.module.css";
import { RevealOnView } from "./RevealOnView";

const ORBIT_CLASSES = [
  styles.hubOrbit1,
  styles.hubOrbit2,
  styles.hubOrbit3,
  styles.hubOrbit4,
  styles.hubOrbit5,
  styles.hubOrbit6,
];

export function TechHubSection() {
  const hub = HUB_SHOWCASE;

  return (
    <section id="hub" className={`${styles.section} ${styles.feature}`}>
      <div className={styles.featureInner}>
        <div className={styles.featureCopy}>
          <RevealOnView>
            <span className={styles.eyebrow}>Hub</span>
          </RevealOnView>
          <RevealOnView delay={90}>
            <h2 className={styles.title}>
              Every technology
              <br />
              has a home.
            </h2>
          </RevealOnView>
          <RevealOnView delay={180}>
            <p className={styles.lead}>
              Tap any logo. Meet the{" "}
              <strong>products built with it</strong> and the{" "}
              <strong>engineers shipping them</strong>. Each stack is its own
              community page.
            </p>
          </RevealOnView>
        </div>

        <div className={styles.featureVisual}>
          <RevealOnView variant="right">
            <div className={styles.hub}>
              <div className={styles.hubHalo}>
                {hub.orbitKeys.slice(0, 6).map((key, idx) => (
                  <span
                    key={key}
                    className={`${styles.hubOrbit} ${ORBIT_CLASSES[idx]}`}
                  >
                    <img
                      src={techLogoSrc(key)}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                ))}

                <div className={styles.hubCore}>
                  <img
                    src={techLogoSrc(hub.centerKey)}
                    alt={hub.centerName}
                    width={64}
                    height={64}
                  />
                </div>
              </div>

              <div className={styles.hubCaption}>
                <div className={styles.hubName}>{hub.centerName}</div>
                <div className={styles.hubMeta}>
                  <span>
                    <strong>{hub.productCount}</strong> products
                  </span>
                  <span className={styles.hubMetaSep} />
                  <span>
                    <strong>{hub.engineerCount}</strong> engineers
                  </span>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
