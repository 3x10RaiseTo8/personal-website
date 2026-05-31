import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { slug as slugify } from "github-slugger";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TagInfo {
  /** Original label preserved from the first occurrence in the collection. */
  label: string;
  /** URL-safe slug derived from the label via github-slugger. */
  slug: string;
  /** Number of visible posts (non-draft in prod) that carry this tag. */
  postCount: number;
}

export interface SerializedPost {
  id: string;
  title: string;
  description: string;
  /** ISO 8601 string. */
  publishDate: string;
  /**
   * ISO 8601 string when present in frontmatter, otherwise null.
   * The remark-modified-time fallback is only available after render() and
   * is handled at the individual post page level, not here.
   */
  lastModified: string | null;
  /** Original tag labels (not slugified) as authored in frontmatter. */
  tags: string[];
}

// ── Private helpers ────────────────────────────────────────────────────────────

const normalizeTag = (tag: string): string => slugify(tag);

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const byPublishDateDesc = (
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">,
): number => b.data.publishDate.getTime() - a.data.publishDate.getTime();

/**
 * Returns true when the post should be included in the current environment.
 * Drafts are visible in development and hidden in production.
 */
const shouldFilterDrafts = (post: CollectionEntry<"posts">): boolean =>
  import.meta.env.DEV || !post.data.draft;

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns all posts sorted by publishDate descending.
 * Draft posts are included in development and excluded in production.
 */
export const getPosts = async (): Promise<CollectionEntry<"posts">[]> =>
  (await getCollection("posts", shouldFilterDrafts)).sort(byPublishDateDesc);

/**
 * Returns posts that include at least one of the provided tags (OR semantics).
 * Tag comparison is normalised (slugified), so casing and spacing do not matter.
 * Passing an empty array is equivalent to calling getAllPosts().
 *
 * @example
 * const posts = await getPostsByTags(["TypeScript", "astro"]);
 */
export const getPostsByTags = async (
  tags: string[],
): Promise<CollectionEntry<"posts">[]> => {
  if (!tags.length) return getPosts();

  const normalizedTags = new Set(tags.map(normalizeTag));
  const posts = await getPosts();

  return posts
    .filter((post) =>
      post.data.tags.some((tag) => normalizedTags.has(normalizeTag(tag))),
    )
    .sort(byPublishDateDesc);
};

/**
 * Returns all unique tags across the provided posts, or across all posts when
 * none are provided. Tag labels preserve the casing/spacing of their first
 * occurrence in the collection. Results are sorted alphabetically by slug.
 *
 * @example
 * const tags = await getTags();
 * // or for a filtered subset:
 * const tags = await getTags(await getPostsByTags(["web"]));
 */
export const getTags = async (
  posts?: CollectionEntry<"posts">[],
): Promise<TagInfo[]> => {
  const source = posts ?? (await getPosts());
  const tagMap = new Map<string, TagInfo>();

  for (const post of source) {
    for (const tag of post.data.tags) {
      const tagSlug = normalizeTag(tag);
      const existing = tagMap.get(tagSlug);

      if (existing) {
        existing.postCount += 1;
      } else {
        tagMap.set(tagSlug, {
          label: capitalize(tag),
          slug: tagSlug,
          postCount: 1,
        });
      }
    }
  }

  // Sort alphabetically ⬇️
  // return [...tagMap.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  // Sort by postCount descending ⬇️
  return [...tagMap.values()].sort((a, b) => b.postCount - a.postCount);
};

/**
 * Converts CollectionEntry posts into plain, JSON-serialisable objects for
 * client-side consumption (e.g. passing to PostList.astro via a data attribute).
 * Preserves the original output order — call getAllPosts() beforehand to get
 * the default publishDate-descending sort.
 */
export function serializePosts(
  posts: CollectionEntry<"posts">[],
): SerializedPost[] {
  return posts.map(({ id, data }) => ({
    id,
    title: data.title,
    description: data.description,
    publishDate: data.publishDate.toISOString(),
    lastModified: data.lastModified?.toISOString() ?? null,
    tags: data.tags,
  }));
}
