"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@convex/_generated/api";
import {
  useAction,
  useMutation,
  usePreloadedQuery,
  useQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { allTechnologies, techStackCategories } from "@data/tech-stack";

import { TechEditHero } from "./TechEditHero";
import { TechStackBrowsePanel } from "./TechStackBrowsePanel";
import { TechStackEditToast } from "./TechStackEditToast";
import {
  TechStackOnboardingModal,
  type AnalysisResult,
  type ModalPhase,
} from "./TechStackOnboardingModal";
import type {
  FilterMode,
  SelectedTechnology,
  SelectedTechnologyGroup,
  ToastState,
} from "./types";

type TechStackEditContentProps = {
  githubAppError: string | null;
  installationId: number | null;
  manual: boolean;
  onboarding: boolean;
  preloadedStack: Preloaded<typeof api.developerTechnologies.listMine>;
};

type InstallationSummary = {
  accountLogin: string;
  accountType: string;
  id: number;
  repositorySelection: string;
  targetType: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "GitHub did not return a valid installation response.",
  missing_config: "GitHub App is not configured yet.",
  missing_installation: "GitHub did not return an installation id.",
};

const TOAST_PROMPT_MS = 8000;
const TOAST_SHORT_MS = 2500;
const TOAST_UNDO_MS = 4000;
const TECH_STACK_EDIT_HREF = "/tech-stack/edit";

export function TechStackEditContent({
  githubAppError,
  installationId,
  manual,
  onboarding,
  preloadedStack,
}: TechStackEditContentProps) {
  const router = useRouter();
  const stack = usePreloadedQuery(preloadedStack);
  const listInstallations = useAction(api.githubAction.listInstallations);
  const analyzeRepos = useAction(api.githubAction.analyzeRepos);
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
    installationId !== null || githubAppError !== null || manual;
  const shouldOpenModal =
    forcedModalOpen || (onboarding && needsTechStackOnboarding) || needsTechStackOnboarding;
  const [modalOpen, setModalOpen] = useState(shouldOpenModal);
  const [modalPhase, setModalPhase] = useState<ModalPhase>(
    manual ? "manual" : githubAppError ? "error" : "checking",
  );
  const [modalError, setModalError] = useState<string | null>(
    githubAppError
      ? ERROR_MESSAGES[githubAppError] ?? ERROR_MESSAGES.invalid_state
      : null,
  );
  const [panelCheckedKeys, setPanelCheckedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [panelYear, setPanelYear] = useState<number | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [runId] = useState(() => crypto.randomUUID());
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState>({ mode: "hidden" });

  const startedAnalysisRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const logs = useQuery(
    api.githubAnalysisLogs.listByRun,
    modalOpen ? { runId } : "skip",
  );

  const selectedTechnologies = useMemo<SelectedTechnology[]>(
    () =>
      (stack?.technologies ?? []).map((technology) => ({
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
  }, [activeCategory?.technologies, normalizedSearch]);

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
    setModalPhase("error");
    setModalOpen(true);
  }, []);

  const runSavedMutation = useCallback(
    async (operation: () => Promise<unknown>, fallbackMessage: string) => {
      try {
        await operation();
      } catch (unknownError: unknown) {
        reportMutationError(
          unknownError instanceof Error ? unknownError.message : fallbackMessage,
        );
      }
    },
    [reportMutationError],
  );

  const startAnalysis = useCallback(
    (targetInstallationId: number) => {
      const analysisKey = `${targetInstallationId}:${runId}`;
      if (startedAnalysisRef.current === analysisKey) {
        return;
      }
      startedAnalysisRef.current = analysisKey;
      setModalPhase("scanning");
      setModalError(null);
      setResult(null);

      analyzeRepos({ installationId: targetInstallationId, runId })
        .then((analysis) => {
          setResult(analysis);
          setModalPhase("done");
        })
        .catch((unknownError: unknown) => {
          setModalError(
            unknownError instanceof Error
              ? unknownError.message
              : "GitHub repository analysis failed.",
          );
          setModalPhase("error");
        });
    },
    [analyzeRepos, runId],
  );

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    if (manual) {
      setModalPhase("manual");
      return;
    }
    if (githubAppError) {
      setModalError(ERROR_MESSAGES[githubAppError] ?? ERROR_MESSAGES.invalid_state);
      setModalPhase("error");
      return;
    }

    const storedInstallationId = stack?.user.githubInstallationId ?? null;
    const targetInstallationId = installationId ?? storedInstallationId;
    if (targetInstallationId !== null) {
      startAnalysis(targetInstallationId);
      return;
    }

    let canceled = false;
    setModalPhase("checking");
    listInstallations({})
      .then((installations: InstallationSummary[]) => {
        if (canceled) {
          return;
        }
        const firstInstallation = installations[0];
        if (!firstInstallation) {
          setModalPhase("connect");
          return;
        }
        startAnalysis(firstInstallation.id);
      })
      .catch((unknownError: unknown) => {
        if (canceled) {
          return;
        }
        setModalError(
          unknownError instanceof Error
            ? unknownError.message
            : "Could not check GitHub App installations.",
        );
        setModalPhase("error");
      });

    return () => {
      canceled = true;
    };
  }, [
    githubAppError,
    installationId,
    listInstallations,
    manual,
    modalOpen,
    stack?.user.githubInstallationId,
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
    setModalPhase("manual");
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
          modalError={modalError}
          onClose={closeModal}
          onManual={handleManualOnboarding}
          onRetry={() => {
            startedAnalysisRef.current = null;
            setModalPhase("checking");
            setModalError(null);
          }}
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
