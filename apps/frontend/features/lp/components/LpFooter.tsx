import Image from "next/image";

import styles from "../lp.module.css";

export function LpFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Image
            src="/lp/quine_logo.png"
            alt="Quine"
            width={70}
            height={22}
          />
          <span className={styles.footerCopy}>© 2026 Quine</span>
        </div>
        <nav className={styles.footerNav}>
          <a href="#profile">Profile</a>
          <a href="#product">Product</a>
          <a href="#discovery">Discovery</a>
          <a href="#hub">Hub</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
