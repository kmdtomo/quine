import Image from "next/image";

import { PRODUCT_SHOWCASE, techLogoSrc } from "../data/showcase";
import styles from "../lp.module.css";
import { RevealOnView } from "./RevealOnView";

const META_ICONS = {
  fork: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M6 9v3a3 3 0 003 3h6a3 3 0 003-3V9" />
    </svg>
  ),
  team: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="9" r="2.5" />
      <circle cx="18" cy="9" r="2.5" />
      <circle cx="12" cy="6" r="2.5" />
      <path d="M2 20v-1a3 3 0 013-3h2a3 3 0 013 3v1" />
      <path d="M14 20v-1a3 3 0 013-3h2a3 3 0 013 3v1" />
    </svg>
  ),
  tag: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
  ),
};

const LINK_ICONS = {
  link: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17.91-.25 1.88-.38 2.84-.39.96.01 1.93.13 2.84.39 2.17-1.47 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.76C23.35 5.58 18.27.5 12 .5z" />
    </svg>
  ),
};

export function ProductSection() {
  const product = PRODUCT_SHOWCASE;

  return (
    <section
      id="product"
      className={`${styles.section} ${styles.feature} ${styles.featureReverse}`}
    >
      <div className={`${styles.featureInner} ${styles.productFeatureInner}`}>
        <div className={`${styles.featureCopy} ${styles.productCopy}`}>
          <RevealOnView>
            <span className={styles.eyebrow}>Product</span>
          </RevealOnView>
          <RevealOnView delay={90}>
            <h2 className={styles.title}>
              Every product is
              <br />
              a stack signature.
            </h2>
          </RevealOnView>
          <RevealOnView delay={180}>
            <p className={styles.lead}>
              Behind every product is a stack &mdash; and that stack{" "}
              <strong>is the story</strong> of how it was built.
            </p>
          </RevealOnView>
        </div>

        <RevealOnView variant="left" className={styles.featureVisual}>
          <div className={styles.productCard}>
            <article className={styles.productDetail}>
              <header className={styles.productHead}>
                <Image
                  className={styles.productIcon}
                  src={product.iconSrc}
                  alt={product.title}
                  width={64}
                  height={64}
                />
                <div className={styles.productTitleWrap}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productTagline}>{product.tagline}</p>
                </div>
              </header>

              <div className={styles.productMeta}>
                {product.badges.map((badge) => (
                  <span key={badge.label} className={styles.productMetaItem}>
                    {META_ICONS[badge.icon]}
                    {badge.label}
                  </span>
                ))}
              </div>

              <div className={styles.productLinks}>
                {product.links.map((link) => (
                  <span key={link.label} className={styles.productLink}>
                    {LINK_ICONS[link.icon]}
                    {link.label}
                  </span>
                ))}
              </div>

              <p className={styles.productDesc}>{product.description}</p>

              <div className={styles.productStacks}>
                {product.stacks.map((stack) => (
                  <span key={stack.key} className={styles.productStack}>
                    <img
                      src={techLogoSrc(stack.key)}
                      alt=""
                      width={16}
                      height={16}
                      loading="lazy"
                      decoding="async"
                    />
                    {stack.name}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </RevealOnView>
      </div>
    </section>
  );
}
