// src/pages/site.webmanifest.ts
import type { APIRoute } from "astro";
import { SITE } from "@/siteConfig";

export const GET: APIRoute = () => {
  const manifest = {
    name: SITE.author.concat(" — ", SITE.domain),
    short_name: SITE.domain,
    description: SITE.description,
    start_url: "/",
    lang: SITE.lang,
    dir: SITE.dir,
    orientation: "natural",
    display: SITE.websiteAppDisplay,
    theme_color: SITE.websiteThemeColor,
    background_color: SITE.websiteBackgroundColor,
    icons: SITE.websiteAppIcons,
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
