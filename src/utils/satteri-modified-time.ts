// satteri-modified-time.ts
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineMdastPlugin } from "satteri";

function getLastModified(filepath: string): string {
  const fallback = () => new Date().toISOString();

  try {
    const result = execFileSync(
      "git",
      ["log", "-1", "--pretty=format:%cI", "--", filepath],
      {
        encoding: "utf-8",
        cwd: dirname(filepath),
        timeout: 5000,
      },
    ).trim();

    if (!result) {
      console.warn(
        `[modifiedTime] No git history for: ${filepath}. Falling back to current time.`,
      );
      return fallback();
    }

    const date = new Date(result);
    if (isNaN(date.getTime())) {
      console.warn(
        `[modifiedTime] Git returned an invalid date "${result}" for: ${filepath}`,
      );
      return fallback();
    }

    return date.toISOString();
  } catch (error) {
    console.warn(`[modifiedTime] Error for ${filepath}:`, error);
    return fallback();
  }
}

export const modifiedTime = defineMdastPlugin({
  name: "modified-time",

  // Runs exactly once per document, regardless of which nodes it contains.
  before(_root, ctx) {
    // Was: file.history[0]
    if (ctx.fileURL?.protocol !== "file:") return;

    // Was: file.data.astro.frontmatter
    const frontmatter = (ctx.data as any).astro?.frontmatter;
    if (!frontmatter) return;

    frontmatter.lastModified = getLastModified(fileURLToPath(ctx.fileURL));
  },
});
