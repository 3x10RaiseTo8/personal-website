import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified, rehypeHeadingIds } from "@astrojs/markdown-remark";
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
    processor: unified({
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
    }),
    shikiConfig: {
      themes: {
        light: "catppuccin-latte",
        dark: "aurora-x",
      },
    },
  },
  fonts: [
    {
      name: "Libertinus Serif Display",
      cssVariable: "--font-serif-display",
      provider: fontProviders.fontsource(),
      // Default included:
      weights: [400],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      formats: ["woff2"],
    },
    {
      provider: fontProviders.local(),
      name: "Libertinus Serif Initials",
      cssVariable: "--font-fancy",
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/Libertinus/LibertinusSerifInitials-Regular-subset.woff2",
            ],
            weight: "normal",
            style: "normal",
          },
        ],
      },
      fallbacks: ["serif"],
    },
    {
      name: "Libertinus Serif",
      cssVariable: "--font-serif",
      provider: fontProviders.fontsource(),
      // Default included:
      weights: [400, 700],
      styles: ["normal", "italic"],
      // subsets: ["latin"],
      fallbacks: ["serif"],
      formats: ["woff2"],
    },
    {
      name: "Libertinus Serif",
      cssVariable: "--font-serif",
      provider: fontProviders.local(),
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/Libertinus/LibertinusSerif-Regular.woff2",
            ],
            weight: 400,
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/Libertinus/LibertinusSerif-Italic.woff2"],
            weight: 400,
            style: "italic",
          },
          {
            src: ["./src/assets/fonts/Libertinus/LibertinusSerif-Bold.woff2"],
            weight: 700,
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/Libertinus/LibertinusSerif-BoldItalic.woff2",
            ],
            weight: 700,
            style: "italic",
          },
        ],
      },
    },
    {
      name: "Libertinus Serif Display",
      cssVariable: "--font-serif-display",
      provider: fontProviders.local(),
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            src: [
              "./src/assets/fonts/Libertinus/LibertinusSerifDisplay-Regular.woff2",
            ],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],

  vite: {
    plugins: [qrcode()],
  },
});
