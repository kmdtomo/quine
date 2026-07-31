import Image from "next/image";

import {
  DISCOVERY_FILTER_CHIPS,
  DISCOVERY_PRODUCTS,
  techLogoSrc,
} from "../data/showcase";
import styles from "../lp.module.css";
import { RevealOnScroll } from "./RevealOnScroll";

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export function DiscoverySection() {
  return (
    <section
      id="discovery"
      className={`${styles.section} ${styles.feature}`}
    >
      <div className={`${styles.featureInner} ${styles.featureStack}`}>
        <div className={`${styles.featureCopy} ${styles.featureCopyCenter}`}>
          <RevealOnScroll>
            <span className={styles.eyebrow}>Discovery</span>
          </RevealOnScroll>
          <RevealOnScroll delay={90}>
            <h2 className={styles.title}>
              Filter by stack.
              <br />
              Find your people.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <p className={styles.lead}>
              Pick the technologies you care about. Quine surfaces the{" "}
              <strong>products built with them</strong> and the{" "}
              <strong>engineers behind them</strong>.
            </p>
          </RevealOnScroll>
        </div>

        <div className={`${styles.featureVisual} ${styles.featureVisualWide}`}>
          <div className={styles.discovery}>
            <RevealOnScroll>
              <div className={styles.discoveryBar}>
                <div className={styles.discoverySearch}>
                  <SearchIcon />
                  <span>Search products</span>
                </div>
                <div className={styles.discoveryChips}>
                  {DISCOVERY_FILTER_CHIPS.map((chip) => (
                    <span key={chip.key} className={styles.discoveryChip}>
                      <img
                        src={techLogoSrc(chip.key)}
                        alt=""
                        width={16}
                        height={16}
                        loading="lazy"
                        decoding="async"
                      />
                      {chip.name}
                      <CloseIcon />
                    </span>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <div className={styles.discoveryGrid}>
              {DISCOVERY_PRODUCTS.map((product, idx) => (
                <RevealOnScroll key={product.title} delay={idx * 90}>
                  <div className={styles.productItem}>
                    <div className={styles.productItemHeader}>
                      <Image
                        src={product.iconSrc}
                        alt={product.title}
                        className={styles.productItemIcon}
                        width={48}
                        height={48}
                      />
                      <div className={styles.productItemInfo}>
                        <div className={styles.productItemTitleRow}>
                          <div className={styles.productItemTitleGroup}>
                            <span className={styles.productItemTitle}>
                              {product.title}
                            </span>
                            <span className={styles.productItemTagSep}>·</span>
                            <span className={styles.productItemTag}>
                              {product.tag}
                            </span>
                          </div>
                          <div className={styles.productItemBadges}>
                            {product.stacks.slice(0, 6).map((stackKey) => (
                              <img
                                key={stackKey}
                                src={techLogoSrc(stackKey)}
                                alt=""
                                className={styles.productItemBadge}
                                width={22}
                                height={22}
                                loading="lazy"
                                decoding="async"
                              />
                            ))}
                            {product.stacks.length > 6 ? (
                              <span className={styles.productItemBadgeMore}>
                                ...
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className={styles.productItemCatch}>
                          {product.catchphrase}
                        </span>
                      </div>
                    </div>
                    <p className={styles.productItemDesc}>
                      {product.description}
                    </p>
                    <div className={styles.productItemAuthor}>
                      <Image
                        src={product.author.avatarSrc}
                        alt=""
                        className={styles.productItemAvatar}
                        width={22}
                        height={22}
                      />
                      <span className={styles.productItemAuthorName}>
                        {product.author.name}
                      </span>
                      <span className={styles.productItemAuthorSep}>·</span>
                      <span className={styles.productItemAuthorMeta}>
                        {product.author.meta}
                      </span>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
