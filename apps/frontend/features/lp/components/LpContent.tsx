"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useConvexAuth } from "@convex-dev/auth/react";

import styles from "../lp.module.css";
import { DiscoverySection } from "./DiscoverySection";
import { FinalCtaSection } from "./FinalCtaSection";
import { HeroSection } from "./HeroSection";
import { LpFooter } from "./LpFooter";
import { LpHeader } from "./LpHeader";
import { LpSignupModal } from "./LpSignupModal";
import { ProductSection } from "./ProductSection";
import { ProfileSection } from "./ProfileSection";
import { TechHubSection } from "./TechHubSection";

export function LpContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [signupOpen, setSignupOpen] = useState(false);

  function handleSignupIntent() {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.push("/onboarding");
      return;
    }

    setSignupOpen(true);
  }

  return (
    <>
      <LpHeader onSignupOpen={handleSignupIntent} />
      <main className={styles.lp}>
        <HeroSection onSignupOpen={handleSignupIntent} />
        <ProfileSection />
        <ProductSection />
        <DiscoverySection />
        <TechHubSection />
        <FinalCtaSection onSignupOpen={handleSignupIntent} />
        <LpFooter />
      </main>
      <LpSignupModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
      />
    </>
  );
}
