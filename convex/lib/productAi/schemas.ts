"use node";

import { z } from "zod";

export const productMarkdownEditKindSchema = z.union([
  z.literal("replace_all"),
  z.literal("replace_selection"),
  z.literal("insert"),
  z.literal("patch"),
  z.literal("outline"),
  z.literal("comment_only"),
]);

export const productMarkdownInsertPositionSchema = z.union([
  z.literal("start"),
  z.literal("end"),
  z.literal("before_selection"),
  z.literal("after_selection"),
  z.literal("after_heading"),
]);

export const productMarkdownEditSchema = z.object({
  kind: productMarkdownEditKindSchema,
  markdown: z.string().max(16000).optional(),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().nonnegative().optional(),
  targetHeading: z.string().max(160).optional(),
  insertPosition: productMarkdownInsertPositionSchema.optional(),
});

export const productMarkdownProposalInputSchema = z.object({
  kind: productMarkdownEditKindSchema,
  title: z.string().min(1).max(90),
  summary: z.string().min(1).max(500),
  edits: z.array(productMarkdownEditSchema).min(1).max(8),
});

const productProjectTypeSchema = z.union([
  z.literal("personal"),
  z.literal("work"),
  z.literal("open_source"),
]);

const productTeamSizeSchema = z.union([
  z.literal("solo"),
  z.literal("2-5"),
  z.literal("6-10"),
  z.literal("11-30"),
  z.literal("31+"),
]);

const productTextFormEditSchema = z.object({
  field: z.union([
    z.literal("name"),
    z.literal("tagline"),
    z.literal("productUrl"),
    z.literal("githubUrl"),
  ]),
  label: z.string().min(1).max(80).optional(),
  value: z.string().max(400),
});

const productProjectTypeFormEditSchema = z.object({
  field: z.literal("projectType"),
  label: z.string().min(1).max(80).optional(),
  value: productProjectTypeSchema,
});

const productTeamSizeFormEditSchema = z.object({
  field: z.literal("teamSize"),
  label: z.string().min(1).max(80).optional(),
  value: productTeamSizeSchema,
});

const productRolesFormEditSchema = z.object({
  field: z.literal("roles"),
  label: z.string().min(1).max(80).optional(),
  value: z.array(z.string().min(1).max(80)).max(12),
});

export const productFormEditSchema = z.union([
  productTextFormEditSchema,
  productProjectTypeFormEditSchema,
  productTeamSizeFormEditSchema,
  productRolesFormEditSchema,
]);

export const productFormProposalInputSchema = z.object({
  title: z.string().min(1).max(90),
  summary: z.string().min(1).max(500),
  formEdits: z.array(productFormEditSchema).min(1).max(8),
});

export type ProductMarkdownEditKind = z.output<
  typeof productMarkdownEditKindSchema
>;
export type ProductMarkdownEdit = z.output<typeof productMarkdownEditSchema>;
export type ProductMarkdownProposalInput = z.output<
  typeof productMarkdownProposalInputSchema
>;

export type ProductMarkdownProposal = ProductMarkdownProposalInput & {
  baseContentHash: string;
};

export type ProductFormEdit = z.output<typeof productFormEditSchema>;
export type ProductFormProposalInput = z.output<
  typeof productFormProposalInputSchema
>;

export type ProductFormProposal = ProductFormProposalInput & {
  baseContentHash: string;
  edits: ProductMarkdownEdit[];
  kind: "form_update";
};

export type ProductAiProposal = ProductMarkdownProposal | ProductFormProposal;
