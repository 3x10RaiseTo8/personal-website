import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // Not available with legacy API

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts/" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    draft: z.boolean(),
    slug: z.string(),
    publishDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    category: z
      .enum(["resources", "writings", "uncategorized"])
      .default("uncategorized"),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/pages/" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().nullable(),
    draft: z.boolean().optional().default(true),
    slug: z.string(),
    publishDate: z.coerce.date().optional(),
    lastModified: z.coerce.date().optional(),
  }),
});

export const collections = { posts, pages };
