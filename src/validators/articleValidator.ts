import { z } from "zod";

const createCoupletSchema = z.object({
  en: z.string().optional(),
  hi: z.string().optional(),
  ur: z.string().optional(),
});

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
  couplets: z.array(createCoupletSchema).optional(),
  summary: z.string().optional(),
  slug: z.string().min(1, "Slug is required.").max(200, "Slug is too long."),
  coverImage: z.any().optional(), // For file input
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).default("published").optional(),
  metaDescription: z
    .string()
    .max(300, "Meta description cannot exceed 300 characters")
    .optional(),
  metaKeywords: z
    .string()
    .max(200, "Meta keywords cannot exceed 200 characters")
    .optional(),
  removeCoverImage: z.boolean().optional(),
  poetId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Poet ID format")
    .min(1, "Poet is required."),
});

export type CreateArticleSchema = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = z
  .object({
    title: z.string().min(1, "Title is required.").optional(), // Make optional for partial updates
    content: z.string().min(1, "Content is required.").optional(),
    couplets: z.array(createCoupletSchema).optional(), // Corrected to match createCoupletSchema
    summary: z.string().optional(),
    slug: z
      .string()
      .min(1, "Slug is required.")
      .max(200, "Slug is too long.")
      .optional(),
    coverImage: z.any().optional(), // For file input
    category: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
    metaDescription: z
      .string()
      .max(300, "Meta description cannot exceed 300 characters")
      .optional(),
    metaKeywords: z
      .string()
      .max(200, "Meta keywords cannot exceed 200 characters")
      .optional(),
    poetId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Poet ID format")
      .optional(), // Make optional for partial updates
    removeCoverImage: z.boolean().optional(), // New field for removing image
  })
  .partial(); // Keep partial for flexibility in updates

export type UpdateArticleSchema = z.infer<typeof updateArticleSchema>;
