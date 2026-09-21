import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { qrcode } from "vite-plugin-qrcode";

import { satteri } from "@astrojs/markdown-satteri";
import { satteriSlug } from "satteri-slug";
import satteriAutolinkHeadings from "satteri-autolink-headings";

import { modifiedTime } from "@/utils/satteri-modified-time";
import { externalLinks } from "@/utils/satteri-external-links";
import { wrapTable } from "@/utils/satteri-wrap-table";

import { getRedirectsList, getRedirectsMap } from "@/utils/links";
import { SITE } from "@/siteConfig";

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
    processor: satteri({
      features: {
        gfm: true,
        frontmatter: true,
        math: true,
        headingAttributes: true,
        wikilinks: true,
        smartPunctuation: true,
        rawHtml: true,
      },
      mdastPlugins: [modifiedTime],
      hastPlugins: [
        satteriSlug(),
        externalLinks({
          properties: {
            className: ["external-link"],
            rel: ["noopener"],
            target: "_blank",
          },
          hrefsToInclude: getRedirectsList(SITE.links),
          searchParams: { utm_source: SITE.domain },
          internalHosts: [SITE.domain],
        }),
        satteriAutolinkHeadings({
          behavior: "append",
          properties: { className: ["heading-link"] },
        }),
        wrapTable,
      ],
    }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  fonts: [
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
