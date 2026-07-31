import Image from "next/image";
import Link from "next/link";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

import type { UsersListItem } from "./users-types";

const DEFAULT_BANNER_IMAGE =
  "/background/drew-beamer-pek8uLQauMk-unsplash.jpg";
const VISIBLE_TECHNOLOGY_COUNT = 5;

type UserCardProps = {
  user: UsersListItem;
};

export function UserCard({ user }: UserCardProps) {
  const displayName = user.name?.trim() || user.username;
  const bannerImage = user.banner?.trim() || DEFAULT_BANNER_IMAGE;
  const avatarImage = user.image?.trim();
  const visibleTechnologies = user.technologies.slice(
    0,
    VISIBLE_TECHNOLOGY_COUNT,
  );
  const hiddenTechnologyCount = Math.max(
    user.technologies.length - visibleTechnologies.length,
    0,
  );

  return (
    <Link
      href={`/@${encodeURIComponent(user.username)}`}
      className="group flex h-auto flex-col overflow-hidden rounded-[16px] border border-[#3A3A3A] bg-[#272727] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-primary/35"
    >
      <div className="relative h-[110px] shrink-0 overflow-visible">
        <Image
          src={bannerImage}
          alt=""
          className="rounded-t-[16px] object-cover"
          fill
          sizes="(max-width: 520px) calc(100vw - 24px), (max-width: 820px) 50vw, (max-width: 1100px) 33vw, 304px"
          unoptimized={bannerImage !== DEFAULT_BANNER_IMAGE}
        />
        <div className="absolute bottom-[-32px] left-5 grid size-[72px] place-items-center overflow-hidden rounded-[16px] border-[3px] border-[#272727] bg-[#333] text-xl font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]">
          {avatarImage ? (
            <Image
              src={avatarImage}
              alt=""
              className="object-cover"
              fill
              sizes="72px"
              unoptimized
            />
          ) : (
            <span>{getInitial(displayName)}</span>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-11 pb-4">
        <h2 className="mb-0.5 truncate text-base font-bold text-white">
          {displayName}
        </h2>
        <p className="mb-3 truncate text-xs text-[#D0D0D0]">
          @{user.username}
        </p>
        <p className="mb-3 line-clamp-2 min-h-[38px] text-xs leading-[1.6] text-[#D0D0D0]">
          {user.bio?.trim() || "No introduction yet."}
        </p>

        <div className="mb-3 h-px bg-[#444]" />

        <div className="mb-2 flex min-w-0 items-center gap-3">
          <Image
            src="/icons/company_icon.svg"
            alt=""
            className="size-4 shrink-0 opacity-40"
            height={16}
            width={16}
          />
          <span className="truncate text-xs text-[#D0D0D0]">
            {user.company?.trim() || "Independent"}
          </span>
        </div>
        <div className="mb-3 flex min-w-0 items-center gap-3">
          <Image
            src="/icons/layer_icon.svg"
            alt=""
            className="size-4 shrink-0 opacity-40"
            height={16}
            width={16}
          />
          <span className="truncate text-xs text-[#D0D0D0]">
            {user.role?.trim() || "Role not set"}
          </span>
        </div>

        <div className="mb-3 h-px bg-[#444]" />

        <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
          {visibleTechnologies.length > 0 ? (
            visibleTechnologies.map((technology) => (
              <TechnologyLogo
                key={technology.technologyKey}
                name={technology.name}
                className="size-[22px] rounded-lg border-0"
                fallbackClassName="text-[9px]"
                imageClassName="size-[78%]"
              />
            ))
          ) : (
            <span className="text-xs text-[#999]">No stack</span>
          )}
          {hiddenTechnologyCount > 0 ? (
            <span className="ml-0.5 shrink-0 text-xs text-[#999]">
              +{hiddenTechnologyCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function getInitial(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || "Q";
}
