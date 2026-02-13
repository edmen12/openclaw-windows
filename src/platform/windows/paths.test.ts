import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { getWindowsOpenClawDirs, resolveWindowsTempDir } from "./paths.js";

describe("windows: resolveWindowsTempDir", () => {
  it("returns os.tmpdir() / openclaw on Windows", () => {
    vi.spyOn(os, "tmpdir").mockReturnValue("C:\\Users\\test\\AppData\\Local\\Temp");

    const result = resolveWindowsTempDir();
    expect(result).toBe(path.join("C:\\Users\\test\\AppData\\Local\\Temp", "openclaw"));

    vi.restoreAllMocks();
  });

  it("allows custom tmpdir function", () => {
    const customTmpdir = vi.fn(() => "D:\\Custom\\Temp");
    const result = resolveWindowsTempDir({ tmpdir: customTmpdir });

    expect(result).toBe(path.join("D:\\Custom\\Temp", "openclaw"));
    expect(customTmpdir).toHaveBeenCalled();
  });
});

describe("windows: getWindowsOpenClawDirs", () => {
  it("returns platform-specific paths", () => {
    const dirs = getWindowsOpenClawDirs();

    expect(dirs.temp).toMatch(/openclaw$/);
    expect(dirs.logs).toContain("logs");
    expect(dirs.cache).toContain("cache");
    expect(dirs.config).toContain("Local");
  });

  it("uses os.tmpdir() for temp directory", () => {
    vi.spyOn(os, "tmpdir").mockReturnValue("C:\\Users\\test\\AppData\\Local\\Temp");

    const dirs = getWindowsOpenClawDirs();
    expect(dirs.temp).toContain("Temp");
    expect(dirs.temp).toContain("openclaw");

    vi.restoreAllMocks();
  });

  it("uses homedir for config directory", () => {
    const homedir = os.homedir();
    const dirs = getWindowsOpenClawDirs();

    expect(dirs.config).toContain("Local");
    expect(dirs.config).toContain(homedir);
  });
});
