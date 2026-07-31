"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { GlassModal } from "@/components/glass-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  profileSocialLinkSchema,
  type ProfileSocialLink,
} from "../schema";
import { SOCIAL_TYPES, SocialIcon } from "./profile-social";

export function SocialLinkDialog({
  hiddenPlatforms,
  initialValue,
  onClose,
  onDelete,
  onSave,
}: {
  hiddenPlatforms: Set<string>;
  initialValue: ProfileSocialLink | null;
  onClose: () => void;
  onDelete: () => void;
  onSave: (link: ProfileSocialLink) => void;
}) {
  const form = useForm<ProfileSocialLink>({
    defaultValues: initialValue ?? {
      platform: "github",
      url: "",
    },
    resolver: zodResolver(profileSocialLinkSchema),
  });
  const selectedPlatform = useWatch({
    control: form.control,
    name: "platform",
  });
  const visibleSocialTypes = SOCIAL_TYPES.filter(
    (type) =>
      !hiddenPlatforms.has(type.platform) ||
      selectedPlatform === type.platform,
  );
  const error =
    form.formState.errors.url?.message ??
    form.formState.errors.platform?.message;

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
      <form
        onSubmit={form.handleSubmit(onSave)}
        noValidate
      >
        <h3
          className="text-xl font-bold tracking-tight text-white"
          id="social-link-modal-title"
        >
          {initialValue ? "Edit social link" : "Add social link"}
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
                onClick={() =>
                  form.setValue(
                    "platform",
                    type.platform,
                    { shouldValidate: true },
                  )
                }
              >
                <SocialIcon
                  platform={type.platform}
                  className="size-[18px]"
                />
              </button>
            ))}
          </div>
          <input
            type="url"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:bg-white/[0.06]"
            placeholder="https://..."
            autoComplete="off"
            {...form.register("url")}
          />
          {error ? (
            <p className="text-xs text-red-300">{error}</p>
          ) : null}
          <div className="flex items-center justify-end gap-2 pt-1.5">
            {initialValue ? (
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
              type="submit"
              className="h-9 rounded-full bg-white px-4 font-semibold text-zinc-950 shadow-lg hover:bg-zinc-100"
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </GlassModal>
  );
}
