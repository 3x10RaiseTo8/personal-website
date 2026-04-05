import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { SITE } from "./src/siteConfig";

import { remarkModifiedTime } from "./src/utils/remark-modified-time";
import { rehypeWrapTable } from "./src/utils/rehype-wrap-table";
import { getRedirectsList, getRedirectsMap } from "./src/utils/links";
import rehypeExternalLinks from "./src/utils/rehype-external-links";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: "static",
  trailingSlash: "never",
  prefetch: { prefetchAll: true, defaultStrategy: "load" },
  integrations: [sitemap()],
  redirects: getRedirectsMap(SITE.links),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeWrapTable,
      [
        rehypeExternalLinks,
        {
          redirectPaths: getRedirectsList(SITE.links),
          target: "_blank",
          rel: ["noopener", "noreferrer", "nofollow"],
          properties: {
            className: ["external-link"], // styles in globals.css
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        { behavior: "append", content: { type: "text", value: "¶" } },
      ],
    ],
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
      cssVariable: "--font-sans",
      provider: fontProviders.google(),
      display: "block",
      // variationSettings: "'wdth' 75",
      // Default included:
      // weights: [400] ,
      // styles: ["normal", "italic"],
      // subsets: [],
      fallbacks: ["sans-serif"],
      formats: ["woff2"],
    },
    {
      name: "Noto Sans JP",
      cssVariable: "--font-jp",
      provider: fontProviders.google(),
      // Default included:
      // weights: [300],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      // fallbacks: ["sans-serif"],
      // formats: ["woff2"],
    },
    {
      name: "Noto Sans Symbols",
      cssVariable: "--font-symbols",
      provider: fontProviders.google(),
      // Default included:
      // weights: [300],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      // fallbacks: ["sans-serif"],
      // formats: ["woff2"],
    },
    {
      name: "Noto Sans Symbols 2",
      cssVariable: "--font-symbols-2",
      provider: fontProviders.google(),
      // Default included:
      // weights: [300],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      // fallbacks: ["sans-serif"],
      // formats: ["woff2"],
    },
    {
      name: "MonteCarlo",
      cssVariable: "--font-fancy",
      provider: fontProviders.google(),
      display: "block",
      // Default included:
      // weights: [400],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      // formats: ["woff2"],
    },
    {
      name: "Instrument Serif",
      cssVariable: "--font-serif-display",
      provider: fontProviders.google(),
      display: "block",
      // Default included:
      weights: [400],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      formats: ["woff2", "woff"],
    },
  ],
});
