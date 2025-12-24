import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // Not available with legacy API

const essays = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/essays/" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean(),
    slug: z.string(),
    publishDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
  }),
});

export const collections = { essays };
