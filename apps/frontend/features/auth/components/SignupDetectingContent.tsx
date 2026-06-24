"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { api } from "@convex/_generated/api";
import { useAction, useQuery } from "convex/react";

type DetectionSource = {
  repository: string;
  path: string;
  detail: string;
};

type DetectedTechnology = {
  key: string;
  name: string;
  category: string;
  confidence: number;
  score: number;
  sources: DetectionSource[];
};

type RepositorySummary = {
  fullName: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  private: boolean;
  fork: boolean;
  stargazersCount: number;
  updatedAt: string | null;
};

type RepositoryAnalysis = {
  repository: RepositorySummary;
  languages: string[];
  filesRead: string[];
  detectedTechnologyKeys: string[];
  warnings: string[];
};

type AnalysisResult = {
  installationId: number;
  repositoryCount: number;
  analyzedRepositoryCount: number;
  requestCount: number;
  requestLimit: number;
  technologies: DetectedTechnology[];
  repositories: RepositoryAnalysis[];
  warnings: string[];
};

type AnalysisLog = {
  _id: string;
  createdAt: number;
  level: "info" | "warn" | "error";
  message: string;
  repository?: string;
};

type SignupDetectingContentProps = {
  installationId: number | null;
};

type Status = "idle" | "loading" | "done" | "error";

export function SignupDetectingContent({
  installationId,
}: SignupDetectingContentProps) {
  const analyzeRepos = useAction(api.githubAction.analyzeRepos);
  const [runId] = useState(() => crypto.randomUUID());
  const logs = useQuery(api.githubAnalysisLogs.listByRun, { runId });
  const startedInstallationIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>(
    installationId === null ? "error" : "loading",
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(
    installationId === null
      ? "GitHub App の installation_id を受け取れませんでした。"
      : null,
  );

  useEffect(() => {
    if (installationId === null) {
      return;
    }
    if (startedInstallationIdRef.current === installationId) {
      return;
    }
    startedInstallationIdRef.current = installationId;

    let canceled = false;
    setStatus("loading");
    setError(null);
    setResult(null);

    analyzeRepos({ installationId, runId })
      .then((analysis) => {
        if (canceled) {
          return;
        }
        setResult(analysis);
        setStatus("done");
      })
      .catch((unknownError: unknown) => {
        if (canceled) {
          return;
        }
        setError(
          unknownError instanceof Error
            ? unknownError.message
            : "GitHub repository analysis failed.",
        );
        setStatus("error");
      });

    return () => {
      canceled = true;
    };
  }, [analyzeRepos, installationId, runId]);

  return (
    <main className="min-h-svh bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            GitHub App installation #{installationId ?? "-"}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Reading your repositories
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                DBには保存せず、GitHub App の読み取り権限で README 以外の
                source code を読まない allowlist 解析だけを実行しています。
              </p>
            </div>
            <Link
              href="/tech-stack/edit?onboarding=1"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Install again
            </Link>
          </div>
        </header>

        {status === "loading" ? <LoadingState /> : null}
        {status === "error" ? <ErrorState message={error} /> : null}
        <AnalysisLogStream logs={logs ?? []} status={status} />
        {status === "done" && result ? <ResultView result={result} /> : null}
      </div>
    </main>
  );
}

function AnalysisLogStream({
  logs,
  status,
}: {
  logs: AnalysisLog[];
  status: Status;
}) {
  if (logs.length === 0 && status !== "loading") {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Analysis log</h2>
        <span className="text-xs text-muted-foreground">
          {logs.length} events
        </span>
      </div>
      <div className="mt-4 max-h-72 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-5">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log._id} className={getLogLineClassName(log.level)}>
              <span className="text-muted-foreground">
                {formatLogTime(log.createdAt)}
              </span>{" "}
              <span>[{log.level}]</span>{" "}
              {log.repository ? (
                <span className="text-muted-foreground">
                  {log.repository}:{" "}
                </span>
              ) : null}
              <span>{log.message}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Waiting for the first event...</p>
        )}
      </div>
    </section>
  );
}

function getLogLineClassName(level: AnalysisLog["level"]): string {
  if (level === "error") {
    return "text-destructive";
  }
  if (level === "warn") {
    return "text-amber-500";
  }
  return "text-muted-foreground";
}

function formatLogTime(timestamp: number): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

function LoadingState() {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="size-3 animate-pulse rounded-full bg-primary" />
        <p className="text-sm text-muted-foreground">
          GitHub から repository / languages / dependency manifests を読んでいます。
        </p>
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-6">
      <h2 className="text-lg font-semibold">Analysis failed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? "Unknown error"}
      </p>
    </section>
  );
}

function ResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Detected stack</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.analyzedRepositoryCount} / {result.repositoryCount} repositories analyzed
              {" · "}
              {result.requestCount} / {result.requestLimit} GitHub requests
            </p>
          </div>
          <Link
            href="/tech-stack/edit?onboarding=1"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Review stack
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {result.technologies.length > 0 ? (
            result.technologies.map((technology) => (
              <div
                key={technology.key}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="text-sm font-medium">{technology.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {technology.category} · {Math.round(technology.confidence * 100)}%
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              技術スタック候補は見つかりませんでした。
            </p>
          )}
        </div>

        {result.warnings.length > 0 ? (
          <div className="mt-6 rounded-md border border-border bg-background p-4">
            {result.warnings.map((warning) => (
              <p key={warning} className="text-sm text-muted-foreground">
                {warning}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Evidence</h2>
        <div className="mt-4 max-h-[560px] space-y-4 overflow-auto pr-1">
          {result.repositories.map((analysis) => (
            <article
              key={analysis.repository.fullName}
              className="rounded-md border border-border bg-background p-4"
            >
              <a
                href={analysis.repository.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium hover:underline"
              >
                {analysis.repository.fullName}
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                {analysis.languages.slice(0, 4).join(", ") || "No language data"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Read: {analysis.filesRead.join(", ") || "languages only"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.detectedTechnologyKeys.map((key) => (
                  <span
                    key={key}
                    className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
