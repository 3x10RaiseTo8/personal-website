import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts/" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean(),
    publishDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),

    category: z
      .enum(["resources", "writings", "uncategorized"])
      .default("uncategorized")
      .optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/pages/" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    draft: z.boolean().optional().default(true),
    slug: z.string().slugify(),
    publishDate: z.coerce.date().optional(),
    lastModified: z.coerce.date().optional(),
  }),
});

export const collections = { posts, pages };
