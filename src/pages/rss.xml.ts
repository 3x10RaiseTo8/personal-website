import rss from "@astrojs/rss";
import { SITE } from "../siteConfig";

export function GET(context: { site: string }) {
  return rss({
    title: "abhishe blog",
    description: SITE.description,

    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,

    // Array of `<item>`s in output xml
    items: [],

    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}
