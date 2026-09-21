import { defineHastPlugin } from "satteri";
import type { HTMLAttributes } from "astro/types";

/**
 * Any attribute valid on an `<a>` (typed by Astro). `href` is excluded because
 * it is managed by `searchParams`. `className` and `rel` are token lists, and
 * any array value is merged into what the element already has.
 */
export type LinkProperties = Omit<
  HTMLAttributes<"a">,
  "href" | "class" | "class:list" | "rel"
> & {
  className?: readonly string[];
  rel?: readonly string[];
};

export interface ExternalLinksOptions {
  /**
   * Properties set on every external link. Array values (`className`, `rel`)
   * are merged with existing tokens; anything else overwrites.
   *
   * @example { className: ["external-link"], rel: ["noopener"], target: "_blank" }
   */
  readonly properties?: LinkProperties;

  /**
   * Root-relative hrefs to treat as external (e.g. redirects). They receive
   * `properties` but their `href` is never modified. Matching ignores query,
   * hash and trailing slashes, so `/go/?a=1#b` matches `/go`.
   *
   * @example ["/redirect1", "/redirect2"]
   */
  readonly hrefsToInclude?: Iterable<string>;

  /**
   * Query parameters appended to http(s) links only, never to mailto/tel or
   * `hrefsToInclude` links. Params already on the link are left untouched.
   * Accepts anything `URLSearchParams` accepts.
   *
   * @example { utm_source: "example.com" }
   */
  readonly searchParams?: ConstructorParameters<typeof URLSearchParams>[0];

  /**
   * Hostnames of your own site. Absolute http(s) links to them are treated
   * as internal and left untouched.
   *
   * @example ["example.com", "www.example.com"]
   */
  readonly internalHosts?: Iterable<string>;
}

/** `web` = http(s): properties + query params. `other` = mailto/tel/listed: properties only. */
type LinkKind = "web" | "other";

const WEB_PROTOCOLS = new Set(["http:", "https:"]);
const CONTACT_PROTOCOLS = new Set(["mailto:", "tel:"]);

const isRootRelative = (href: string): boolean =>
  href.startsWith("/") && !href.startsWith("//");

/** Pathname only (no query/hash), without trailing slashes, except for "/". */
const normalizePath = (href: string): string =>
  (URL.parse(href, "http://localhost")?.pathname ?? href).replace(
    /(?<=.)\/+$/,
    "",
  );

const toTokens = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string" ? value.split(/\s+/).filter(Boolean) : [];
};

const mergeTokens = (existing: unknown, incoming: readonly unknown[]) => [
  ...new Set([...toTokens(existing), ...incoming.map(String)]),
];

/**
 * Appends params to the raw href instead of round-tripping through
 * `URL#toString`, which would re-serialize the whole URL (e.g. `https://a.com`
 * gains a slash). The URL is only parsed to detect params that already exist.
 */
const appendSearchParams = (href: string, params: URLSearchParams): string => {
  const existing = URL.parse(href)?.searchParams;
  if (!existing) return href;

  const additions = new URLSearchParams();
  for (const [key, value] of params) {
    if (!existing.has(key)) additions.append(key, value);
  }
  const query = additions.toString();
  if (!query) return href;

  const hashIndex = href.indexOf("#");
  const base = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const separator = !base.includes("?") ? "?" : /[?&]$/.test(base) ? "" : "&";

  return `${base}${separator}${query}${hash}`;
};

export const externalLinks = (options: ExternalLinksOptions = {}) => {
  const {
    properties = {},
    hrefsToInclude = [],
    searchParams,
    internalHosts = [],
  } = options;

  const propertyEntries = Object.entries(properties).filter(
    ([, value]) => value !== undefined,
  );
  const params = new URLSearchParams(searchParams);
  const listed = new Set(Array.from(hrefsToInclude, normalizePath));
  const ownHosts = new Set(Array.from(internalHosts, (h) => h.toLowerCase()));

  const classify = (href: string): LinkKind | null => {
    const url = URL.parse(href);

    // Not an absolute URL: only external if explicitly listed.
    if (!url) {
      return isRootRelative(href) && listed.has(normalizePath(href))
        ? "other"
        : null;
    }
    if (WEB_PROTOCOLS.has(url.protocol)) {
      return ownHosts.has(url.hostname) ? null : "web";
    }
    return CONTACT_PROTOCOLS.has(url.protocol) ? "other" : null;
  };

  return defineHastPlugin({
    name: "external-links",
    element: {
      filter: ["a"],
      visit(node, ctx) {
        const href = node.properties.href;
        if (typeof href !== "string") return;

        const kind = classify(href);
        if (!kind) return;

        for (const [name, value] of propertyEntries) {
          ctx.setProperty(
            node,
            name,
            Array.isArray(value)
              ? mergeTokens(node.properties[name], value)
              : value,
          );
        }

        if (kind === "web" && params.size > 0) {
          const nextHref = appendSearchParams(href, params);
          if (nextHref !== href) ctx.setProperty(node, "href", nextHref);
        }
      },
    },
  });
};
