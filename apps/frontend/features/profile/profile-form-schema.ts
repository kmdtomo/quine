import { z } from "zod";

export type ProfileSocialPlatform =
  | "facebook"
  | "github"
  | "instagram"
  | "linkedin"
  | "website"
  | "x"
  | "youtube";

export const profileSocialPlatforms: readonly ProfileSocialPlatform[] = [
  "facebook",
  "github",
  "instagram",
  "linkedin",
  "website",
  "x",
  "youtube",
];

export const profileSocialLinkSchema = z.object({
  platform: z.enum(
    [
      "facebook",
      "github",
      "instagram",
      "linkedin",
      "website",
      "x",
      "youtube",
    ],
    {
      error: "Choose a supported social platform.",
    },
  ),
  url: z
    .string()
    .trim()
    .max(2_048, "Social link is too long.")
    .refine(isSafeHttpUrl, "Use a valid http or https URL."),
});

export const profileBannerGallerySchema = z.enum(
  [
    "/background/drew-beamer-pek8uLQauMk-unsplash.jpg",
    "/lp/tech_stack_bg.jpg",
    "/background/ivan-bandura-WhIff5iuW-E-unsplash.jpg",
    "/profile/banner-city.jpg",
    "/profile/banner-aurora.jpg",
    "/profile/banner-field.jpg",
  ],
  {
    error: "Choose a banner from the available gallery.",
  },
);

export const profileFormSchema = z
  .object({
    banner: profileBannerGallerySchema.optional(),
    bio: z.string().trim().max(120, "Bio must be 120 characters or fewer."),
    company: z
      .string()
      .trim()
      .min(1, "Company is required.")
      .max(100, "Company is too long."),
    name: z
      .string()
      .trim()
      .min(1, "Display name is required.")
      .max(80, "Display name is too long."),
    role: z
      .string()
      .trim()
      .min(1, "Role is required.")
      .max(80, "Role is too long."),
    socialLinks: z
      .array(profileSocialLinkSchema)
      .max(4, "You can add up to four social links."),
  })
  .superRefine((value, ctx) => {
    const platforms = new Set<string>();
    for (const [index, link] of value.socialLinks.entries()) {
      if (platforms.has(link.platform)) {
        ctx.addIssue({
          code: "custom",
          message: "Each social platform can only be added once.",
          path: ["socialLinks", index, "platform"],
        });
      }
      platforms.add(link.platform);
    }
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileSocialLink = z.infer<typeof profileSocialLinkSchema>;
function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}
