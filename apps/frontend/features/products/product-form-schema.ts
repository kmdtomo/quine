import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(2048, "URL must be 2,048 characters or fewer.")
  .refine(
    (value) => value.length === 0 || URL.canParse(value),
    "Enter a valid URL.",
  );

export const productEditFormSchema = z.object({
  content: z
    .string()
    .trim()
    .max(4000, "Content must be 4,000 characters or fewer."),
  githubUrl: optionalUrl,
  isPublic: z.boolean(),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(80, "Product name must be 80 characters or fewer."),
  productUrl: optionalUrl,
  projectType: z.enum(["personal", "work", "open_source"]),
  roles: z
    .array(z.string().trim().min(1).max(48))
    .max(8, "Select at most 8 roles."),
  tagline: z
    .string()
    .trim()
    .min(1, "Product tagline is required.")
    .max(140, "Product tagline must be 140 characters or fewer."),
  teamSize: z.union([
    z.literal(""),
    z.enum(["solo", "2-5", "6-10", "11-30", "31+"]),
  ]),
  technologyKeys: z.array(z.string().min(1)).max(40),
});

export type ProductEditFormValues = z.infer<typeof productEditFormSchema>;
