import rss from "@astrojs/rss";
import { SITE } from "../siteConfig";
import { getPosts } from "@/utils/posts";

export async function GET(context: { site: string }) {
  const posts = await getPosts();

  return rss({
    title: SITE.title.concat(SITE.titleSuffix),
    description: SITE.description,

    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,
    trailingSlash: false,

    // Array of `<item>`s in output xml
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/p/${post.id}`,
      pubDate: post.data.publishDate,
      categories: [...(post.data.tags || [])],
      author: SITE.author,
    })),

    // (optional) inject custom xml
    customData: `<generator>https://astro.build</generator><webMaster>${SITE.links[0].text}</webMaster><image>${new URL(SITE.defaultOgImage, context.site)}</image><ttl>10</ttl><docs>https://www.rssboard.org/rss-specification</docs><language>${SITE.lang}</language><copyright>${SITE.copyrightText}</copyright><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    // stylesheet: "/rss/pretty-feed-v3.xsl",
  });
}
