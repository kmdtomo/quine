import Link from "next/link";
import { PlusIcon, UserPlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { getProfileHref } from "../profile-links";
import type { ProfileConnection } from "../profile-types";
import {
  EmptyState,
  getInitials,
  TechBadges,
} from "./profile-ui";

export function ProfileConnectionsSection({
  className,
  connections,
  limit,
  onAdd,
}: {
  className?: string;
  connections: ProfileConnection[];
  limit: number;
  onAdd?: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-sm font-bold text-white">
            Connections{" "}
            <span className="ml-2 text-xs font-medium tracking-[0.02em] text-white/35">
              <strong className="font-bold text-primary">
                {connections.length}
              </strong>
              /{limit}
            </span>
          </h2>
          <p className="text-xs text-white/35">
            Engineers in your network
          </p>
        </div>
        {onAdd ? (
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-full text-white transition hover:scale-105 hover:text-primary"
            aria-label="Add connection"
            title="Add connection"
            onClick={onAdd}
          >
            <UserPlusIcon className="size-[22px]" aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <div className="-m-1 min-h-0 flex-1 space-y-2 overflow-y-auto p-1 pr-3">
        {connections.length > 0 ? (
          connections.map((connection) => (
            <ConnectionCard
              key={connection._id}
              connection={connection}
            />
          ))
        ) : (
          <EmptyState
            actionLabel="Add"
            icon={<PlusIcon className="size-7" aria-hidden="true" />}
            onAction={onAdd}
            title="No connections yet"
          />
        )}
      </div>
    </aside>
  );
}

function ConnectionCard({
  connection,
}: {
  connection: ProfileConnection;
}) {
  return (
    <Link
      href={getProfileHref(connection.username)}
      className="block rounded-lg border border-transparent bg-[#1E1E1E] p-3 transition hover:border-primary/50 max-[1280px]:p-2"
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-[#333] text-sm font-bold text-white">
          {connection.image ? (
            <img
              src={connection.image}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            getInitials(
              connection.name ?? connection.username ?? "Q",
            )
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-white">
            {connection.name ??
              connection.username ??
              "Quine user"}
          </h3>
          <p className="truncate text-xs text-white/55">
            {connection.company ??
              connection.role ??
              "Independent"}
          </p>
        </div>
      </div>
      <div className="rounded-lg bg-[#191919] px-2 py-1.5">
        <TechBadges
          technologies={connection.technologies}
          compact
        />
      </div>
    </Link>
  );
}
