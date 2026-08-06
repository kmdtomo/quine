"use client";

import { PROFILE_TECH_RAIL, techLogoSrc } from "../data/showcase";
import styles from "../lp.module.css";
import { useDragScroll } from "../use-drag-scroll";

export function ProfileTechRail() {
  const railRef = useDragScroll<HTMLDivElement>({
    draggingClassName: styles.profileRailDragging,
    speed: 1.4,
  });

  return (
    <div ref={railRef} className={styles.profileRail}>
      <div className={styles.profileRailTrack}>
        {PROFILE_TECH_RAIL.map((tech) => (
          <div key={tech.key} className={styles.techItemWrapper}>
            <div className={styles.techItem}>
              <div className={styles.techItemBg} aria-hidden="true" />
              <div className={styles.techItemLogoWrapper}>
                <img
                  src={techLogoSrc(tech.key)}
                  alt={tech.name}
                  className={styles.techItemLogo}
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.techItemNameWrapper}>
                <span className={styles.techItemName}>{tech.name}</span>
              </div>
            </div>
            <div className={styles.techItemYears}>{tech.years} year</div>
          </div>
        ))}
      </div>
    </div>
  );
}
