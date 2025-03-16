import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders"; // Not available with legacy API

const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./test-private" }),
});

export const collections = { blog };
