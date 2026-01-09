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
        `git log -1 --pretty="format:%cI" "${filepath}"`,
        {
          encoding: "utf-8",
          cwd: dirName,
        }
      );

      // We use type assertion (as any) here because Astro's internal
      // frontmatter type isn't always exported in a standard way
      const data = file.data as any;
      if (data.astro?.frontmatter) {
        data.astro.frontmatter.lastModified = result.toString();
      }
    } catch (error) {
      console.warn(`Remark Plugin errrrrrror for ${filepath}:`, error);
    }
  };
}
