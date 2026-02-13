import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir.js";

describe("resolvePreferredOpenClawTmpDir - Windows-only", () => {
  it("returns os.tmpdir()/openclaw on Windows", () => {
    const customTmp = "C:\\Users\\test\\AppData\\Local\\Temp";
    const result = resolvePreferredOpenClawTmpDir({ tmpdir: () => customTmp });
    expect(result).toBe(path.join(customTmp, "openclaw"));
  });

  it("uses os.tmpdir() by default", () => {
    const result = resolvePreferredOpenClawTmpDir();
    expect(result).toMatch(/openclaw$/);
    expect(result).toMatch(/(Temp|temp|TMP)$/);
  });
});
