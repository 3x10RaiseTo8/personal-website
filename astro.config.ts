import { defineConfig } from "astro/config";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [],
  output: "static",
});
