import { defineConfig } from "astro/config";
import { SITE } from "./src/siteConfig";

import { remarkModifiedTime } from "./src/utils/remark-modified-time";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [],
  output: "static",
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
    "/linkedin": "https://www.linkedin.com/in/abhishek7x/",
    "/twitter": "https://x.com/now7x",
    "/x": "https://x.com/now7x",
    "/github": "https://github.com/3x10RaiseTo8",
  },
});
