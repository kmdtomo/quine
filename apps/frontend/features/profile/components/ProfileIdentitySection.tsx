"use client";

import type { ChangeEventHandler } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";

import { DropdownSelect } from "@/components/controls/DropdownSelect";
import { cn } from "@/lib/utils";

import type { ProfileSocialLink } from "../profile-form-schema";
import type { StackSummary } from "../profile-types";
import { SocialIcon } from "./profile-social";
import { getInitials } from "./profile-ui";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Tech Lead",
  "Engineering Manager",
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "Mobile Engineer",
  "iOS Engineer",
  "Android Engineer",
  "DevOps Engineer",
  "SRE",
  "Data Scientist",
  "Data Engineer",
  "ML Engineer",
  "QA Engineer",
  "UX/UI Designer",
  "Product Designer",
  "Product Manager",
  "Project Manager",
  "CTO",
  "VP of Engineering",
  "Founder",
  "Student",
];

const ROLE_SELECT_OPTIONS = [
  { label: "役職を選択", value: "" },
  ...ROLE_OPTIONS.map((option) => ({ label: option, value: option })),
];
const BIO_COLLAPSED_LINE_COUNT = 2;
const BIO_TOGGLE_MIN_CHARACTERS = 80;

type ProjectSummary = {
  openSource: number;
  personal: number;
  work: number;
};

export function ProfileIdentitySection({
  avatarSrc,
  bannerSrc,
  bio,
  canEdit,
  company,
  displayBio,
  displayCompany,
  displayName,
  displayUsername,
  editing,
  error,
  isOwner,
  name,
  onAvatarChange,
  onBannerChange,
  onBioChange,
  onCompanyChange,
  onEdit,
  onNameChange,
  onOpenBannerGallery,
  onOpenSocialLink,
  onRoleChange,
  projectSummary,
  role,
  saving,
  socialLinks,
  stackSummary,
}: {
  avatarSrc: string | undefined;
  bannerSrc: string | undefined;
  bio: string;
  canEdit: boolean;
  company: string;
  displayBio: string;
  displayCompany: string;
  displayName: string;
  displayUsername: string;
  editing: boolean;
  error: string | null;
  isOwner: boolean;
  name: string;
  onAvatarChange: ChangeEventHandler<HTMLInputElement>;
  onBannerChange: ChangeEventHandler<HTMLInputElement>;
  onBioChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onEdit: () => void;
  onNameChange: (value: string) => void;
  onOpenBannerGallery: () => void;
  onOpenSocialLink: (index: number | null) => void;
  onRoleChange: (value: string) => void;
  projectSummary: ProjectSummary;
  role: string;
  saving: boolean;
  socialLinks: ProfileSocialLink[];
  stackSummary: StackSummary;
}) {
  const [bannerMenuOpen, setBannerMenuOpen] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [introToggleVisible, setIntroToggleVisible] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const introTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = introTextRef.current;
    const trimmedBio = displayBio.trim();

    if (!element || canEdit || trimmedBio.length === 0) {
      setIntroToggleVisible(false);
      setIntroExpanded(false);
      return;
    }

    const measureIntro = () => {
      const lineHeight = Number.parseFloat(
        window.getComputedStyle(element).lineHeight,
      );
      const collapsedHeight = Number.isFinite(lineHeight)
        ? lineHeight * BIO_COLLAPSED_LINE_COUNT
        : 40;
      const explicitLineCount = trimmedBio.split(/\r\n|\r|\n/).length;
      const nextVisible =
        trimmedBio.length >= BIO_TOGGLE_MIN_CHARACTERS ||
        explicitLineCount > BIO_COLLAPSED_LINE_COUNT ||
        element.scrollHeight > collapsedHeight + 1;

      setIntroToggleVisible(nextVisible);
      if (!nextVisible) {
        setIntroExpanded(false);
      }
    };

    measureIntro();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measureIntro);
    observer.observe(element);
    return () => observer.disconnect();
  }, [canEdit, displayBio]);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-[#3A3A3A] bg-[#272727] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
        canEdit && "ring-1 ring-primary/35",
      )}
    >
      <div
        className={cn(
          "relative h-[140px] shrink-0 overflow-visible min-[1441px]:h-40 max-[1280px]:h-[130px] max-[1024px]:h-[110px]",
          !bannerSrc &&
            "rounded-t-[16px] border border-dashed border-white/20 bg-white/[0.025]",
        )}
      >
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt=""
            className="size-full rounded-t-[16px] object-cover"
          />
        ) : (
          <span className="pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 text-center text-xs font-medium text-white/35">
            Add a banner image
          </span>
        )}

        {isOwner ? (
          <button
            type="button"
            className={cn(
              "absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full text-white transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
              canEdit && "text-primary",
            )}
            aria-label={editing ? "Save profile" : "Edit profile"}
            title={editing ? "Save profile" : "Edit profile"}
            onClick={onEdit}
            disabled={saving}
          >
            {editing ? (
              <CheckIcon
                className="size-[18px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                aria-hidden="true"
              />
            ) : (
              <PencilIcon
                className="size-[18px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                aria-hidden="true"
              />
            )}
          </button>
        ) : null}

        {canEdit ? (
          <>
            <button
              type="button"
              className="absolute right-3 bottom-3 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-black/55 text-white opacity-85 backdrop-blur transition hover:scale-105 hover:bg-black/80 hover:opacity-100"
              aria-label="Change banner image"
              title="Change banner image"
              onClick={(event) => {
                event.stopPropagation();
                setBannerMenuOpen((current) => !current);
              }}
            >
              <ImageIcon className="size-4" aria-hidden="true" />
            </button>
            {bannerMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-20 cursor-default border-0 bg-transparent p-0"
                  aria-label="Close banner image menu"
                  tabIndex={-1}
                  onClick={() => setBannerMenuOpen(false)}
                />
                <ImageChoiceMenu
                  onGallery={() => {
                    setBannerMenuOpen(false);
                    onOpenBannerGallery();
                  }}
                  onUpload={() => {
                    setBannerMenuOpen(false);
                    bannerInputRef.current?.click();
                  }}
                />
              </>
            ) : null}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onBannerChange}
            />
          </>
        ) : null}

        <div
          className={cn(
            "absolute bottom-[-36px] left-5 grid size-20 place-items-center overflow-hidden rounded-[16px] border-[3px] border-[#272727] bg-[#272727] text-2xl font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] min-[1441px]:bottom-[-40px] min-[1441px]:size-[90px] max-[1280px]:bottom-[-32px] max-[1280px]:size-[72px] max-[1024px]:bottom-[-28px] max-[1024px]:size-16",
            !avatarSrc && "border-dashed border-white/30",
          )}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="size-full object-cover" />
          ) : (
            <span>{getInitials(name || displayUsername)}</span>
          )}
          {canEdit ? (
            <>
              <button
                type="button"
                className="absolute right-1 bottom-1 grid size-[26px] place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:scale-105 hover:bg-black/80"
                aria-label="Change profile photo"
                title="Change profile photo"
                onClick={() => avatarInputRef.current?.click()}
              >
                <CameraIcon className="size-3.5" aria-hidden="true" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={onAvatarChange}
              />
            </>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-11 pb-5 min-[1441px]:pt-14 max-[1280px]:px-4 max-[1280px]:pt-10 max-[1024px]:px-3 max-[1024px]:pt-9">
        {canEdit ? (
          <input
            value={name}
            onChange={(event) => onNameChange(event.currentTarget.value)}
            className="mb-1 w-full rounded-none border-0 bg-transparent p-0 text-xl leading-tight font-bold text-white outline-none placeholder:text-[#D0D0D0] min-[1441px]:text-[22px] max-[1280px]:text-lg max-[1024px]:text-base"
            placeholder="名前を入力"
          />
        ) : (
          <h1 className="mb-1 truncate text-xl leading-tight font-bold text-white min-[1441px]:text-[22px] max-[1280px]:text-lg max-[1024px]:text-base">
            {displayName}
          </h1>
        )}
        <p
          className={cn(
            "mb-5 text-xs text-[#D0D0D0] transition max-[1280px]:text-xs",
            canEdit && "opacity-35",
          )}
        >
          @{displayUsername}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          {socialLinks.length > 0 ? (
            socialLinks.map((link, index) => (
              <a
                key={`${link.platform}-${index}`}
                href={link.url}
                className="grid size-[22px] place-items-center text-[#999] transition hover:text-[#D0D0D0] max-[1280px]:size-5 max-[1024px]:size-[18px]"
                aria-label={link.platform}
                onClick={(event) => {
                  if (!canEdit) {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenSocialLink(index);
                }}
                target="_blank"
                rel="noreferrer"
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))
          ) : (
            <span className="text-xs text-white/35">No links</span>
          )}
          {canEdit ? (
            <button
              type="button"
              className="grid size-[22px] place-items-center rounded-full border border-dashed border-[#999] text-[#999] transition hover:border-solid hover:border-primary hover:text-primary"
              aria-label="Add social link"
              onClick={() => onOpenSocialLink(null)}
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mb-5 flex items-start gap-2">
          {canEdit ? (
            <textarea
              value={bio}
              onChange={(event) => onBioChange(event.currentTarget.value)}
              className="min-h-16 flex-1 resize-none rounded-none border-0 bg-transparent p-0 text-xs leading-[1.6] text-[#D0D0D0] outline-none placeholder:text-[#D0D0D0]"
              maxLength={120}
              placeholder="自己紹介を入力"
            />
          ) : (
            <p
              ref={introTextRef}
              className={cn(
                "min-h-[38px] flex-1 text-xs leading-[1.6] text-[#D0D0D0]",
                !introExpanded && "max-h-10 overflow-hidden",
              )}
            >
              {displayBio}
            </p>
          )}
          {!canEdit && introToggleVisible ? (
            <button
              type="button"
              className="mt-4 grid size-6 shrink-0 place-items-center text-[#999] transition hover:text-[#D0D0D0]"
              aria-label="Toggle intro"
              onClick={() => setIntroExpanded((current) => !current)}
            >
              <ChevronDownIcon
                className={cn(
                  "size-4 transition",
                  introExpanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            "mb-4 h-px bg-[#444] transition",
            canEdit && "opacity-35",
          )}
        />

        <div className="mb-3 flex items-center gap-3">
          <img
            src="/icons/company_icon.svg"
            alt=""
            className={cn(
              "size-4 shrink-0 opacity-40",
              canEdit && "opacity-35",
            )}
          />
          {canEdit ? (
            <input
              value={company}
              onChange={(event) => onCompanyChange(event.currentTarget.value)}
              className="min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-xs text-[#D0D0D0] outline-none placeholder:text-[#D0D0D0]"
              placeholder="会社名"
            />
          ) : (
            <span className="min-w-0 truncate text-xs text-[#D0D0D0]">
              {displayCompany}
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <img
            src="/icons/layer_icon.svg"
            alt=""
            className={cn(
              "size-4 shrink-0 opacity-40",
              canEdit && "opacity-35",
            )}
          />
          <DropdownSelect
            ariaLabel="Role"
            className="flex-1"
            disabled={!canEdit}
            options={ROLE_SELECT_OPTIONS}
            triggerClassName={cn(
              "min-w-0 rounded-none border-0 bg-transparent p-0 text-xs text-[#D0D0D0] outline-none data-[size=default]:h-auto disabled:pointer-events-none disabled:opacity-100 disabled:[&_svg]:hidden [&_svg]:size-3 [&_svg]:text-white/40",
              canEdit && "cursor-pointer",
            )}
            value={role}
            onValueChange={onRoleChange}
          />
        </div>

        <div
          className={cn(
            "mb-4 h-px bg-[#444] transition",
            canEdit && "opacity-35",
          )}
        />

        <SummaryBlock
          className={cn(canEdit && "opacity-35")}
          iconSrc="/icons/teck_stack.svg"
          label="Stacks"
          chips={[
            ["Frontend", stackSummary.frontend],
            ["Backend", stackSummary.backend],
            ["Mobile", stackSummary.mobile],
            ["Infra", stackSummary.infra],
            ["Other", stackSummary.other],
          ]}
        />
        <SummaryBlock
          className={cn("mt-4", canEdit && "opacity-35")}
          iconSrc="/icons/project_type.svg"
          label="Projects"
          chips={[
            ["OSS", projectSummary.openSource],
            ["Personal", projectSummary.personal],
            ["Work", projectSummary.work],
          ]}
        />

        {error ? (
          <p className="mt-5 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
            {error}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function SummaryBlock({
  chips,
  className,
  iconSrc,
  label,
}: {
  chips: [string, number][];
  className?: string;
  iconSrc: string;
  label: string;
}) {
  return (
    <div className={cn("transition", className)}>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#D0D0D0]">
        <img src={iconSrc} alt="" className="size-4 opacity-40" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-6">
        {chips.map(([chipLabel, count]) => (
          <span
            key={chipLabel}
            className="inline-flex items-center gap-1 rounded-full border border-[#444] bg-[#1E1E1E] px-2 py-1 text-[11px] text-[#999]"
          >
            {chipLabel}
            <strong className="font-bold text-white">{count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function ImageChoiceMenu({
  onGallery,
  onUpload,
}: {
  onGallery: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="absolute right-3 bottom-14 z-30 flex min-w-[220px] flex-col rounded-lg border border-[#3A3A3A] bg-[#272727] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition hover:bg-[#1E1E1E] hover:text-white"
        onClick={onUpload}
      >
        <UploadIcon
          className="size-[18px] shrink-0 text-[#999]"
          aria-hidden="true"
        />
        <span>Upload from device</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition hover:bg-[#1E1E1E] hover:text-white"
        onClick={onGallery}
      >
        <ImageIcon
          className="size-[18px] shrink-0 text-[#999]"
          aria-hidden="true"
        />
        <span>Choose from gallery</span>
      </button>
    </div>
  );
}
