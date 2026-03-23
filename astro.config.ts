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
      name: "Noto Sans",
      provider: fontProviders.google(),
      cssVariable: "--font-body",
      // Default included:
      // weights: [400] ,
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      // fallbacks: ["sans-serif"],
      // formats: ["woff2"],
    },
    {
      name: "Noto Sans",
      provider: fontProviders.google(),
      cssVariable: "--font-symbols",
      // Default included:
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      // fallbacks: ["sans-serif"],
      // formats: ["woff2"],
    },
    {
      name: "Ballet",
      cssVariable: "--font-first-character",
      provider: fontProviders.google(),
      // Default included:
      // weights: [400] ,
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      // formats: ["woff2"],
    },
    {
      name: "Instrument Serif",
      cssVariable: "--font-display",
      provider: fontProviders.google(),
      // Default included:
      weights: [400],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      // formats: ["woff2"],
    },
  ],
});
