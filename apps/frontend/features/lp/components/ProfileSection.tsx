import Image from "next/image";

import { PROFILE_IDENTITY } from "../data/showcase";
import styles from "../lp.module.css";
import { ProfileTechRail } from "./ProfileTechRail";
import { RevealOnView } from "./RevealOnView";

export function ProfileSection() {
  return (
    <section
      id="profile"
      className={`${styles.section} ${styles.feature}`}
    >
      <div className={`${styles.featureInner} ${styles.profileFeatureInner}`}>
        <div className={styles.featureCopy}>
          <RevealOnView>
            <span className={styles.eyebrow}>Profile</span>
          </RevealOnView>
          <RevealOnView delay={90}>
            <h2 className={styles.title}>
              Your stack is
              <br />
              your profile.
            </h2>
          </RevealOnView>
          <RevealOnView delay={180}>
            <p className={styles.lead}>
              Stop writing &ldquo;proficient in React.&rdquo;{" "}
              <strong>Show the stack you ship with</strong> — and let people
              scroll through it.
            </p>
          </RevealOnView>
        </div>

        <div className={styles.profileSide}>
          <RevealOnView>
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
          </RevealOnView>

          <RevealOnView delay={120}>
            <ProfileTechRail />
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
