import { execSync } from "node:child_process";
import { dirname } from "node:path";
import type { Root } from "mdast";
import type { VFile } from "vfile";

export function remarkModifiedTime() {
  return function (tree: Root, file: VFile) {
    const filepath = file.history[0];
    if (!filepath) return;

    const dirName = dirname(filepath);

    try {
      const result = execSync(
        `git log -1 --pretty="format:%cI" -- "${filepath}"`,
        {
          encoding: "utf-8",
          cwd: dirName,
          // Prevent the command from hanging indefinitely
          timeout: 5000,
        },
      ).trim(); // <-- always trim whitespace/newlines

      const data = file.data as any;
      if (!data.astro?.frontmatter) return;

      if (!result) {
        // File is untracked or has no commits — fall back to now, or skip
        console.warn(
          `[remarkModifiedTime] No git history for: ${filepath}. Falling back to current time.`,
        );
        data.astro.frontmatter.lastModified = new Date().toISOString();
        return;
      }

      // Validate the date before storing it
      const date = new Date(result);
      if (isNaN(date.getTime())) {
        console.warn(
          `[remarkModifiedTime] Git returned an invalid date "${result}" for: ${filepath}`,
        );
        data.astro.frontmatter.lastModified = new Date().toISOString();
        return;
      }

      data.astro.frontmatter.lastModified = date.toISOString();
    } catch (error) {
      console.warn(`[remarkModifiedTime] Error for ${filepath}:`, error);
    }
  };
}
