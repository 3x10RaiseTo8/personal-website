/**
 * Footer links
 * - If redirects exist → use first redirect
 * - If empty → use original href
 */
export function getFooterLinks<
  T extends {
    redirects: readonly string[];
    href: string;
    footer: boolean;
  },
>(links: readonly T[]) {
  return links
    .filter((l) => l.footer)
    .map((l) => ({
      ...l,
      url: l.redirects.length > 0 ? l.redirects[0] : l.href,
    }));
}

/**
 * For Astro redirects config
 */
export function getRedirectsMap<
  T extends {
    redirects: readonly string[];
    href: string;
  },
>(links: readonly T[]) {
  return Object.fromEntries(
    links.flatMap((l) => l.redirects.map((path) => [path, l.href] as const)),
  );
}

/**
 * For rehype external links plugin to mark redirects as external as well
 */
export function getRedirectsList<
  T extends {
    redirects: readonly string[];
  },
>(links: readonly T[]) {
  return links.flatMap((l) => l.redirects);
}
