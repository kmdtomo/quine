"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "../auth.module.css";

const APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
const INSTALL_URL = APP_SLUG
  ? `https://github.com/apps/${APP_SLUG}/installations/new?state=signup`
  : "/signup/detecting?demo=1";

export function SignupGithubAppContent() {
  return (
    <div className={styles.shell}>
      <div className={styles.bg} aria-hidden />
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.brand}>
            <Image
              src="/lp/quine_logo.png"
              alt="Quine"
              width={120}
              height={24}
              priority
            />
          </div>

          <div className={styles.badgeWrap}>
            <span className={styles.badge}>
              <LockIcon />
              Read-only access
            </span>
          </div>

          <h1 className={styles.title}>Connect your GitHub</h1>
          <p className={styles.subtitle}>
            Quine reads your README and dependency files to auto-build your
            tech stack. Your source code is never touched.
          </p>

          <p className={styles.permsLabel}>What Quine accesses</p>
          <div className={styles.perms}>
            <span className={`${styles.permChip} ${styles.permChipOk}`}>
              <CheckIcon />
              README
            </span>
            <span className={`${styles.permChip} ${styles.permChipOk}`}>
              <CheckIcon />
              Dependencies
            </span>
            <span className={`${styles.permChip} ${styles.permChipNo}`}>
              <CrossIcon />
              Source code
            </span>
            <span className={`${styles.permChip} ${styles.permChipNo}`}>
              <CrossIcon />
              Write access
            </span>
          </div>

          <div className={styles.action}>
            <a
              href={INSTALL_URL}
              className={`${styles.btn} ${styles.btnGithub}`}
            >
              <GithubIcon />
              <span>Install Quine on GitHub</span>
            </a>
            <Link
              href="/signup/tech-stack?manual=1"
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              Skip — add manually
            </Link>
          </div>

          <p className={styles.note}>
            Read-only by GitHub App permissions — writing back is physically
            impossible.
            <br />
            You can revoke access anytime in{" "}
            <Link href="/settings">Settings</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17.91-.25 1.88-.38 2.84-.39.96.01 1.93.13 2.84.39 2.17-1.47 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.76C23.35 5.58 18.27.5 12 .5z" />
    </svg>
  );
}
