import Image from "next/image";

import { PROFILE_IDENTITY } from "../data/showcase";
import styles from "../lp.module.css";
import { ProfileTechRail } from "./ProfileTechRail";
import { RevealOnScroll } from "./RevealOnScroll";

export function ProfileSection() {
  return (
    <section
      id="profile"
      className={`${styles.section} ${styles.feature}`}
    >
      <div className={`${styles.featureInner} ${styles.profileFeatureInner}`}>
        <div className={styles.featureCopy}>
          <RevealOnScroll>
            <span className={styles.eyebrow}>Profile</span>
          </RevealOnScroll>
          <RevealOnScroll delay={90}>
            <h2 className={styles.title}>
              Your stack is
              <br />
              your profile.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={180}>
            <p className={styles.lead}>
              Stop writing &ldquo;proficient in React.&rdquo;{" "}
              <strong>Show the stack you ship with</strong> — and let people
              scroll through it.
            </p>
          </RevealOnScroll>
        </div>

        <div className={styles.profileSide}>
          <RevealOnScroll>
            <div className={styles.profileIdentity}>
              <div className={styles.profileAvatar}>
                <Image
                  src={PROFILE_IDENTITY.avatarSrc}
                  alt={PROFILE_IDENTITY.name}
                  width={72}
                  height={72}
                />
              </div>
              <div>
                <div className={styles.profileName}>
                  {PROFILE_IDENTITY.name}
                </div>
                <div className={styles.profileHandle}>
                  {PROFILE_IDENTITY.handle} · {PROFILE_IDENTITY.role}
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <ProfileTechRail />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
