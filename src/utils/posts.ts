import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

type FilterParams = {
  category?: string;
  tag?: string;
};

/**
 * Filters out drafts & scheduled posts in non-development modes,
 * then sorts by publishDate (newest first)
 */
export const getSortedPublishedPosts = (
  posts: Post[],
  now: Date = new Date()
): Post[] => {
  const shouldFilter = import.meta.env.MODE !== "development";

  return posts
    .filter(({ data }) =>
      shouldFilter ? data.draft !== true && data.publishDate <= now : true
    )
    .sort(
      (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
    );
};

/**
 * Filters posts by category and/or tag
 */
export const getFilteredPosts = (
  posts: Post[],
  { category, tag }: FilterParams = {}
): Post[] => {
  if (category) {
    posts = posts.filter(({ data }) => data.category === category);
  }

  if (tag) {
    posts = posts.filter(({ data }) => data.tags?.includes(tag));
  }

  return posts;
};

/**
 * Gets all unique categories or tags from the provided posts sorted alphabetically
 */
export const getUniqueValues = (
  posts: Post[],
  key: "category" | "tag"
): string[] => {
  const values = new Set<string>();

  for (const post of posts) {
    if (key === "category") {
      if (post.data.category) {
        values.add(post.data.category);
      }
    } else {
      const tags = post.data.tags ?? [];
      tags.forEach((tag) => values.add(tag));
    }
  }

  return Array.from(values).sort();
};
