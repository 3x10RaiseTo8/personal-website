import { execSync } from "child_process";
import path from "path";

export function getLastModified(
  filePath: string,
  repoDir = "."
): string | null {
  try {
    const fullPath = path.resolve(filePath);
    const output = execSync(`git log -1 --format=%ci -- "${fullPath}"`, {
      encoding: "utf-8",
      cwd: repoDir, // Run inside the correct repo (submodule)
    }).trim();

    return output;
  } catch (e) {
    console.error("Failed to get last modified:", e);
    return null;
  }
}
