import rss from "@astrojs/rss";
import { SITE } from "../siteConfig";
import { getCollection } from "astro:content";
import { getSortedPublishedPosts } from "@/utils/posts";

export async function GET(context: { site: string }) {
  const allPosts = await getCollection("posts");
  const sortedPublishedPosts = await getSortedPublishedPosts(allPosts);

  return rss({
    title: SITE.title.concat(SITE.titleSuffix),
    description: SITE.description,

    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,
    trailingSlash: false,

    // Array of `<item>`s in output xml
    items: sortedPublishedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/p/${post.id}`,
      categories: post.data.tags,
      author: SITE.author,
    })),

    // (optional) inject custom xml
    customData: `<generator>https://astro.build</generator><webMaster>${SITE.links[0].text}</webMaster><image>${new URL(SITE.defaultOgImage, context.site)}</image><ttl>10</ttl><docs>https://www.rssboard.org/rss-specification</docs><language>${SITE.lang}</language><copyright>${SITE.copyrightText}</copyright><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    stylesheet: "/rss/pretty-feed-v3.xsl",
  });
}
