import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { SITE } from "./src/siteConfig";

import { remarkModifiedTime } from "./src/utils/remark-modified-time";
import { rehypeWrapTable } from "./src/utils/rehype-wrap-table";
import { getRedirects } from "./src/utils/links";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: "static",
  trailingSlash: "never",
  prefetch: { prefetchAll: true, defaultStrategy: "load" },
  integrations: [sitemap()],
  redirects: getRedirects(SITE.links),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
    rehypePlugins: [rehypeHeadingIds, rehypeWrapTable],
    shikiConfig: {
      themes: {
        light: "catppuccin-latte",
        dark: "aurora-x",
      },
    },
  },
  fonts: [
    {
      name: "Inter",
      provider: fontProviders.google(),
      cssVariable: "--font-inter",
    },
    {
      name: "Ballet",
      cssVariable: "--font-ballet",
      provider: fontProviders.google(),
    },
    {
      name: "Playfair Display",
      cssVariable: "--font-playfair-display",
      provider: fontProviders.google(),
    },
  ],
});
