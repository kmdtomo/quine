"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  Grid2X2Icon,
  ImageIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";

import { api } from "@convex/_generated/api";
import {
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { DropdownSelect } from "@/components/controls/DropdownSelect";
import { GlassModal } from "@/components/glass-modal";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfileContentProps = {
  onboarding: boolean;
  preloadedProfile: Preloaded<typeof api.users.getProfile>;
};

type SocialLink = {
  platform: string;
  url: string;
};

type ProfileTechnology = {
  _id?: string;
  categoryName: string;
  name: string;
  technologyKey: string;
  years?: number;
};

type ProductTechnology = {
  name: string;
  technologyKey: string;
};

type ProductProjectType = "personal" | "work" | "open_source";

type ProfileProduct = {
  _id: string;
  content: string;
  isPublic: boolean;
  logo: string | undefined;
  name: string;
  projectType: ProductProjectType;
  slug: string;
  tagline: string;
  technologies: ProductTechnology[];
};

type ProfileConnection = {
  _id: string;
  company: string | undefined;
  image: string | undefined;
  name: string | undefined;
  role: string | undefined;
  technologies: ProductTechnology[];
  username: string | undefined;
};

type StackSummary = {
  backend: number;
  frontend: number;
  infra: number;
  mobile: number;
  other: number;
};

type SocialType = {
  label: string;
  path: string;
  platform: string;
};

type BannerGalleryOption = {
  alt: string;
  src: string;
};

const SOCIAL_TYPES: SocialType[] = [
  {
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    platform: "x",
  },
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    platform: "instagram",
  },
  {
    label: "GitHub",
    path: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
    platform: "github",
  },
  {
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    platform: "facebook",
  },
  {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    platform: "linkedin",
  },
  {
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    platform: "youtube",
  },
];

const BANNER_GALLERY_OPTIONS: BannerGalleryOption[] = [
  { alt: "Banner option 1", src: "/background/drew-beamer-pek8uLQauMk-unsplash.jpg" },
  { alt: "Banner option 2", src: "/lp/tech_stack_bg.jpg" },
  { alt: "Banner option 3", src: "/background/ivan-bandura-WhIff5iuW-E-unsplash.jpg" },
  { alt: "Banner option 4", src: "/profile/banner-city.jpg" },
  { alt: "Banner option 5", src: "/profile/banner-aurora.jpg" },
  { alt: "Banner option 6", src: "/profile/banner-field.jpg" },
];

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

const DEFAULT_BANNER_SRC = "/background/drew-beamer-pek8uLQauMk-unsplash.jpg";
const MAX_SOCIAL_LINKS = 4;
const MAX_SOURCE_IMAGE_BYTES = 6 * 1024 * 1024;
const PROFILE_PHOTO_SIZE = 512;
const BANNER_MAX_WIDTH = 1280;
const BANNER_MAX_HEIGHT = 460;
const BIO_COLLAPSED_LINE_COUNT = 2;
const BIO_TOGGLE_MIN_CHARACTERS = 80;

const PROJECT_TYPE_OPTIONS: { label: string; value: ProductProjectType }[] = [
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "OSS", value: "open_source" },
];

export function ProfileContent({
  onboarding,
  preloadedProfile,
}: ProfileContentProps) {
  const router = useRouter();
  const profile = usePreloadedQuery(preloadedProfile);
  const completeProfileOnboarding = useMutation(
    api.users.completeProfileOnboarding,
  );
  const createProduct = useMutation(api.products.create);
  const addConnection = useMutation(api.connections.add);
  const shouldStartEditing =
    profile?.needsProfileOnboarding === true && (onboarding || profile.isOwner);
  const initialUsername = normalizeUsername(profile?.user.username);
  const initialSocialLinks = useMemo(
    () => getInitialSocialLinks(profile?.user.socialLinks, initialUsername),
    [profile?.user.socialLinks, initialUsername],
  );

  const [editing, setEditing] = useState(shouldStartEditing);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.user.name ?? "");
  const [role, setRole] = useState(profile?.user.role ?? "");
  const [company, setCompany] = useState(profile?.user.company ?? "");
  const [bio, setBio] = useState(profile?.user.bio ?? "");
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [categoryPreview, setCategoryPreview] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [bannerPreview, setBannerPreview] = useState<string | undefined>();
  const [bannerMenuOpen, setBannerMenuOpen] = useState(false);
  const [bannerGalleryOpen, setBannerGalleryOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(
    null,
  );
  const [socialModalPlatform, setSocialModalPlatform] = useState<string | null>(
    null,
  );
  const [socialModalUrl, setSocialModalUrl] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [productTagline, setProductTagline] = useState("");
  const [productContent, setProductContent] = useState("");
  const [productProjectType, setProductProjectType] =
    useState<ProductProjectType>("personal");
  const [productIsPublic, setProductIsPublic] = useState(true);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [connectionUsername, setConnectionUsername] = useState("");
  const [connectionSaving, setConnectionSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const introTextRef = useRef<HTMLParagraphElement>(null);
  const profileHref = getProfileHref(profile?.user.username);
  const profileBio = profile?.user.bio ?? "";
  const canEditCurrentProfile = profile?.isOwner === true && editing;
  const hiddenSocialPlatforms = useMemo(
    () => getHiddenSocialPlatforms(socialLinks, editingSocialIndex),
    [editingSocialIndex, socialLinks],
  );
  const [introToggleVisible, setIntroToggleVisible] = useState(false);

  useEffect(() => {
    const element = introTextRef.current;
    const trimmedBio = profileBio.trim();

    if (!element || canEditCurrentProfile || trimmedBio.length === 0) {
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
  }, [canEditCurrentProfile, profileBio]);

  if (!profile) {
    return (
      <main className="grid h-full place-items-center bg-[#1A1A1A] px-6 text-center text-white">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
            Quine
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Profile not found</h1>
        </div>
      </main>
    );
  }

  const displayUsername = normalizeUsername(profile.user.username) ?? "unknown";
  const isOnboardingEdit = profile.needsProfileOnboarding && profile.isOwner;
  const canEdit = profile.isOwner && editing;
  const stackSummary = getStackSummary(profile.technologies);
  const projectSummary = getProjectSummary(profile.products);
  const visibleProducts = isOnboardingEdit ? [] : profile.products;
  const visibleConnections = isOnboardingEdit ? [] : profile.connections;
  const secondaryColumnClassName = cn(
    "transition duration-200",
    canEdit && "pointer-events-none opacity-35",
  );
  const avatarSrc =
    avatarPreview ?? (isOnboardingEdit ? undefined : profile.user.image);
  const bannerSrc =
    bannerPreview ??
    (isOnboardingEdit ? undefined : profile.user.banner ?? DEFAULT_BANNER_SRC);

  async function handleEditButton() {
    if (!profile) {
      return;
    }
    const currentProfile = profile;

    if (!currentProfile.isOwner) {
      return;
    }

    if (!editing) {
      setEditing(true);
      return;
    }

    const nextSocialLinks = normalizeSocialLinks(socialLinks);
    setError(null);
    setSaving(true);
    try {
      await completeProfileOnboarding({
        ...(bannerPreview === undefined ? {} : { banner: bannerPreview }),
        bio,
        company,
        ...(avatarPreview === undefined ? {} : { image: avatarPreview }),
        name,
        role,
        socialLinks: nextSocialLinks,
      });
      setEditing(false);
      router.replace(getProfileHref(currentProfile.user.username));
    } catch (unknownError: unknown) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Could not save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openSocialModal(index: number | null) {
    if (!canEdit) {
      return;
    }

    if (index === null) {
      setEditingSocialIndex(null);
      setSocialModalPlatform(null);
      setSocialModalUrl("");
      setSocialModalOpen(true);
      return;
    }

    const link = socialLinks[index];
    if (!link) {
      return;
    }

    setEditingSocialIndex(index);
    setSocialModalPlatform(getSupportedSocialPlatform(link.platform));
    setSocialModalUrl(link.url);
    setSocialModalOpen(true);
  }

  function closeSocialModal() {
    setSocialModalOpen(false);
    setEditingSocialIndex(null);
    setSocialModalPlatform(null);
    setSocialModalUrl("");
  }

  function saveSocialLink() {
    const platform = socialModalPlatform;
    const url = socialModalUrl.trim();
    if (!platform || url.length === 0) {
      return;
    }

    setSocialLinks((current) => {
      const nextLink = { platform, url };
      if (editingSocialIndex === null) {
        return current.length >= MAX_SOCIAL_LINKS
          ? current
          : [...current, nextLink];
      }

      return current.map((link, index) =>
        index === editingSocialIndex ? nextLink : link,
      );
    });
    closeSocialModal();
  }

  function removeSocialLink() {
    if (editingSocialIndex === null) {
      return;
    }

    setSocialLinks((current) =>
      current.filter((_, index) => index !== editingSocialIndex),
    );
    closeSocialModal();
  }

  function selectBannerFromGallery(src: string) {
    setBannerPreview(src);
    setBannerGalleryOpen(false);
    setBannerMenuOpen(false);
  }

  function openProductModal() {
    if (!profile?.isOwner || isOnboardingEdit) {
      return;
    }

    router.push("/products/new");
  }

  function closeProductModal() {
    if (productSaving) {
      return;
    }
    setProductModalOpen(false);
    setProductError(null);
  }

  async function handleCreateProduct() {
    if (!profile?.isOwner) {
      return;
    }

    setProductSaving(true);
    setProductError(null);
    try {
      await createProduct({
        content: productContent,
        isPublic: productIsPublic,
        name: productName,
        projectType: productProjectType,
        tagline: productTagline,
      });
      setProductModalOpen(false);
      setProductName("");
      setProductTagline("");
      setProductContent("");
      setProductProjectType("personal");
      setProductIsPublic(true);
    } catch (unknownError: unknown) {
      setProductError(
        unknownError instanceof Error
          ? unknownError.message
          : "Could not create product.",
      );
    } finally {
      setProductSaving(false);
    }
  }

  function openConnectionModal() {
    if (!profile?.isOwner || isOnboardingEdit) {
      return;
    }

    setConnectionUsername("");
    setConnectionError(null);
    setConnectionModalOpen(true);
  }

  function closeConnectionModal() {
    if (connectionSaving) {
      return;
    }
    setConnectionModalOpen(false);
    setConnectionError(null);
  }

  async function handleAddConnection() {
    const username = normalizeUsername(connectionUsername);
    if (!username) {
      setConnectionError("Username is required.");
      return;
    }

    setConnectionSaving(true);
    setConnectionError(null);
    try {
      await addConnection({ username });
      setConnectionModalOpen(false);
      setConnectionUsername("");
    } catch (unknownError: unknown) {
      setConnectionError(
        unknownError instanceof Error
          ? unknownError.message
          : "Could not add connection.",
      );
    } finally {
      setConnectionSaving(false);
    }
  }

  async function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>,
    setPreview: (value: string | undefined) => void,
    options: { maxHeight: number; maxWidth: number },
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      input.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      input.value = "";
      return;
    }

    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      setError("Image must be 6MB or smaller.");
      input.value = "";
      return;
    }

    try {
      const dataUrl = await resizeImageFile(file, options);
      setPreview(dataUrl);
      setError(null);
    } catch {
      setError("Could not read that image.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="h-full bg-[#1A1A1A] text-white">
      <AppHeader activeItem="home" homeHref={profileHref} />

      <main className="h-full w-full px-8 pt-3 pb-6 min-[1441px]:px-10 min-[1441px]:pt-[84px] min-[1441px]:pb-8 max-[1280px]:px-6 max-[1280px]:pb-5 max-[1024px]:px-4 max-[1024px]:pt-2 max-[1024px]:pb-4">
        <div
          className={cn(
            "grid h-full min-h-0 grid-cols-[260px_minmax(0,1fr)_260px] gap-4 min-[1441px]:grid-cols-[280px_minmax(0,1fr)_300px] min-[1441px]:gap-5 max-[1280px]:grid-cols-[240px_minmax(0,1fr)_240px] max-[1280px]:gap-3 max-[1024px]:grid-cols-[220px_minmax(0,1fr)_200px]",
            categoryPreview &&
              "grid-cols-[260px_minmax(0,1fr)] min-[1441px]:grid-cols-[280px_minmax(0,1fr)] max-[1280px]:grid-cols-[240px_minmax(0,1fr)] max-[1024px]:grid-cols-[220px_minmax(0,1fr)]",
          )}
        >
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

              {profile.isOwner ? (
                <button
                  type="button"
                  className={cn(
                    "absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full text-white transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
                    canEdit && "text-primary",
                  )}
                  aria-label={editing ? "Save profile" : "Edit profile"}
                  title={editing ? "Save profile" : "Edit profile"}
                  onClick={handleEditButton}
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
                          setBannerGalleryOpen(true);
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
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      handleImageSelection(event, setBannerPreview, {
                        maxHeight: BANNER_MAX_HEIGHT,
                        maxWidth: BANNER_MAX_WIDTH,
                      })
                    }
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
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) =>
                        handleImageSelection(event, setAvatarPreview, {
                          maxHeight: PROFILE_PHOTO_SIZE,
                          maxWidth: PROFILE_PHOTO_SIZE,
                        })
                      }
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-11 pb-5 min-[1441px]:pt-14 max-[1280px]:px-4 max-[1280px]:pt-10 max-[1024px]:px-3 max-[1024px]:pt-9">
              {canEdit ? (
                <input
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  className="mb-1 w-full rounded-none border-0 bg-transparent p-0 text-xl leading-tight font-bold text-white outline-none placeholder:text-[#D0D0D0] min-[1441px]:text-[22px] max-[1280px]:text-lg max-[1024px]:text-base"
                  placeholder="名前を入力"
                />
              ) : (
                <h1 className="mb-1 truncate text-xl leading-tight font-bold text-white min-[1441px]:text-[22px] max-[1280px]:text-lg max-[1024px]:text-base">
                  {profile.user.name ?? displayUsername}
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
                      href={link.url || undefined}
                      className="grid size-[22px] place-items-center text-[#999] transition hover:text-[#D0D0D0] max-[1280px]:size-5 max-[1024px]:size-[18px]"
                      aria-label={link.platform}
                      onClick={(event) => {
                        if (!canEdit) {
                          return;
                        }

                        event.preventDefault();
                        event.stopPropagation();
                        openSocialModal(index);
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
                    onClick={() => openSocialModal(null)}
                  >
                    <PlusIcon className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="mb-5 flex items-start gap-2">
                {canEdit ? (
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.currentTarget.value)}
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
                    {profileBio}
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
                  className={cn("size-4 shrink-0 opacity-40", canEdit && "opacity-35")}
                />
                {canEdit ? (
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.currentTarget.value)}
                    className="min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-xs text-[#D0D0D0] outline-none placeholder:text-[#D0D0D0]"
                    placeholder="会社名"
                  />
                ) : (
                  <span className="min-w-0 truncate text-xs text-[#D0D0D0]">
                    {profile.user.company ?? ""}
                  </span>
                )}
              </div>

              <div className="mb-4 flex items-center gap-3">
                <img
                  src="/icons/layer_icon.svg"
                  alt=""
                  className={cn("size-4 shrink-0 opacity-40", canEdit && "opacity-35")}
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
                  onValueChange={setRole}
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

          <section className={cn("flex min-h-0 flex-col gap-5", secondaryColumnClassName)}>
            <TechStackPanel
              categoryPreview={categoryPreview}
              technologies={profile.technologies}
              onCategoryPreviewChange={setCategoryPreview}
            />
            {categoryPreview ? null : (
              <ProductPanel
                onCreate={profile.isOwner && !isOnboardingEdit ? openProductModal : undefined}
                products={visibleProducts}
                username={profile.user.username}
              />
            )}
          </section>

          {categoryPreview ? null : (
            <ConnectionPanel
              className={secondaryColumnClassName}
              connections={visibleConnections}
              limit={isOnboardingEdit ? 0 : profile.connectionLimit}
              onAdd={profile.isOwner && !isOnboardingEdit ? openConnectionModal : undefined}
            />
          )}
        </div>
      </main>

      {bannerGalleryOpen ? (
        <BannerGalleryModal
          onClose={() => setBannerGalleryOpen(false)}
          onSelect={selectBannerFromGallery}
        />
      ) : null}

      {socialModalOpen ? (
        <SocialLinkModal
          editing={editingSocialIndex !== null}
          hiddenPlatforms={hiddenSocialPlatforms}
          onClose={closeSocialModal}
          onDelete={removeSocialLink}
          onPlatformChange={setSocialModalPlatform}
          onSave={saveSocialLink}
          onUrlChange={setSocialModalUrl}
          selectedPlatform={socialModalPlatform}
          url={socialModalUrl}
        />
      ) : null}

      {productModalOpen ? (
        <ProductCreateModal
          content={productContent}
          error={productError}
          isPublic={productIsPublic}
          name={productName}
          onClose={closeProductModal}
          onContentChange={setProductContent}
          onCreate={handleCreateProduct}
          onIsPublicChange={setProductIsPublic}
          onNameChange={setProductName}
          onProjectTypeChange={setProductProjectType}
          onTaglineChange={setProductTagline}
          projectType={productProjectType}
          saving={productSaving}
          tagline={productTagline}
        />
      ) : null}

      {connectionModalOpen ? (
        <ConnectionAddModal
          error={connectionError}
          onAdd={handleAddConnection}
          onClose={closeConnectionModal}
          onUsernameChange={setConnectionUsername}
          saving={connectionSaving}
          username={connectionUsername}
        />
      ) : null}
    </div>
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
    <div
      className="absolute right-3 bottom-14 z-30 flex min-w-[220px] flex-col rounded-lg border border-[#3A3A3A] bg-[#272727] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]"
      aria-hidden="false"
    >
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition hover:bg-[#1E1E1E] hover:text-white"
        onClick={onUpload}
      >
        <UploadIcon className="size-[18px] shrink-0 text-[#999]" aria-hidden="true" />
        <span>Upload from device</span>
      </button>
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#D0D0D0] transition hover:bg-[#1E1E1E] hover:text-white"
        onClick={onGallery}
      >
        <ImageIcon className="size-[18px] shrink-0 text-[#999]" aria-hidden="true" />
        <span>Choose from gallery</span>
      </button>
    </div>
  );
}

function BannerGalleryModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (src: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close banner gallery"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-64px)] w-[720px] max-w-[calc(100vw-32px)] flex-col rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <h3 className="mb-1 text-lg font-bold text-white">Choose a banner</h3>
        <p className="mb-4 text-xs text-[#999]">Pick from our default gallery</p>
        <div className="-mx-1.5 mt-[-6px] grid grid-cols-3 gap-4 overflow-y-auto px-1.5 pt-1.5 pb-4">
          {BANNER_GALLERY_OPTIONS.map((option) => (
            <button
              key={option.src}
              type="button"
              className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-transparent bg-[#1E1E1E] transition hover:border-primary hover:shadow-[0_0_0_1px_#07DE81,0_6px_16px_rgba(7,222,129,0.18)]"
              onClick={() => onSelect(option.src)}
            >
              <img
                src={option.src}
                alt={option.alt}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="rounded-full border border-[#444] px-4 py-2 text-sm font-medium text-[#999] transition hover:border-[#999] hover:text-[#D0D0D0]"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

function SocialLinkModal({
  editing,
  hiddenPlatforms,
  onClose,
  onDelete,
  onPlatformChange,
  onSave,
  onUrlChange,
  selectedPlatform,
  url,
}: {
  editing: boolean;
  hiddenPlatforms: Set<string>;
  onClose: () => void;
  onDelete: () => void;
  onPlatformChange: (platform: string) => void;
  onSave: () => void;
  onUrlChange: (value: string) => void;
  selectedPlatform: string | null;
  url: string;
}) {
  const saveDisabled = !selectedPlatform || url.trim().length === 0;
  const visibleSocialTypes = SOCIAL_TYPES.filter(
    (type) =>
      !hiddenPlatforms.has(type.platform) || selectedPlatform === type.platform,
  );

  return (
    <GlassModal
      className="max-w-[440px] p-6"
      contentClassName="text-left"
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      showCloseButton={false}
      titleId="social-link-modal-title"
    >
      <h3
        className="text-xl font-bold tracking-tight text-white"
        id="social-link-modal-title"
      >
        {editing ? "Edit social link" : "Add social link"}
      </h3>
      <p className="mt-1.5 text-xs text-white/50">
        Pick an icon and paste your link
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap justify-center gap-2">
          {visibleSocialTypes.map((type) => (
            <button
              key={type.platform}
              type="button"
              className={cn(
                "grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/80",
                selectedPlatform === type.platform &&
                  "border-primary/70 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(7,222,129,0.18)]",
              )}
              aria-label={type.label}
              title={type.label}
              onClick={() => onPlatformChange(type.platform)}
            >
              <SocialIcon platform={type.platform} className="size-[18px]" />
            </button>
          ))}
        </div>
        <input
          type="url"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:bg-white/[0.06]"
          placeholder="https://..."
          autoComplete="off"
          value={url}
          onChange={(event) => onUrlChange(event.currentTarget.value)}
        />
        <div className="flex items-center justify-end gap-2 pt-1.5">
          {editing ? (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto h-9 rounded-full px-4"
              onClick={onDelete}
            >
              Remove
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-white/10 bg-white/[0.04] px-4 text-white/60 hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-white px-4 font-semibold text-zinc-950 shadow-lg hover:bg-zinc-100"
            disabled={saveDisabled}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
    </GlassModal>
  );
}

function TechStackPanel({
  categoryPreview,
  onCategoryPreviewChange,
  technologies,
}: {
  categoryPreview: boolean;
  onCategoryPreviewChange: (value: boolean) => void;
  technologies: ProfileTechnology[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupTechnologies(technologies), [technologies]);

  if (categoryPreview) {
    return (
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          className="absolute top-0 right-8 z-10 grid size-7 place-items-center text-white/55 transition hover:text-white"
          aria-label="Close tech stack categories"
          onClick={() => onCategoryPreviewChange(false)}
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto py-1 pr-3 pl-1">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.categoryName}>
                <h3 className="mb-3 text-sm font-bold text-white/60">
                  {group.categoryName}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((technology) => (
                    <TechItem
                      key={technology.technologyKey}
                      categoryView
                      technology={technology}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No stacks yet" />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative mt-[-17px] shrink-0">
      <div className="relative">
        <button
          type="button"
          className="absolute top-1/2 left-2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:bg-[#1E1E1E] hover:text-white sm:grid"
          aria-label="Scroll stack left"
          onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pr-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {technologies.length > 0 ? (
            technologies.map((technology) => (
              <TechItem key={technology.technologyKey} technology={technology} />
            ))
          ) : (
            <div className="mt-8 w-full rounded-[16px] border border-[#3A3A3A] bg-[#272727] px-5 py-8">
              <EmptyState title="No stacks yet" />
            </div>
          )}
        </div>

        <button
          type="button"
          className="absolute top-1/2 right-2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:scale-105 hover:bg-[#1E1E1E] hover:text-white"
          aria-label="Show stacks by category"
          title="Show stacks by category"
          onClick={() => onCategoryPreviewChange(true)}
        >
          <Grid2X2Icon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function TechItem({
  categoryView = false,
  technology,
}: {
  categoryView?: boolean;
  technology: ProfileTechnology;
}) {
  return (
    <div
      className={cn(
        "ml-1 flex w-24 shrink-0 flex-col items-center text-center",
        categoryView ? "mt-0" : "mt-8",
      )}
    >
      <div className="relative grid size-24 place-items-center overflow-hidden rounded-xl border border-[#4D494A] bg-[#111] bg-[url('/lp/tech_stack_bg.jpg')] bg-cover bg-center p-2 transition hover:border-primary/70">
        <div className="absolute inset-0 bg-black/5" />
        <TechnologyLogo
          name={technology.name}
          backdrop="auto"
          className="relative z-10 mb-2 size-10 border-0 bg-transparent"
          imageClassName="size-full"
          fallbackClassName="text-white"
          logoColor="auto"
        />
        <span className="relative z-10 max-w-full truncate text-xs font-medium text-white">
          {technology.name}
        </span>
      </div>
      <span className="mt-2 text-xs text-white/35">
        {formatYears(technology.years)}
      </span>
    </div>
  );
}

function ProductPanel({
  onCreate,
  products,
  username,
}: {
  onCreate?: () => void;
  products: ProfileProduct[];
  username: string | undefined;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] max-[1024px]:p-3">
      <div className="mb-4 flex shrink-0 items-center gap-5">
        <span className="relative py-1 text-sm font-bold text-white after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-[#11998E]">
          Product
        </span>
        <span className="py-1 text-sm font-bold text-white/25">Blogs</span>
      </div>

      <div className="-m-1 min-h-0 flex-1 space-y-3 overflow-y-auto p-1 pr-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              key={product._id}
              href={getProductHref(username, product.slug)}
              className="rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-4 transition hover:border-primary/50 max-[1024px]:p-3"
            >
              <header className="mb-3 flex items-start gap-3">
                <ProductLogo logo={product.logo} name={product.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <h3 className="truncate text-sm font-bold text-white">
                          {product.name}
                        </h3>
                        <span className="text-sm text-white/30">/</span>
                        <span className="shrink-0 text-xs text-white/50">
                          {getProjectTypeLabel(product.projectType)}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-xs text-white/35 before:block before:h-0.5 before:w-4 before:bg-white/30">
                        {product.tagline}
                      </p>
                    </div>
                    <TechBadges technologies={product.technologies} />
                  </div>
                </div>
              </header>
              <p className="max-h-10 overflow-hidden text-xs leading-5 text-white/55">
                {product.content}
              </p>
            </Link>
          ))
        ) : (
          <EmptyState
            actionLabel="Create"
            icon={<PlusIcon className="size-7" aria-hidden="true" />}
            onAction={onCreate}
            title="No products yet"
          />
        )}
      </div>
    </section>
  );
}

function ConnectionPanel({
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
              <strong className="font-bold text-primary">{connections.length}</strong>/
              {limit}
            </span>
          </h2>
          <p className="text-xs text-white/35">Engineers in your network</p>
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
            <ConnectionCard key={connection._id} connection={connection} />
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

function ConnectionCard({ connection }: { connection: ProfileConnection }) {
  const href = getProfileHref(connection.username);

  return (
    <Link
      href={href}
      className="block rounded-lg border border-transparent bg-[#1E1E1E] p-3 transition hover:border-primary/50 max-[1280px]:p-2"
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-[#333] text-sm font-bold text-white">
          {connection.image ? (
            <img src={connection.image} alt="" className="size-full object-cover" />
          ) : (
            getInitials(connection.name ?? connection.username ?? "Q")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-white">
            {connection.name ?? connection.username ?? "Quine user"}
          </h3>
          <p className="truncate text-xs text-white/55">
            {connection.company ?? connection.role ?? "Independent"}
          </p>
        </div>
      </div>
      <div className="rounded-lg bg-[#191919] px-2 py-1.5">
        <TechBadges technologies={connection.technologies} compact />
      </div>
    </Link>
  );
}

function ProductLogo({
  logo,
  name,
}: {
  logo: string | undefined;
  name: string;
}) {
  return (
    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-[#333] text-sm font-bold text-white">
      {logo ? <img src={logo} alt="" className="size-full object-cover" /> : name[0]}
    </div>
  );
}

function TechBadges({
  compact = false,
  technologies,
}: {
  compact?: boolean;
  technologies: ProductTechnology[];
}) {
  const visibleTechnologies = technologies.slice(0, compact ? 5 : 4);
  const hiddenCount = Math.max(technologies.length - visibleTechnologies.length, 0);

  if (visibleTechnologies.length === 0) {
    return <span className="text-xs text-white/30">No stack</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {visibleTechnologies.map((technology) => (
        <TechnologyLogo
          key={technology.technologyKey}
          name={technology.name}
          className={cn(
            "rounded border-0 bg-white",
            compact ? "size-5" : "size-[22px]",
          )}
          imageClassName="size-[78%]"
          fallbackClassName="text-[9px]"
        />
      ))}
      {hiddenCount > 0 ? (
        <span className="ml-0.5 text-xs text-white/35">+{hiddenCount}</span>
      ) : null}
    </div>
  );
}

function EmptyState({
  actionLabel,
  icon,
  onAction,
  title,
}: {
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="grid h-full min-h-48 place-items-center text-center">
      <div>
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border border-white/10 text-white/35">
          {icon ?? <LinkIcon className="size-7" aria-hidden="true" />}
        </div>
        <p className="text-sm font-bold text-white/60">{title}</p>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="mx-auto mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-bold text-white/50 transition hover:border-primary/50 hover:text-primary"
            onClick={onAction}
          >
            <PlusIcon className="size-3.5" aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ProductCreateModal({
  content,
  error,
  isPublic,
  name,
  onClose,
  onContentChange,
  onCreate,
  onIsPublicChange,
  onNameChange,
  onProjectTypeChange,
  onTaglineChange,
  projectType,
  saving,
  tagline,
}: {
  content: string;
  error: string | null;
  isPublic: boolean;
  name: string;
  onClose: () => void;
  onContentChange: (value: string) => void;
  onCreate: () => void;
  onIsPublicChange: (value: boolean) => void;
  onNameChange: (value: string) => void;
  onProjectTypeChange: (value: ProductProjectType) => void;
  onTaglineChange: (value: string) => void;
  projectType: ProductProjectType;
  saving: boolean;
  tagline: string;
}) {
  const createDisabled =
    saving || name.trim().length === 0 || tagline.trim().length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close product modal"
        onClick={onClose}
      />
      <section className="relative w-[520px] max-w-[calc(100vw-32px)] rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <h3 className="mb-5 text-lg font-bold text-white">Create product</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-white/55">
              Name
            </span>
            <input
              type="text"
              className="h-11 w-full rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition placeholder:text-[#999]/60 focus:border-primary"
              placeholder="Quine"
              value={name}
              autoFocus
              onChange={(event) => onNameChange(event.currentTarget.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-white/55">
              Tagline
            </span>
            <input
              type="text"
              className="h-11 w-full rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition placeholder:text-[#999]/60 focus:border-primary"
              placeholder="Developer profiles with real tech context"
              value={tagline}
              onChange={(event) => onTaglineChange(event.currentTarget.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-white/55">
              Type
            </span>
            <select
              className="h-11 w-full rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition focus:border-primary"
              value={projectType}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (isProductProjectType(value)) {
                  onProjectTypeChange(value);
                }
              }}
            >
              {PROJECT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-white/55">
              Description
            </span>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-3 text-sm leading-5 text-white outline-none transition placeholder:text-[#999]/60 focus:border-primary"
              placeholder="What did you build?"
              value={content}
              onChange={(event) => onContentChange(event.currentTarget.value)}
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              className="size-4 rounded border-[#3A3A3A] accent-primary"
              checked={isPublic}
              onChange={(event) => onIsPublicChange(event.currentTarget.checked)}
            />
            Public
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-[#444] px-4 py-2 text-sm font-medium text-[#999] transition hover:border-[#999] hover:text-[#D0D0D0] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={createDisabled}
            onClick={onCreate}
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ConnectionAddModal({
  error,
  onAdd,
  onClose,
  onUsernameChange,
  saving,
  username,
}: {
  error: string | null;
  onAdd: () => void;
  onClose: () => void;
  onUsernameChange: (value: string) => void;
  saving: boolean;
  username: string;
}) {
  const addDisabled = saving || normalizeUsername(username) === undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close connection modal"
        onClick={onClose}
      />
      <section className="relative w-[420px] max-w-[calc(100vw-32px)] rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <h3 className="mb-5 text-lg font-bold text-white">Add connection</h3>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-white/55">
            Username
          </span>
          <input
            type="text"
            className="h-11 w-full rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition placeholder:text-[#999]/60 focus:border-primary"
            placeholder="@username"
            value={username}
            autoFocus
            onChange={(event) => onUsernameChange(event.currentTarget.value)}
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-[#444] px-4 py-2 text-sm font-medium text-[#999] transition hover:border-[#999] hover:text-[#D0D0D0] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={addDisabled}
            onClick={onAdd}
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </section>
    </div>
  );
}

function resizeImageFile(
  file: File,
  {
    maxHeight,
    maxWidth,
  }: {
    maxHeight: number;
    maxWidth: number;
  },
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("error", () => reject(new Error("read failed")));
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("read failed"));
        return;
      }

      const image = new Image();
      image.addEventListener("error", () => reject(new Error("decode failed")));
      image.addEventListener("load", () => {
        const sourceWidth = image.naturalWidth || maxWidth;
        const sourceHeight = image.naturalHeight || maxHeight;
        const scale = Math.min(
          1,
          maxWidth / sourceWidth,
          maxHeight / sourceHeight,
        );
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas failed"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });
      image.src = reader.result;
    });

    reader.readAsDataURL(file);
  });
}

function getInitials(value: string) {
  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join("")
    .toUpperCase();
  return initials || "Q";
}

function getProfileHref(username: string | undefined) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}`
    : "/tech-stack/edit";
}

function getProductHref(username: string | undefined, slug: string) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}/${encodeURIComponent(slug)}`
    : "/products";
}

function normalizeUsername(username: string | undefined) {
  if (!username) {
    return undefined;
  }

  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  return normalizedUsername.length > 0 ? normalizedUsername : undefined;
}

function getInitialSocialLinks(
  socialLinks: SocialLink[] | undefined,
  username: string | undefined,
) {
  const cleanedLinks = normalizeSocialLinks(socialLinks ?? []);
  if (cleanedLinks.length > 0) {
    return cleanedLinks;
  }

  return username
    ? [
        {
          platform: "github",
          url: `https://github.com/${username}`,
        },
      ]
    : [];
}

function normalizeSocialLinks(socialLinks: SocialLink[]) {
  return socialLinks
    .map((link) => ({
      platform: link.platform.trim() || "website",
      url: link.url.trim(),
    }))
    .filter((link) => link.url.length > 0)
    .slice(0, MAX_SOCIAL_LINKS);
}

function getHiddenSocialPlatforms(
  socialLinks: SocialLink[],
  editingIndex: number | null,
) {
  const platforms = new Set<string>();

  for (const [index, link] of socialLinks.entries()) {
    if (index === editingIndex) {
      continue;
    }

    const platform = getSupportedSocialPlatform(link.platform);
    if (platform) {
      platforms.add(platform);
    }
  }

  return platforms;
}

function getSupportedSocialPlatform(platform: string) {
  const normalizedPlatform = platform.trim().toLowerCase();
  if (normalizedPlatform === "twitter") {
    return "x";
  }
  const matchedType = SOCIAL_TYPES.find(
    (type) => type.platform === normalizedPlatform,
  );
  return matchedType?.platform ?? null;
}

function SocialIcon({
  className,
  platform,
}: {
  className?: string;
  platform: string;
}) {
  const normalizedPlatform = platform.trim().toLowerCase();
  const matchedType = SOCIAL_TYPES.find(
    (type) => type.platform === normalizedPlatform,
  );
  if (matchedType) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("size-full fill-current", className)}
        aria-hidden="true"
      >
        <path d={matchedType.path} />
      </svg>
    );
  }

  if (normalizedPlatform === "x" || normalizedPlatform === "twitter") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("size-full fill-current", className)}
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <LinkIcon className={cn("size-full", className)} aria-hidden="true" />;
}

function getStackSummary(technologies: ProfileTechnology[]): StackSummary {
  return technologies.reduce<StackSummary>(
    (summary, technology) => {
      const categoryName = technology.categoryName.toLowerCase();
      if (categoryName.includes("frontend")) {
        return { ...summary, frontend: summary.frontend + 1 };
      }
      if (categoryName.includes("mobile")) {
        return { ...summary, mobile: summary.mobile + 1 };
      }
      if (
        categoryName.includes("backend") ||
        categoryName.includes("api") ||
        categoryName.includes("database")
      ) {
        return { ...summary, backend: summary.backend + 1 };
      }
      if (
        categoryName.includes("cloud") ||
        categoryName.includes("devops") ||
        categoryName.includes("infra") ||
        categoryName.includes("observability")
      ) {
        return { ...summary, infra: summary.infra + 1 };
      }
      return { ...summary, other: summary.other + 1 };
    },
    { backend: 0, frontend: 0, infra: 0, mobile: 0, other: 0 },
  );
}

function getProjectSummary(products: ProfileProduct[]) {
  return products.reduce(
    (summary, product) => {
      if (product.projectType === "open_source") {
        return { ...summary, openSource: summary.openSource + 1 };
      }
      if (product.projectType === "work") {
        return { ...summary, work: summary.work + 1 };
      }
      return { ...summary, personal: summary.personal + 1 };
    },
    { openSource: 0, personal: 0, work: 0 },
  );
}

function groupTechnologies(technologies: ProfileTechnology[]) {
  const categoryNames = Array.from(
    new Set(technologies.map((technology) => technology.categoryName)),
  );

  return categoryNames.map((categoryName) => ({
    categoryName,
    items: technologies.filter(
      (technology) => technology.categoryName === categoryName,
    ),
  }));
}

function formatYears(years: number | undefined) {
  if (years === undefined) {
    return "New";
  }
  return years === 1 ? "1 year" : `${years} years`;
}

function getProjectTypeLabel(projectType: string) {
  if (projectType === "open_source") {
    return "OSS";
  }
  if (projectType === "work") {
    return "Work";
  }
  return "Personal";
}

function isProductProjectType(value: string): value is ProductProjectType {
  return PROJECT_TYPE_OPTIONS.some((option) => option.value === value);
}
