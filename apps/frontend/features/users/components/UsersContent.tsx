"use client";

import { useMemo, useRef, useState } from "react";

import { api } from "@convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";

import {
  getTechnologyByKey,
  type TechnologyKey,
} from "@data/tech-stack";

import { AppHeader } from "@/components/app/AppHeader";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

import { UsersFilterSection } from "./UsersFilterSection";
import { UsersGridSection } from "./UsersGridSection";
import { UsersHeroSection } from "./UsersHeroSection";
import { UsersTechFilterDialog } from "./UsersTechFilterDialog";

const ALL_ROLES = "all";

type UsersContentProps = {
  preloadedUsers: Preloaded<typeof api.users.listPublic>;
};

export function UsersContent({ preloadedUsers }: UsersContentProps) {
  const result = usePreloadedQuery(preloadedUsers);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL_ROLES);
  const [selectedTechnologyKeys, setSelectedTechnologyKeys] = useState<
    TechnologyKey[]
  >([]);
  const [technologyDialogOpen, setTechnologyDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const roleOptions = useMemo(() => {
    const roles = Array.from(
      new Set(
        result.users.flatMap((user) => {
          const userRole = user.role?.trim();
          return userRole ? [userRole] : [];
        }),
      ),
    ).sort((left, right) => left.localeCompare(right));

    return [
      { label: "All roles", value: ALL_ROLES },
      ...roles.map((userRole) => ({ label: userRole, value: userRole })),
    ];
  }, [result.users]);
  const selectedTechnologies = selectedTechnologyKeys.flatMap(
    (technologyKey) => {
      const technology = getTechnologyByKey(technologyKey);
      return technology === null ? [] : [technology];
    },
  );
  const filteredUsers = useMemo(
    () =>
      result.users.filter((user) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          (user.name ?? "").toLowerCase().includes(normalizedSearch) ||
          `@${user.username}`.toLowerCase().includes(normalizedSearch);
        const matchesRole =
          role === ALL_ROLES || (user.role?.trim() ?? "") === role;
        const matchesTechnologies =
          selectedTechnologyKeys.length === 0 ||
          selectedTechnologyKeys.every((selectedKey) =>
            user.technologies.some(
              (technology) => technology.technologyKey === selectedKey,
            ),
          );

        return matchesSearch && matchesRole && matchesTechnologies;
      }),
    [
      normalizedSearch,
      result.users,
      role,
      selectedTechnologyKeys,
    ],
  );
  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    role !== ALL_ROLES ||
    selectedTechnologyKeys.length > 0;

  useKeyboardShortcut({
    enabled: !technologyDialogOpen,
    key: "k",
    metaOrControl: true,
    onTrigger: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
  });
  useKeyboardShortcut({
    enabled: !technologyDialogOpen,
    key: "Escape",
    onTrigger: () => {
      if (document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    },
    preventDefault: false,
  });

  function clearFilters() {
    setSearch("");
    setRole(ALL_ROLES);
    setSelectedTechnologyKeys([]);
  }

  function removeTechnology(technologyKey: TechnologyKey) {
    setSelectedTechnologyKeys((current) =>
      current.filter((currentKey) => currentKey !== technologyKey),
    );
  }

  return (
    <div className="min-h-svh bg-[#1A1A1A] text-white">
      <AppHeader />

      <main className="h-svh overflow-y-auto pt-[68px]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 max-[520px]:px-3 max-[520px]:pb-8">
          <UsersHeroSection />
          <UsersFilterSection
            hasActiveFilters={hasActiveFilters}
            role={role}
            roleOptions={roleOptions}
            search={search}
            searchInputRef={searchInputRef}
            selectedTechnologies={selectedTechnologies}
            onClearFilters={clearFilters}
            onOpenTechnologyDialog={() => setTechnologyDialogOpen(true)}
            onRemoveTechnology={removeTechnology}
            onRoleChange={setRole}
            onSearchChange={setSearch}
          />
          <UsersGridSection
            isTruncated={result.isTruncated}
            users={filteredUsers}
          />
        </div>
      </main>

      {technologyDialogOpen ? (
        <UsersTechFilterDialog
          selectedTechnologyKeys={selectedTechnologyKeys}
          onApply={setSelectedTechnologyKeys}
          onClose={() => setTechnologyDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
