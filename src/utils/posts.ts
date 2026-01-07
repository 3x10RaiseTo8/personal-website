import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

type GroupedPosts = {
  byCategory: Record<string, Post[]>;
  byTag: Record<string, Post[]>;
};

type GroupOptions = {
  category?: string;
  tag?: string;
};

/**
 * Filters out drafts & scheduled posts
 * Sorts by publishDate (newest first)
 */
export const getSortedPublishedPosts = (
  posts: Post[],
  now: Date = new Date()
): Post[] =>
  posts
    .filter(
      ({ data }) =>
        data.draft !== true &&
        data.publishDate instanceof Date &&
        data.publishDate <= now
    )
    .sort(
      (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
    );

/**
 * Groups posts by category and tags
 * Can also return posts for a single category or tag
 */
export const groupPosts = (
  posts: Post[],
  options: GroupOptions = {}
): GroupedPosts | Post[] => {
  const byCategory: Record<string, Post[]> = {};
  const byTag: Record<string, Post[]> = {};

  for (const post of posts) {
    const { category, tags = [] } = post.data;

    if (category) {
      (byCategory[category] ??= []).push(post);
    }

    for (const tag of tags) {
      (byTag[tag] ??= []).push(post);
    }
  }

  if (options.category) {
    return byCategory[options.category] ?? [];
  }

  if (options.tag) {
    return byTag[options.tag] ?? [];
  }

  return { byCategory, byTag };
};
