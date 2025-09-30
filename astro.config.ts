import { defineConfig } from "astro/config";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [],
  output: "static",
  markdown: {
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
  },
});
