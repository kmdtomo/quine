import { SearchIcon } from "lucide-react";

import { UserCard } from "./UserCard";
import type { UsersListItem } from "./users-types";

type UsersGridSectionProps = {
  isTruncated: boolean;
  users: UsersListItem[];
};

export function UsersGridSection({
  isTruncated,
  users,
}: UsersGridSectionProps) {
  return (
    <>
      {users.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2 min-[821px]:grid-cols-3 min-[1101px]:grid-cols-4">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center gap-2 px-6 py-12 text-center text-[#999]">
          <SearchIcon
            className="size-10 opacity-60"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-white">
            {isTruncated
              ? "No matches in the loaded engineers"
              : "No engineers match your filters"}
          </h2>
          <p className="text-xs text-[#999]">
            {isTruncated
              ? "Search and filters currently cover the first 60 public engineers."
              : "Try removing a stack or broadening your selection."}
          </p>
        </section>
      )}

      {isTruncated ? (
        <p className="mt-4 text-center text-[11px] text-white/35">
          Showing the first 60 public engineers. Search and filters apply to
          this loaded set.
        </p>
      ) : null}
    </>
  );
}
