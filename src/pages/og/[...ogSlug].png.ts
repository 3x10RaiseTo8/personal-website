import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/siteConfig";

import { generateOgImage } from "@/utils/og";

export async function getStaticPaths() {
  const posts = await getCollection("posts");

  const postsParams = posts.map((post) => {
    return {
      params: { ogSlug: `p/${post.id}` },
      props: {
        title: post.data.title,
      },
    };
  });

  const pagesParams = [
    {
      params: { ogSlug: "default" },
      props: {
        title: SITE.description,
      },
    },
  ];

  return [...postsParams, ...pagesParams];
}

export async function GET(ctx: APIContext) {
  const title = ctx.props.title as string;

  const png = await generateOgImage(title);

  return new Response(Buffer.from(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
}
