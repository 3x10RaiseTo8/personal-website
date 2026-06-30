import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { qrcode } from "vite-plugin-qrcode";

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
  compressHTML: "jsx",
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
        {
          behavior: "append",
          properties: { className: ["heading-link"] },
          content: { type: "text", value: "" },
        },
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
      provider: fontProviders.local(),
      name: "Latin Modern Roman 10",
      cssVariable: "--font-serif",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/lmfont/lmroman10-regular.woff2"],
            weight: "normal",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/lmfont/lmroman10-bold.woff2"],
            weight: "bold",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/lmfont/lmroman10-italic.woff2"],
            weight: "normal",
            style: "italic",
          },
          {
            src: ["./src/assets/fonts/lmfont/lmroman10-bolditalic.woff2"],
            weight: "bold",
            style: "italic",
          },
        ],
      },
      fallbacks: ["serif"],
    },
    {
      provider: fontProviders.local(),
      name: "Latin Modern Roman 17",
      cssVariable: "--font-serif-display",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/lmfont/lmroman17-regular.woff2"],
            weight: "normal",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/lmfont/lmroman17-oblique.woff2"],
            weight: "normal",
            style: "italic",
          },
        ],
      },
      fallbacks: ["serif"],
    },
    // {
    //   name: "Old Standard TT",
    //   cssVariable: "--font-serif",
    //   provider: fontProviders.google(),
    //   display: "block",
    //   // Default included:
    //   // weights: [400],
    //   // styles: ["normal", "italic"],
    //   // subsets: ["latin"],
    //   fallbacks: ["serif"],
    //   formats: ["woff2"],
    // },
    // {
    //   name: "Instrument Serif",
    //   cssVariable: "--font-serif-display",
    //   provider: fontProviders.google(),
    //   display: "block",
    //   // Default included:
    //   // weights: [400],
    //   // styles: ["normal", "italic"],
    //   // subsets: ["latin"],
    //   fallbacks: ["serif"],
    //   formats: ["woff2"],
    // },
    {
      name: "MonteCarlo",
      cssVariable: "--font-fancy",
      provider: fontProviders.google(),
      // Default included:
      // weights: [400],
      // styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      // formats: ["woff2"],
    },
  ],
  vite: {
    plugins: [qrcode()],
  },
});
