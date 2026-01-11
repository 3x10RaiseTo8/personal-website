import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/siteConfig";

import { remarkModifiedTime } from "./src/utils/remark-modified-time";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [sitemap()],
  output: "static",
  trailingSlash: "never",
  markdown: {
    remarkPlugins: [remarkModifiedTime],
    shikiConfig: {
      themes: {
        light: "catppuccin-latte",
        dark: "aurora-x",
      },
    },
  },
  redirects: {
    "/talent":
      "https://docs.google.com/forms/d/e/1FAIpQLScYNoiJFctAxkgqDF564bJ_dij1HM4269V8S-9WcNla7PQVzA/viewform?usp=dialog",
    "/linkedin": SITE.contacts.linkedin!,
    "/twitter": SITE.contacts.twitter!,
    "/x": SITE.contacts.twitter!,
    "/github": SITE.contacts.github!,
  },
});
