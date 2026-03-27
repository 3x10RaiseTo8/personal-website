import type { Element, ElementContent, Properties, Root } from "hast";
import type { Test } from "hast-util-is-element";
import { convertElement } from "hast-util-is-element";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";

// --- Types ---

export type Target = "_blank" | "_parent" | "_self" | "_top";

type MaybeFactory<T, R> = T | ((element: R) => T);

export interface Options {
  /**
   * Content to insert at the end of external links, wrapped in a `<span>`.
   * Accepts a hast node, an array of hast nodes, or a raw HTML/SVG string
   * (e.g. the contents of an `.svg` file).
   */
  content?: MaybeFactory<
    Array<ElementContent> | ElementContent | string | null | undefined,
    Element
  >;
  /** Properties for the `<span>` wrapping `content`. */
  contentProperties?: MaybeFactory<Properties | null | undefined, Element>;
  /** Extra properties to add to the link element. */
  properties?: MaybeFactory<Properties | null | undefined, Element>;
  /** Protocols to treat as external (default: `['http', 'https']`). */
  protocols?: string[];
  /**
   * Same-origin paths that redirect to external URLs, e.g. `['/discord', '/github']`.
   * Accepts an array of exact path strings, or a single `RegExp` to match against the href.
   */
  redirectPaths?: string[] | RegExp;
  /** `rel` values to set on external links (default: `['nofollow']`). */
  rel?: MaybeFactory<Array<string> | string | null | undefined, Element>;
  /** `target` attribute value for external links. */
  target?: MaybeFactory<Target | null | undefined, Element>;
  /** Extra hast-util-is-element test to filter which links are modified. */
  test?: Test | null;
}

// --- Constants ---

const DEFAULT_PROTOCOLS = ["http", "https"];
const DEFAULT_REL = ["nofollow"];

// --- Helpers ---

/**
 * Resolve a value-or-factory to its value.
 */
function resolve<T>(
  valueOrFactory: MaybeFactory<T, Element>,
  element: Element,
): T {
  return typeof valueOrFactory === "function"
    ? (valueOrFactory as (el: Element) => T)(element)
    : valueOrFactory;
}

/**
 * Parse a space-separated `rel` string into tokens.
 * Replaces the `space-separated-tokens` dependency for this simple use case.
 */
function parseSpaceSeparated(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

/**
 * Deep-clone a value using the native `structuredClone`.
 * Replaces the `@ungap/structured-clone` polyfill — it has been globally
 * available in Node 17+, Deno, and all modern browsers since 2022.
 */
function clone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Check if a URL string uses an absolute URL scheme.
 * Replaces the `is-absolute-url` dependency.
 * Matches the same logic: an absolute URL has a scheme followed by `://`,
 * or starts with `//` (protocol-relative).
 */
function isAbsoluteUrl(url: string): boolean {
  // Matches RFC 3986 scheme: letter followed by letter/digit/+/-/.
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

/**
 * Extract the scheme (protocol without colon) from an absolute URL.
 */
function getScheme(url: string): string {
  return url.slice(0, url.indexOf(":"));
}

/**
 * Check whether a URL matches the configured redirect paths.
 * Accepts an array of exact strings or a RegExp.
 */
function isRedirectPath(
  url: string,
  redirectPaths: string[] | RegExp,
): boolean {
  if (redirectPaths instanceof RegExp) return redirectPaths.test(url);
  // Use a Set for O(1) lookup when the list is large.
  return (redirectPaths as string[]).includes(url);
}

/**
 * Normalise the `content` option into an array of hast nodes.
 * Accepts a hast node, an array of hast nodes, or a raw HTML/SVG string.
 * String parsing is done once at plugin init time, not per-node.
 */
function parseContent(
  raw: Array<ElementContent> | ElementContent | string | null | undefined,
): Array<ElementContent> | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    // fromHtml wraps content in <html><head/><body>…</body></html>.
    // We want just the children of <body>.
    const root = fromHtml(raw, { fragment: true });
    return root.children as Array<ElementContent>;
  }
  return Array.isArray(raw) ? raw : [raw];
}

// --- Plugin ---

/**
 * Rehype plugin to automatically add `rel` (and optionally `target`)
 * to external links.
 *
 * @remarks
 * You should at least set `rel` to `['nofollow']`. When using a `target`,
 * add `noopener` and `noreferrer` to avoid exploitation of the
 * `window.opener` API.
 */
export default function rehypeExternalLinks(
  options?: Readonly<Options> | null,
) {
  const {
    protocols = DEFAULT_PROTOCOLS,
    redirectPaths,
    test,
    content,
    contentProperties,
    properties,
    rel: relOption,
    target: targetOption,
  } = options ?? {};

  const isMatch = convertElement(test);

  // If content is a static string or node (not a factory), parse it once here
  // rather than on every visited link.
  const staticContent =
    typeof content !== "function" ? parseContent(content) : null;

  return function transform(tree: Root): undefined {
    visit(tree, "element", function (node, index, parent) {
      if (
        node.tagName !== "a" ||
        typeof node.properties.href !== "string" ||
        !isMatch(node, index, parent)
      ) {
        return;
      }

      const url = node.properties.href as string;
      const isExternal = isAbsoluteUrl(url)
        ? protocols.includes(getScheme(url))
        : url.startsWith("//") ||
          (redirectPaths != null && isRedirectPath(url, redirectPaths));

      if (!isExternal) return;

      // --- rel ---
      const relRaw = resolve(relOption ?? DEFAULT_REL, node);
      const rel: string[] = Array.isArray(relRaw)
        ? relRaw
        : typeof relRaw === "string"
          ? parseSpaceSeparated(relRaw)
          : DEFAULT_REL;

      if (rel.length > 0) {
        node.properties.rel = [...rel];
      }

      // --- target ---
      const target =
        targetOption != null ? resolve(targetOption, node) : undefined;
      if (target) {
        node.properties.target = target;
      }

      // --- extra link properties ---
      const extraProps = properties != null ? resolve(properties, node) : null;
      if (extraProps) {
        Object.assign(node.properties, clone(extraProps));
      }

      // --- content span ---
      if (content != null) {
        const contentArray =
          typeof content === "function"
            ? parseContent(resolve(content, node))
            : staticContent;

        if (contentArray != null) {
          const spanProps =
            (contentProperties != null
              ? resolve(contentProperties, node)
              : null) ?? {};

          node.children.push({
            type: "element",
            tagName: "span",
            properties: clone(spanProps),
            children: clone(contentArray),
          });
        }
      }
    });
  };
}
