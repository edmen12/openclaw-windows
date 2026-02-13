import os from "node:os";
import path from "node:path";

type ResolvePreferredOpenClawTmpDirOptions = {
  tmpdir?: () => string;
};

export function resolvePreferredOpenClawTmpDir(
  options: ResolvePreferredOpenClawTmpDirOptions = {},
): string {
  const tmpdir = options.tmpdir ?? os.tmpdir;

  // Windows: Use %TEMP%\openclaw
  return path.join(tmpdir(), "openclaw");
}
