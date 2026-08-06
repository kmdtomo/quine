import Link from "next/link";
import { XIcon } from "lucide-react";

import RotatingText from "@/components/motion/RotatingText";
import { QuineLogo } from "@/components/brand/QuineLogo";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

export type ModalPhase =
  | "checking"
  | "connect"
  | "scanning"
  | "done"
  | "manual"
  | "error";

export type AnalysisLog = {
  _id: string;
  createdAt: number;
  level: "info" | "warn" | "error";
  message: string;
  repository?: string;
};

export type DetectedTechnology = {
  category: string;
  confidence: number;
  key: string;
  name: string;
  score: number;
};

export type AnalysisResult = {
  analyzedRepositoryCount: number;
  repositoryCount: number;
  requestCount: number;
  requestLimit: number;
  technologies: DetectedTechnology[];
};

const MAX_VISIBLE_TECHNOLOGIES = 8;

type TechStackOnboardingModalProps = {
  logs: AnalysisLog[];
  modalError: string | null;
  onClose: () => void;
  onManual: () => void;
  onRetry: () => void;
  phase: ModalPhase;
  result: AnalysisResult | null;
};

export function TechStackOnboardingModal({
  logs,
  modalError,
  onClose,
  onManual,
  onRetry,
  phase,
  result,
}: TechStackOnboardingModalProps) {
  const currentRepository = getCurrentRepository(logs);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[28px] saturate-[1.4]" />
      <section className="relative isolate w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_60%),rgba(22,22,24,0.55)] px-9 py-10 pb-7 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65),0_16px_32px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-[60px] before:absolute before:inset-x-0 before:top-0 before:z-[-1] before:h-3/5 before:rounded-t-3xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] after:absolute after:bottom-[-20%] after:left-1/2 after:z-[-1] after:h-3/5 after:w-[70%] after:-translate-x-1/2 after:bg-[radial-gradient(ellipse_at_center,rgba(7,222,129,0.16),transparent_65%)] after:blur-[30px]">
        {phase === "done" || phase === "manual" ? (
          <button
            type="button"
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Close"
            onClick={onClose}
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}

        <div className="mb-7 flex justify-center">
          <QuineLogo className="h-6 opacity-90" />
        </div>

        {phase === "connect" ? <ConnectState onManual={onManual} /> : null}
        {phase === "checking" ? (
          <ScanningState
            text="GitHub"
          />
        ) : null}
        {phase === "scanning" ? (
          <ScanningState
            text={currentRepository}
          />
        ) : null}
        {phase === "done" ? (
          <DoneState result={result} onClose={onClose} />
        ) : null}
        {phase === "manual" ? <ManualState onClose={onClose} /> : null}
        {phase === "error" ? (
          <ErrorState
            message={modalError ?? "Something went wrong."}
            onManual={onManual}
            onRetry={onRetry}
          />
        ) : null}
      </section>
    </div>
  );
}

function ConnectState({ onManual }: { onManual: () => void }) {
  return (
    <>
      <div className="mb-3 text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
        Read-only access
      </div>
      <h2 className="text-[21px] leading-tight font-bold tracking-[-0.015em] text-white">
        Connect your GitHub
      </h2>
      <p className="mt-3 text-[13px] leading-6 text-white/50">
        Quine reads dependency files to build your tech stack. Repository
        selection happens on GitHub.
      </p>
      <Link
        href="/api/signup/github-app/install"
        prefetch={false}
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
      >
        <GithubIcon />
        Install Quine on GitHub
      </Link>
      <button
        type="button"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        onClick={onManual}
      >
        Skip - add manually
      </button>
    </>
  );
}

function ScanningState({ text }: { text: string }) {
  return (
    <div className="my-12 flex flex-col items-center gap-4">
      <div
        className="size-5 rounded-full border-2 border-white/15 border-t-white/45 motion-safe:animate-spin"
        aria-hidden="true"
      />
      <div className="flex max-w-full items-center justify-center text-lg leading-7 font-medium text-white/70">
        <RotatingText
          texts={[text]}
          mainClassName="max-w-[260px] flex-nowrap justify-center overflow-hidden whitespace-nowrap text-white/70"
          staggerFrom="last"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          staggerDuration={0}
          splitLevelClassName="overflow-hidden"
          elementLevelClassName="inline-block"
          transition={{ duration: 0.18, ease: "easeOut" }}
          splitBy="words"
          auto={false}
          loop={false}
        />
      </div>
    </div>
  );
}

function getCurrentRepository(logs: AnalysisLog[]) {
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const repository = logs[index]?.repository;
    if (repository) {
      return getRepositoryName(repository);
    }
  }

  return "repositories";
}

function getRepositoryName(repository: string) {
  const slashIndex = repository.lastIndexOf("/");
  if (slashIndex === -1 || slashIndex === repository.length - 1) {
    return repository;
  }

  return repository.slice(slashIndex + 1);
}

function DoneState({
  onClose,
  result,
}: {
  onClose: () => void;
  result: AnalysisResult | null;
}) {
  const detectedTechnologies = result?.technologies ?? [];
  const technologies = detectedTechnologies.slice(0, MAX_VISIBLE_TECHNOLOGIES);
  const hasMoreTechnologies = detectedTechnologies.length > technologies.length;

  return (
    <>
      <h2 className="text-[21px] leading-tight font-bold tracking-[-0.015em] text-white">
        We picked these from your repos
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-white/50">
        Adjust your tech stack - and set years of experience for each. Quine
        does not guess years.
      </p>
      <div className="my-6 flex max-h-[112px] flex-wrap justify-center gap-2 overflow-hidden">
        {technologies.map((technology) => (
          <div
            key={technology.key}
            className="inline-flex h-8 max-w-full min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 text-left text-xs font-medium tracking-normal whitespace-nowrap text-white/70"
          >
            <TechnologyLogo
              name={technology.name}
              className="size-4 border-0 bg-transparent"
              imageClassName="size-full"
            />
            <span className="min-w-0 truncate">{technology.name}</span>
          </div>
        ))}
        {hasMoreTechnologies ? (
          <div className="inline-flex h-8 items-center px-1 text-xs font-medium tracking-normal whitespace-nowrap text-white/45">
            ...
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
        onClick={onClose}
      >
        Got it
      </button>
    </>
  );
}

function ManualState({ onClose }: { onClose: () => void }) {
  return (
    <>
      <h2 className="text-[21px] leading-tight font-bold tracking-[-0.015em] text-white">
        Build your tech stack
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-white/50">
        Pick the technologies you ship with - and set years of experience for
        each.
      </p>
      <button
        type="button"
        className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
        onClick={onClose}
      >
        Start editing
      </button>
    </>
  );
}

function ErrorState({
  message,
  onManual,
  onRetry,
}: {
  message: string;
  onManual: () => void;
  onRetry: () => void;
}) {
  return (
    <>
      <h2 className="text-[21px] leading-tight font-bold tracking-[-0.015em] text-white">
        Could not scan GitHub
      </h2>
      <p className="mt-4 text-sm leading-6 text-red-300">{message}</p>
      <button
        type="button"
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
        onClick={onRetry}
      >
        Retry
      </button>
      <button
        type="button"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        onClick={onManual}
      >
        Add manually
      </button>
    </>
  );
}

function GithubIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17.91-.25 1.88-.38 2.84-.39.96.01 1.93.13 2.84.39 2.17-1.47 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.76C23.35 5.58 18.27.5 12 .5z" />
    </svg>
  );
}
