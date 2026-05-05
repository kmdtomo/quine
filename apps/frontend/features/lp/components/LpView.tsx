import styles from "../lp.module.css";
import { DiscoverySection } from "./DiscoverySection";
import { FinalCtaSection } from "./FinalCtaSection";
import { HeroSection } from "./HeroSection";
import { LpFooter } from "./LpFooter";
import { LpHeader } from "./LpHeader";
import { ProductSection } from "./ProductSection";
import { ProfileSection } from "./ProfileSection";
import { TechHubSection } from "./TechHubSection";

export function LpView() {
  return (
    <>
      <LpHeader />
      <main className={styles.lp}>
        <HeroSection />
        <ProfileSection />
        <ProductSection />
        <DiscoverySection />
        <TechHubSection />
        <FinalCtaSection />
        <LpFooter />
      </main>
    </>
  );
}
