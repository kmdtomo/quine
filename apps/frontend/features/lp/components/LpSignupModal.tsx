"use client";

import Image from "next/image";

import { useAuthActions } from "@convex-dev/auth/react";

import { GlassModal } from "@/components/glass-modal";

type LpSignupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LpSignupModal({ open, onOpenChange }: LpSignupModalProps) {
  const { signIn } = useAuthActions();

  return (
    <GlassModal
      open={open}
      onOpenChange={onOpenChange}
      titleId="signup-modal-title"
    >
      <div className="mb-7 flex justify-center">
        <Image
          src="/lp/quine_logo.png"
          alt="Quine"
          width={120}
          height={24}
          className="h-6 w-auto opacity-90"
        />
      </div>

      <h2
        className="text-2xl font-bold tracking-tight"
        id="signup-modal-title"
      >
        Welcome to Quine
      </h2>
      <p className="mt-2 text-sm text-white/50">
        Sign in or create your account
      </p>

      <button
        type="button"
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
        onClick={() =>
          void signIn("github", {
            redirectTo: "/onboarding",
          })
        }
      >
        <GithubIcon />
        Continue with GitHub
      </button>

      <p className="mt-5 text-center text-[11px] leading-5 text-white/40">
        By continuing, you agree to our{" "}
        <a className="text-white/65" href="#">
          Terms
        </a>{" "}
        and{" "}
        <a className="text-white/65" href="#">
          Privacy Policy
        </a>
        .
      </p>
    </GlassModal>
  );
}

function GithubIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17.91-.25 1.88-.38 2.84-.39.96.01 1.93.13 2.84.39 2.17-1.47 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.76C23.35 5.58 18.27.5 12 .5z" />
    </svg>
  );
}
