"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  useMutation,
  usePreloadedQuery,
  useQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { allTechnologies, techStackCategories } from "@data/tech-stack";

import {
  getAnalysisErrorMessage,
  getTechStackErrorMessage,
} from "../tech-stack-error";
import type {
  FilterMode,
  SelectedTechnology,
  SelectedTechnologyGroup,
  ToastState,
} from "../tech-stack-types";
import { TechEditHero } from "./TechEditHero";
import { TechStackBrowsePanel } from "./TechStackBrowsePanel";
import { TechStackEditToast } from "./TechStackEditToast";
import {
  TechStackOnboardingModal,
  type AnalysisResult,
  type ModalPhase,
} from "./TechStackOnboardingModal";

type TechStackEditContentProps = {
  githubAppConnected: boolean;
  githubAppError: string | null;
  githubInstallationId: Id<"githubInstallations"> | null;
  manual: boolean;
  onboarding: boolean;
  preloadedInstallations: Preloaded<typeof api.githubInstallations.listMine>;
  preloadedStack: Preloaded<typeof api.developerTechnologies.listMine>;
  runId: Id<"githubAnalysisRuns"> | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  authorization_failed:
    "GitHub account or installation authorization could not be verified.",
  authorization_start_failed:
    "GitHub authorization could not be started. Check the GitHub App configuration.",
  invalid_oauth_callback:
    "GitHub authorization expired or could not be verified.",
  invalid_setup_callback:
    "GitHub installation response expired or could not be verified.",
  invalid_state: "GitHub did not return a valid installation response.",
  missing_config: "GitHub App is not configured yet.",
  missing_installation: "GitHub did not return an installation id.",
  organization_not_supported:
    "Organization connections require secure renewable authorization. Choose your personal GitHub account for now.",
};

const TOAST_PROMPT_MS = 8000;
const TOAST_SHORT_MS = 2500;
const TOAST_UNDO_MS = 4000;
const TECH_STACK_EDIT_HREF = "/tech-stack/edit";

export function TechStackEditContent({
  githubAppConnected,
  githubAppError,
  githubInstallationId,
  manual,
  onboarding,
  preloadedInstallations,
  preloadedStack,
  runId,
}: TechStackEditContentProps) {
  const router = useRouter();
  const installations = usePreloadedQuery(preloadedInstallations);
  const stack = usePreloadedQuery(preloadedStack);
  const startTechnologyAnalysis = useMutation(
    api.githubAnalysisRuns.startTechnologyAnalysis,
  );
  const retryTechnologyAnalysis = useMutation(
    api.githubAnalysisRuns.retryTechnologyAnalysis,
  );
  const addTechnology = useMutation(api.developerTechnologies.add);
  const completeTechStackOnboarding = useMutation(
    api.users.completeTechStackOnboarding,
  );
  const removeTechnology = useMutation(api.developerTechnologies.remove);
  const setTechnologyYears = useMutation(api.developerTechnologies.setYears);
  const setManyTechnologyYears = useMutation(
    api.developerTechnologies.setManyYears,
  );
  const reorderTechnologies = useMutation(api.developerTechnologies.reorder);

  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(
    techStackCategories[0]?.key ?? "languages",
  );
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const needsTechStackOnboarding =
    stack?.user.techStackOnboardingCompletedAt === undefined;
  const needsProfileOnboarding =
    stack?.user.profileOnboardingCompletedAt === undefined;
  const forcedModalOpen =
    githubAppConnected ||
    githubInstallationId !== null ||
    runId !== null ||
    githubAppError !== null ||
    manual;
  const shouldOpenModal =
    forcedModalOpen || (onboarding && needsTechStackOnboarding) || needsTechStackOnboarding;
  const [modalOpen, setModalOpen] = useState(shouldOpenModal);
  const [manualMode, setManualMode] = useState(manual);
  const [modalError, setModalError] = useState<string | null>(
    githubAppError
      ? ERROR_MESSAGES[githubAppError] ?? ERROR_MESSAGES.invalid_state
      : null,
  );
  const [panelCheckedKeys, setPanelCheckedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [panelYear, setPanelYear] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState>({ mode: "hidden" });

  const startedAnalysisRef = useRef<Id<"githubInstallations"> | null>(
    null,
  );
  const toastTimerRef = useRef<number | null>(null);

  const analysisRun = useQuery(
    api.githubAnalysisRuns.getMine,
    runId === null ? "skip" : { runId },
  );
  const logs = useQuery(
    api.githubAnalysisLogs.listByAnalysisRun,
    modalOpen && runId !== null ? { runId } : "skip",
  );
  const activeInstallations = installations.filter(
    (installation) => installation.status === "active",
  );
  const selectedInstallation =
    activeInstallations.find(
      (installation) => installation._id === githubInstallationId,
    ) ??
    activeInstallations[0] ??
    null;
  const analysisError =
    analysisRun?.status === "failed"
      ? getAnalysisErrorMessage(analysisRun.errorCode)
      : null;
  const modalPhase: ModalPhase = modalError || analysisError
    ? "error"
    : manualMode
      ? "manual"
      : analysisRun?.status === "succeeded"
        ? "done"
        : analysisRun?.status === "queued" ||
            analysisRun?.status === "running"
          ? "scanning"
          : selectedInstallation
            ? "checking"
            : "connect";
  const result: AnalysisResult | null =
    analysisRun?.status === "succeeded" ? analysisRun : null;

  const selectedTechnologies = useMemo<SelectedTechnology[]>(
    () =>
      (stack?.technologies ?? []).map((technology: SelectedTechnology) => ({
        categoryName: technology.categoryName,
        description: technology.description,
        name: technology.name,
        order: technology.order,
        technologyKey: technology.technologyKey,
        ...(technology.years === undefined ? {} : { years: technology.years }),
      })),
    [stack?.technologies],
  );

  const selectedKeys = useMemo(
    () =>
      new Set(
        selectedTechnologies.map((technology) => technology.technologyKey),
      ),
    [selectedTechnologies],
  );

  const activeCategory = techStackCategories.find(
    (category) => category.key === activeCategoryKey,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const visibleTechnologies = useMemo(() => {
    if (normalizedSearch.length > 0) {
      return allTechnologies.filter((technology) => {
        const values = [
          technology.key,
          technology.name,
          ...(technology.aliases ?? []),
        ];
        return values.some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      });
    }

    if (!activeCategory) {
      return allTechnologies;
    }

    const activeKeys = new Set<string>(
      activeCategory.technologies.map((technology) => technology.key),
    );
    return allTechnologies.filter((technology) => activeKeys.has(technology.key));
  }, [activeCategory, normalizedSearch]);

  const groupedSelected = useMemo<SelectedTechnologyGroup[]>(
    () =>
      techStackCategories.flatMap((category) => {
        const categoryKeys = new Set<string>(
          category.technologies.map((technology) => technology.key),
        );
        const items = selectedTechnologies.filter((technology) =>
          categoryKeys.has(technology.technologyKey),
        );
        if (items.length === 0) {
          return [];
        }
        return [{ category, items }];
      }),
    [selectedTechnologies],
  );

  const unsetYearTechnologies = useMemo(
    () =>
      selectedTechnologies.filter(
        (technology) => technology.years === undefined,
      ),
    [selectedTechnologies],
  );

  const emptyTitle = normalizedSearch ? "No technologies found" : "Empty category";
  const emptyText = normalizedSearch
    ? `Nothing matched "${search.trim()}". Try a different keyword.`
    : "This category has no registered technologies.";
  const homeHref = getUserHomeHref(stack?.user.username);
  const profileOnboardingHref = getProfileOnboardingHref(stack?.user.username);

  const showToast = useCallback((nextToast: ToastState, duration: number) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast(nextToast);
    if (nextToast.mode === "hidden" || nextToast.mode === "panel") {
      toastTimerRef.current = null;
      return;
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast({ mode: "hidden" });
      toastTimerRef.current = null;
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ mode: "hidden" });
  }, []);

  const reportMutationError = useCallback((message: string) => {
    setModalError(message);
    setModalOpen(true);
  }, []);

  const runSavedMutation = useCallback(
    async (operation: () => Promise<unknown>, fallbackMessage: string) => {
      try {
        await operation();
      } catch (unknownError: unknown) {
        reportMutationError(
          getTechStackErrorMessage(unknownError, fallbackMessage),
        );
      }
    },
    [reportMutationError],
  );

  const startAnalysis = useCallback(
    (targetInstallationId: Id<"githubInstallations">) => {
      if (startedAnalysisRef.current === targetInstallationId) {
        return;
      }
      startedAnalysisRef.current = targetInstallationId;
      setModalError(null);

      startTechnologyAnalysis({
        githubInstallationId: targetInstallationId,
      })
        .then(({ runId: nextRunId }) => {
          const params = new URLSearchParams();
          params.set("onboarding", "1");
          params.set("github_run", nextRunId);
          router.replace(`${TECH_STACK_EDIT_HREF}?${params.toString()}`);
        })
        .catch((unknownError: unknown) => {
          startedAnalysisRef.current = null;
          setModalError(
            getTechStackErrorMessage(
              unknownError,
              "GitHub repository analysis failed.",
            ),
          );
        });
    },
    [router, startTechnologyAnalysis],
  );

  useEffect(() => {
    if (
      !modalOpen ||
      manualMode ||
      modalError !== null ||
      runId !== null ||
      !selectedInstallation
    ) {
      return;
    }
    startAnalysis(selectedInstallation._id);
  }, [
    manualMode,
    modalError,
    modalOpen,
    runId,
    selectedInstallation,
    startAnalysis,
  ]);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const closeModal = () => {
    void runSavedMutation(async () => {
      await completeTechStackOnboarding({});
      setModalOpen(false);
      if (forcedModalOpen || onboarding) {
        router.replace(TECH_STACK_EDIT_HREF);
      }
    }, "Could not complete onboarding.");
  };

  const handleManualOnboarding = () => {
    setModalError(null);
    setManualMode(true);
  };

  const handleRetryAnalysis = () => {
    setModalError(null);
    setManualMode(false);
    if (runId === null) {
      startedAnalysisRef.current = null;
      return;
    }

    retryTechnologyAnalysis({ runId }).catch(
      (unknownError: unknown) => {
        setModalError(
          getTechStackErrorMessage(
            unknownError,
            "GitHub repository analysis could not be retried.",
          ),
        );
      },
    );
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      setFilterMode("all");
    }
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleFilterModeChange = (mode: FilterMode) => {
    setSearch("");
    setFilterMode(mode);
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategoryKey(categoryKey);
    setFilterMode("all");
    setSearch("");
  };

  const handleAddTechnology = async (technologyKey: string) => {
    if (selectedKeys.has(technologyKey)) {
      return;
    }
    const technology = allTechnologies.find((item) => item.key === technologyKey);
    if (!technology) {
      return;
    }

    await runSavedMutation(
      () => addTechnology({ technologyKey }),
      "Could not add technology.",
    );
    showToast(
      {
        message: `Added ${technology.name}`,
        mode: "prompt",
        tone: "info",
      },
      TOAST_PROMPT_MS,
    );
  };

  const handleRemoveTechnology = async (technologyKey: string) => {
    const removed = selectedTechnologies.find(
      (technology) => technology.technologyKey === technologyKey,
    );
    if (!removed) {
      return;
    }

    await runSavedMutation(
      () => removeTechnology({ technologyKey }),
      "Could not remove technology.",
    );
    showToast(
      {
        message: `Removed ${removed.name}`,
        mode: "undo",
        removed,
      },
      TOAST_UNDO_MS,
    );
  };

  const handleToggleTechnology = (technologyKey: string) => {
    if (selectedKeys.has(technologyKey)) {
      void handleRemoveTechnology(technologyKey);
      return;
    }
    void handleAddTechnology(technologyKey);
  };

  const handleUndoRemove = () => {
    if (toast.mode !== "undo") {
      return;
    }
    const { removed } = toast;
    const nextOrder = [...selectedTechnologies, removed]
      .sort((a, b) => a.order - b.order)
      .map((technology) => technology.technologyKey);

    void runSavedMutation(async () => {
      await addTechnology({ technologyKey: removed.technologyKey });
      if (removed.years !== undefined) {
        await setTechnologyYears({
          technologyKey: removed.technologyKey,
          years: removed.years,
        });
      }
      await reorderTechnologies({ technologyKeys: nextOrder });
    }, "Could not restore technology.");
    showToast(
      {
        message: `Restored ${removed.name}`,
        mode: "prompt",
        tone: "success",
      },
      TOAST_SHORT_MS,
    );
  };

  const handleTechnologyYearsChange = (
    technologyKey: string,
    years: number | null,
  ) => {
    void runSavedMutation(
      () => setTechnologyYears({ technologyKey, years }),
      "Could not update years.",
    );
  };

  const handleReorderTechnologies = (technologyKeys: string[]) => {
    const currentKeys = selectedTechnologies.map(
      (technology) => technology.technologyKey,
    );
    if (currentKeys.join("\n") === technologyKeys.join("\n")) {
      return;
    }

    void runSavedMutation(
      () => reorderTechnologies({ technologyKeys }),
      "Could not reorder technologies.",
    );
  };

  const handleOpenYearPanel = () => {
    const keys = unsetYearTechnologies.map(
      (technology) => technology.technologyKey,
    );
    setPanelCheckedKeys(new Set(keys));
    setPanelYear(null);
    showToast({ mode: "panel" }, 0);
  };

  const handleTogglePanelTechnology = (technologyKey: string) => {
    setPanelCheckedKeys((current) => {
      const next = new Set(current);
      if (next.has(technologyKey)) {
        next.delete(technologyKey);
      } else {
        next.add(technologyKey);
      }
      return next;
    });
  };

  const handleApplyPanelYears = () => {
    if (panelYear === null || panelCheckedKeys.size === 0) {
      return;
    }
    const keys = Array.from(panelCheckedKeys);
    const label = panelYear >= 11 ? "10+ years" : `${panelYear}y`;

    void runSavedMutation(
      () =>
        setManyTechnologyYears({
          technologyKeys: keys,
          years: panelYear,
        }),
      "Could not set years.",
    );
    setPanelCheckedKeys(new Set());
    setPanelYear(null);
    showToast(
      {
        message: `Set ${label} for ${keys.length} ${
          keys.length === 1 ? "tech" : "techs"
        }`,
        mode: "prompt",
        tone: "success",
      },
      TOAST_SHORT_MS,
    );
  };

  return (
    <div className="h-svh overflow-hidden bg-[#1A1A1A] text-white">
      <AppHeader
        activeItem="create"
        guided={
          needsProfileOnboarding &&
          profileOnboardingHref !== TECH_STACK_EDIT_HREF
        }
        guideHref={profileOnboardingHref}
        homeHref={homeHref}
      />

      <main className="relative flex h-svh flex-col overflow-hidden pt-[68px]">
        <div className="relative z-[1] mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4">
          <TechEditHero />

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-5 pb-6">
            <TechStackBrowsePanel
              activeCategoryKey={activeCategoryKey}
              categories={techStackCategories}
              emptyText={emptyText}
              emptyTitle={emptyTitle}
              filterMode={filterMode}
              groupedSelected={groupedSelected}
              onCategoryChange={handleCategoryChange}
              onClearSearch={handleClearSearch}
              onFilterModeChange={handleFilterModeChange}
              onRemoveTechnology={(technologyKey) =>
                void handleRemoveTechnology(technologyKey)
              }
              onReorderTechnologies={handleReorderTechnologies}
              onSearchChange={handleSearchChange}
              onTechnologyYearsChange={handleTechnologyYearsChange}
              onToggleTechnology={handleToggleTechnology}
              search={search}
              selectedKeys={selectedKeys}
              selectedTechnologies={selectedTechnologies}
              technologies={visibleTechnologies}
            />
          </div>
        </div>

        <TechStackEditToast
          onApplyYears={handleApplyPanelYears}
          onHide={hideToast}
          onOpenPanel={handleOpenYearPanel}
          onPanelYearChange={setPanelYear}
          onTogglePanelTechnology={handleTogglePanelTechnology}
          onUndoRemove={handleUndoRemove}
          panelCheckedKeys={panelCheckedKeys}
          panelYear={panelYear}
          toast={toast}
          unsetYearTechnologies={unsetYearTechnologies}
        />
      </main>

      {modalOpen ? (
        <TechStackOnboardingModal
          logs={logs ?? []}
          modalError={modalError ?? analysisError}
          onClose={closeModal}
          onManual={handleManualOnboarding}
          onRetry={handleRetryAnalysis}
          phase={modalPhase}
          result={result}
        />
      ) : null}
    </div>
  );
}

function getUserHomeHref(username: string | undefined) {
  if (!username) {
    return TECH_STACK_EDIT_HREF;
  }

  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  if (!normalizedUsername) {
    return TECH_STACK_EDIT_HREF;
  }

  return `/@${encodeURIComponent(normalizedUsername)}`;
}

function getProfileOnboardingHref(username: string | undefined) {
  const homeHref = getUserHomeHref(username);
  if (homeHref === TECH_STACK_EDIT_HREF) {
    return homeHref;
  }

  return `${homeHref}?onboarding=1`;
}
