"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { cn } from "@/lib/utils";

import { getProfileErrorMessage } from "../profile-error";
import {
  getProfileHref,
  normalizeUsername,
} from "../profile-links";
import {
  profileBannerGallerySchema,
  profileFormSchema,
  profileSocialLinkSchema,
  type ProfileFormValues,
  type ProfileSocialLink,
} from "../profile-form-schema";
import { BannerGalleryDialog } from "./BannerGalleryDialog";
import { ConnectionAddDialog } from "./ConnectionAddDialog";
import { ProfileConnectionsSection } from "./ProfileConnectionsSection";
import { ProfileIdentitySection } from "./ProfileIdentitySection";
import {
  getProjectSummary,
  ProfileProductsSection,
} from "./ProfileProductsSection";
import {
  getStackSummary,
  ProfileTechStackSection,
} from "./ProfileTechStackSection";
import { SocialLinkDialog } from "./SocialLinkDialog";

type ProfileContentProps = {
  onboarding: boolean;
  preloadedProfile: Preloaded<typeof api.users.getProfile>;
};

type ProfileUploadPurpose = "profile_avatar" | "profile_banner";

const DEFAULT_BANNER_SRC =
  "/background/drew-beamer-pek8uLQauMk-unsplash.jpg";
const MAX_SOCIAL_LINKS = 4;
const MAX_SOURCE_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function ProfileContent({
  onboarding,
  preloadedProfile,
}: ProfileContentProps) {
  const router = useRouter();
  const profile = usePreloadedQuery(preloadedProfile);
  const completeProfileOnboarding = useMutation(
    api.users.completeProfileOnboarding,
  );
  const createUploadIntent = useMutation(api.files.createUploadIntent);
  const finalizeUpload = useMutation(api.files.finalizeUpload);
  const initialUsername = normalizeUsername(profile?.user.username);
  const initialSocialLinks = useMemo(
    () =>
      getInitialSocialLinks(
        profile?.user.socialLinks,
        initialUsername,
      ),
    [initialUsername, profile?.user.socialLinks],
  );
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      banner: undefined,
      bio: profile?.user.bio ?? "",
      company: profile?.user.company ?? "",
      name: profile?.user.name ?? "",
      role: profile?.user.role ?? "",
      socialLinks: initialSocialLinks,
    },
    resolver: zodResolver(profileFormSchema),
  });
  const shouldStartEditing =
    profile?.needsProfileOnboarding === true &&
    (onboarding || profile.isOwner);
  const [editing, setEditing] = useState(shouldStartEditing);
  const [profileError, setProfileError] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [categoryPreview, setCategoryPreview] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<
    string | undefined
  >();
  const [bannerPreview, setBannerPreview] = useState<
    string | undefined
  >();
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [bannerFile, setBannerFile] = useState<File | undefined>();
  const [bannerGalleryOpen, setBannerGalleryOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingSocialIndex, setEditingSocialIndex] = useState<
    number | null
  >(null);
  const [connectionDialogOpen, setConnectionDialogOpen] =
    useState(false);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const bannerObjectUrlRef = useRef<string | null>(null);
  const name = useWatch({
    control: profileForm.control,
    name: "name",
  });
  const role = useWatch({
    control: profileForm.control,
    name: "role",
  });
  const company = useWatch({
    control: profileForm.control,
    name: "company",
  });
  const bio = useWatch({
    control: profileForm.control,
    name: "bio",
  });
  const socialLinks = useWatch({
    control: profileForm.control,
    name: "socialLinks",
  });
  const selectedBanner = useWatch({
    control: profileForm.control,
    name: "banner",
  });
  const hiddenSocialPlatforms = useMemo(
    () =>
      getHiddenSocialPlatforms(socialLinks, editingSocialIndex),
    [editingSocialIndex, socialLinks],
  );

  useEffect(
    () => () => {
      revokeObjectUrl(avatarObjectUrlRef);
      revokeObjectUrl(bannerObjectUrlRef);
    },
    [],
  );

  if (!profile) {
    return (
      <main className="grid h-full place-items-center bg-[#1A1A1A] px-6 text-center text-white">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
            Quine
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Profile not found
          </h1>
        </div>
      </main>
    );
  }

  const currentProfile = profile;
  const displayUsername =
    normalizeUsername(profile.user.username) ?? "unknown";
  const profileHref = getProfileHref(profile.user.username);
  const isOnboardingEdit =
    profile.needsProfileOnboarding && profile.isOwner;
  const canEdit = profile.isOwner && editing;
  const stackSummary = getStackSummary(profile.technologies);
  const projectSummary = getProjectSummary(profile.products);
  const visibleProducts = isOnboardingEdit ? [] : profile.products;
  const visibleConnections = isOnboardingEdit
    ? []
    : profile.connections;
  const secondaryColumnClassName = cn(
    "transition duration-200",
    canEdit && "pointer-events-none opacity-35",
  );
  const avatarSrc =
    avatarPreview ??
    (isOnboardingEdit ? undefined : profile.user.image);
  const bannerSrc =
    bannerPreview ??
    selectedBanner ??
    (isOnboardingEdit
      ? undefined
      : profile.user.banner ?? DEFAULT_BANNER_SRC);
  const formError =
    profileForm.formState.errors.name?.message ??
    profileForm.formState.errors.role?.message ??
    profileForm.formState.errors.company?.message ??
    profileForm.formState.errors.bio?.message;
  const activeSocialLink =
    editingSocialIndex === null
      ? null
      : socialLinks[editingSocialIndex] ?? null;

  function handleEditButton() {
    if (!currentProfile.isOwner) {
      return;
    }
    if (!editing) {
      setEditing(true);
      return;
    }
    void profileForm.handleSubmit(saveProfile)();
  }

  async function saveProfile(values: ProfileFormValues) {
    setProfileError(null);
    setSaving(true);
    try {
      const [profileImageStorageId, bannerStorageId] =
        await Promise.all([
          avatarFile === undefined
            ? undefined
            : uploadProfileImage(avatarFile, "profile_avatar"),
          bannerFile === undefined
            ? undefined
            : uploadProfileImage(bannerFile, "profile_banner"),
        ]);
      const selectedGalleryBanner =
        bannerFile === undefined ? values.banner : undefined;

      await completeProfileOnboarding({
        ...(selectedGalleryBanner === undefined
          ? {}
          : {
              banner: selectedGalleryBanner,
              bannerStorageId: null,
            }),
        ...(bannerStorageId === undefined
          ? {}
          : { bannerStorageId }),
        bio: values.bio,
        company: values.company,
        name: values.name,
        ...(profileImageStorageId === undefined
          ? {}
          : { profileImageStorageId }),
        role: values.role,
        socialLinks: values.socialLinks,
      });

      revokeObjectUrl(avatarObjectUrlRef);
      revokeObjectUrl(bannerObjectUrlRef);
      setAvatarFile(undefined);
      setAvatarPreview(undefined);
      setBannerFile(undefined);
      setBannerPreview(undefined);
      profileForm.reset({ ...values, banner: undefined });
      setEditing(false);
      router.replace(getProfileHref(currentProfile.user.username));
    } catch (unknownError: unknown) {
      setProfileError(getProfileErrorMessage(unknownError));
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfileImage(
    file: File,
    purpose: ProfileUploadPurpose,
  ): Promise<Id<"_storage">> {
    const { uploadIntentId, uploadUrl } = await createUploadIntent({
      purpose,
    });
    const response = await fetch(uploadUrl, {
      body: file,
      headers: {
        "Content-Type": file.type,
      },
      method: "POST",
    });
    const payload: unknown = await response.json();
    if (
      !response.ok ||
      !isRecord(payload) ||
      typeof payload.storageId !== "string"
    ) {
      throw new Error("PROFILE_UPLOAD_FAILED");
    }
    const storageId = payload.storageId as Id<"_storage">;
    await finalizeUpload({ storageId, uploadIntentId });
    return storageId;
  }

  function openSocialDialog(index: number | null) {
    if (!canEdit) {
      return;
    }
    if (index !== null && socialLinks[index] === undefined) {
      return;
    }
    setEditingSocialIndex(index);
    setSocialDialogOpen(true);
  }

  function closeSocialDialog() {
    setSocialDialogOpen(false);
    setEditingSocialIndex(null);
  }

  function saveSocialLink(link: ProfileSocialLink) {
    const nextLinks =
      editingSocialIndex === null
        ? socialLinks.length >= MAX_SOCIAL_LINKS
          ? socialLinks
          : [...socialLinks, link]
        : socialLinks.map((currentLink, index) =>
            index === editingSocialIndex ? link : currentLink,
          );
    profileForm.setValue("socialLinks", nextLinks, {
      shouldDirty: true,
      shouldValidate: true,
    });
    closeSocialDialog();
  }

  function removeSocialLink() {
    if (editingSocialIndex === null) {
      return;
    }
    profileForm.setValue(
      "socialLinks",
      socialLinks.filter(
        (_, index) => index !== editingSocialIndex,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
    closeSocialDialog();
  }

  function selectBannerFromGallery(src: string) {
    const parsedBanner = profileBannerGallerySchema.safeParse(src);
    if (!parsedBanner.success) {
      setProfileError("Choose a banner from the available gallery.");
      return;
    }
    revokeObjectUrl(bannerObjectUrlRef);
    setBannerFile(undefined);
    setBannerPreview(undefined);
    profileForm.setValue("banner", parsedBanner.data, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setBannerGalleryOpen(false);
  }

  function handleAvatarSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    handleImageSelection(
      event,
      setAvatarPreview,
      setAvatarFile,
      avatarObjectUrlRef,
      setProfileError,
    );
  }

  function handleBannerSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const accepted = handleImageSelection(
      event,
      setBannerPreview,
      setBannerFile,
      bannerObjectUrlRef,
      setProfileError,
    );
    if (accepted) {
      profileForm.setValue("banner", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
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
          <ProfileIdentitySection
            avatarSrc={avatarSrc}
            bannerSrc={bannerSrc}
            bio={bio}
            canEdit={canEdit}
            company={company}
            displayBio={profile.user.bio ?? ""}
            displayCompany={profile.user.company ?? ""}
            displayName={
              profile.user.name ?? displayUsername
            }
            displayUsername={displayUsername}
            editing={editing}
            error={profileError ?? formError ?? null}
            isOwner={profile.isOwner}
            name={name}
            onAvatarChange={handleAvatarSelection}
            onBannerChange={handleBannerSelection}
            onBioChange={(value) =>
              profileForm.setValue("bio", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onCompanyChange={(value) =>
              profileForm.setValue("company", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onEdit={handleEditButton}
            onNameChange={(value) =>
              profileForm.setValue("name", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onOpenBannerGallery={() =>
              setBannerGalleryOpen(true)
            }
            onOpenSocialLink={openSocialDialog}
            onRoleChange={(value) =>
              profileForm.setValue("role", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            projectSummary={projectSummary}
            role={role}
            saving={saving}
            socialLinks={socialLinks}
            stackSummary={stackSummary}
          />

          <section
            className={cn(
              "flex min-h-0 flex-col gap-5",
              secondaryColumnClassName,
            )}
          >
            <ProfileTechStackSection
              categoryPreview={categoryPreview}
              technologies={profile.technologies}
              onCategoryPreviewChange={setCategoryPreview}
            />
            {categoryPreview ? null : (
              <ProfileProductsSection
                onCreate={
                  profile.isOwner && !isOnboardingEdit
                    ? () => router.push("/products/new")
                    : undefined
                }
                products={visibleProducts}
                username={profile.user.username}
              />
            )}
          </section>

          {categoryPreview ? null : (
            <ProfileConnectionsSection
              className={secondaryColumnClassName}
              connections={visibleConnections}
              limit={
                isOnboardingEdit ? 0 : profile.connectionLimit
              }
              onAdd={
                profile.isOwner && !isOnboardingEdit
                  ? () => setConnectionDialogOpen(true)
                  : undefined
              }
            />
          )}
        </div>
      </main>

      {bannerGalleryOpen ? (
        <BannerGalleryDialog
          onClose={() => setBannerGalleryOpen(false)}
          onSelect={selectBannerFromGallery}
        />
      ) : null}

      {socialDialogOpen ? (
        <SocialLinkDialog
          hiddenPlatforms={hiddenSocialPlatforms}
          initialValue={activeSocialLink}
          onClose={closeSocialDialog}
          onDelete={removeSocialLink}
          onSave={saveSocialLink}
        />
      ) : null}

      {connectionDialogOpen ? (
        <ConnectionAddDialog
          onClose={() => setConnectionDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}

function getInitialSocialLinks(
  links:
    | readonly {
        platform: string;
        url: string;
      }[]
    | undefined,
  username: string | undefined,
): ProfileSocialLink[] {
  const parsedLinks = (links ?? []).flatMap((link) => {
    const parsed = profileSocialLinkSchema.safeParse(link);
    return parsed.success ? [parsed.data] : [];
  });
  if (parsedLinks.length > 0 || !username) {
    return parsedLinks;
  }
  return [
    {
      platform: "github",
      url: `https://github.com/${encodeURIComponent(username)}`,
    },
  ];
}

function getHiddenSocialPlatforms(
  socialLinks: ProfileSocialLink[],
  editingIndex: number | null,
): Set<string> {
  return new Set(
    socialLinks.flatMap((link, index) =>
      index === editingIndex ? [] : [link.platform],
    ),
  );
}

function handleImageSelection(
  event: ChangeEvent<HTMLInputElement>,
  setPreview: (value: string | undefined) => void,
  setFile: (value: File | undefined) => void,
  objectUrlRef: { current: string | null },
  setError: (message: string | null) => void,
): boolean {
  const input = event.currentTarget;
  const file = input.files?.[0];
  input.value = "";
  if (!file) {
    return false;
  }
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
    setError("Use a JPEG, PNG, WebP, or GIF image.");
    return false;
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    setError("Image must be 6MB or smaller.");
    return false;
  }

  revokeObjectUrl(objectUrlRef);
  const previewUrl = URL.createObjectURL(file);
  objectUrlRef.current = previewUrl;
  setFile(file);
  setPreview(previewUrl);
  setError(null);
  return true;
}

function revokeObjectUrl(reference: { current: string | null }) {
  if (reference.current) {
    URL.revokeObjectURL(reference.current);
    reference.current = null;
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
