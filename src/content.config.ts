import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // Not available with legacy API

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts/" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean(),
    layout: z.string().optional(),
    publishDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    slug: z.string(),
  }),
});

export const collections = { posts };
