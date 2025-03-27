import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // Not available with legacy API

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./content/posts/" }),
});

export const collections = { blog };
