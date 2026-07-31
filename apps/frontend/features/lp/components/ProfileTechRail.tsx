"use client";

import { useEffect, useRef } from "react";

import { PROFILE_TECH_RAIL, techLogoSrc } from "../data/showcase";
import styles from "../lp.module.css";

export function ProfileTechRail() {
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      rail.classList.add(styles.profileRailDragging);
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    };
    const stop = () => {
      isDown = false;
      rail.classList.remove(styles.profileRailDragging);
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      rail.scrollLeft = scrollLeft - (x - startX) * 1.4;
    };

    rail.addEventListener("mousedown", onDown);
    rail.addEventListener("mouseleave", stop);
    rail.addEventListener("mouseup", stop);
    rail.addEventListener("mousemove", onMove);

    return () => {
      rail.removeEventListener("mousedown", onDown);
      rail.removeEventListener("mouseleave", stop);
      rail.removeEventListener("mouseup", stop);
      rail.removeEventListener("mousemove", onMove);
    };
  }, []);

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
