import path from "node:path";
import { describe, expect, it } from "vitest";
import { ensureOpenClawCliOnPath } from "./path-env.js";

describe("ensureOpenClawCliOnPath - Windows-only", () => {
  it("prepends the bundled app bin dir when a sibling openclaw.exe exists", () => {
    const originalPath = process.env.PATH;
    const originalFlag = process.env.OPENCLAW_PATH_BOOTSTRAPPED;
    process.env.PATH = "C:\\Windows\\System32";
    delete process.env.OPENCLAW_PATH_BOOTSTRAPPED;
    try {
      ensureOpenClawCliOnPath({
        execPath: "C:\\Program Files\\OpenClaw\\node.exe",
        cwd: "C:\\temp",
        homeDir: "C:\\Users\\test",
      });
      const updated = process.env.PATH ?? "";
      expect(updated.split(path.delimiter)[0]).toBe("C:\\Program Files\\OpenClaw");
    } finally {
      process.env.PATH = originalPath;
      if (originalFlag === undefined) {
        delete process.env.OPENCLAW_PATH_BOOTSTRAPPED;
      } else {
        process.env.OPENCLAW_PATH_BOOTSTRAPPED = originalFlag;
      }
    }
  });

  it("is idempotent", () => {
    const originalPath = process.env.PATH;
    const originalFlag = process.env.OPENCLAW_PATH_BOOTSTRAPPED;
    process.env.PATH = "C:\\Windows\\System32";
    process.env.OPENCLAW_PATH_BOOTSTRAPPED = "1";
    try {
      ensureOpenClawCliOnPath({
        execPath: "C:\\does-not-matter\\node.exe",
        cwd: "C:\\temp",
        homeDir: "C:\\Users\\test",
      });
      expect(process.env.PATH).toBe("C:\\Windows\\System32");
    } finally {
      process.env.PATH = originalPath;
      if (originalFlag === undefined) {
        delete process.env.OPENCLAW_PATH_BOOTSTRAPPED;
      } else {
        process.env.OPENCLAW_PATH_BOOTSTRAPPED = originalFlag;
      }
    }
  });

  it("prepends Windows-specific program directories", () => {
    const originalPath = process.env.PATH;
    const originalFlag = process.env.OPENCLAW_PATH_BOOTSTRAPPED;
    process.env.PATH = "C:\\Windows\\System32";
    delete process.env.OPENCLAW_PATH_BOOTSTRAPPED;
    try {
      ensureOpenClawCliOnPath({
        cwd: "C:\\temp",
        homeDir: "C:\\Users\\test",
      });
      const updated = process.env.PATH ?? "";
      const parts = updated.split(path.delimiter);
      expect(updated).toContain("AppData");
      expect(parts.some(seg => seg.toLowerCase().includes("nodejs"))).toBe(true);
    } finally {
      process.env.PATH = originalPath;
      if (originalFlag === undefined) {
        delete process.env.OPENCLAW_PATH_BOOTSTRAPPED;
      } else {
        process.env.OPENCLAW_PATH_BOOTSTRAPPED = originalFlag;
      }
    }
  });
});
