import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi, afterEach, beforeAll } from "vitest";
import { IS_WINDOWS } from "./index.js";
import {
  getWindowsDefaultPath,
  findWindowsCommand,
  buildWindowsShellCommand,
  isWindowsExecutable,
} from "./paths-and-env.js";
import { resolveWindowsTempDir, getWindowsOpenClawDirs } from "./paths.js";
import {
  loadWindowsShellEnvFallback,
  getWindowsShellForEnvLoading,
  isWindowsPowerShellEnvAvailable,
} from "./shell-env.js";

describe("platform/windows - Windows platform integration tests", () => {
  let _originalPlatform: string;

  beforeAll(() => {
    _originalPlatform = process.platform;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("IS_WINDOWS constant", () => {
    it("matches Node.js process.platform", () => {
      const expected = process.platform === "win32";
      expect(IS_WINDOWS).toBe(expected);
    });
  });

  describe("resolveWindowsTempDir", () => {
    it("returns os.tmpdir()/openclaw", () => {
      const tmpdir = os.tmpdir();
      const result = resolveWindowsTempDir();
      expect(result).toBe(path.join(tmpdir, "openclaw"));
    });

    it("accepts custom tmpdir option", () => {
      const customTmp = "D:\\Custom\\Temp";
      const result = resolveWindowsTempDir({ tmpdir: () => customTmp });
      expect(result).toBe(path.join(customTmp, "openclaw"));
    });
  });

  describe("getWindowsOpenClawDirs", () => {
    it("returns all Windows paths", () => {
      const dirs = getWindowsOpenClawDirs();

      expect(dirs.temp).toMatch(/openclaw$/);
      expect(dirs.logs).toContain("logs");
      expect(dirs.cache).toContain("cache");
      expect(dirs.config).toContain("Local");
    });
  });

  describe("Windows shell environment loading integration", () => {
    it("is disabled by default", () => {
      const env: NodeJS.ProcessEnv = {};
      const logger = { warn: vi.fn() };

      const result = loadWindowsShellEnvFallback({
        enabled: false,
        env,
        expectedKeys: ["OPENAI_API_KEY"],
        logger,
      });

      expect(result.ok).toBe(true);
      expect(result.applied).toEqual([]);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("skips when already has keys", () => {
      const env: NodeJS.ProcessEnv = { OPENAI_API_KEY: "existing" };
      const logger = { warn: vi.fn() };

      const result = loadWindowsShellEnvFallback({
        enabled: true,
        env,
        expectedKeys: ["OPENAI_API_KEY"],
        logger,
      });

      expect(result.ok).toBe(true);
      expect(result.applied).toEqual([]);
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("Windows shell detection", () => {
    it("returns PowerShell by default when PSModulePath is set", () => {
      const originalPSModulePath = process.env.PSModulePath;
      process.env.PSModulePath = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules";

      const shell = getWindowsShellForEnvLoading();
      expect(shell).toBe("powershell.exe");

      process.env.PSModulePath = originalPSModulePath;
    });

    it("detects PowerShell availability", () => {
      const result = isWindowsPowerShellEnvAvailable();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Windows PATH integration", () => {
    it("includes Windows-specific paths", () => {
      const defaultPath = getWindowsDefaultPath();
      const segments = defaultPath.split(path.delimiter);

      expect(segments.length).toBeGreaterThan(0);
      expect(segments.length).toBeGreaterThanOrEqual(5); // At least the default segments
    });

    it("handles empty PATH gracefully", () => {
      const originalPath = process.env.PATH;
      delete process.env.PATH;

      const result = getWindowsDefaultPath();
      expect(result.split(path.delimiter)).toBeDefined();

      process.env.PATH = originalPath;
    });
  });

  describe("Windows command finding", () => {
    it("finds executables in PATH", () => {
      // Testing with system commands that might exist
      const cmdPath = findWindowsCommand("cmd");

      if (process.platform === "win32") {
        // On Windows, cmd.exe should be found
        expect(cmdPath).not.toBeNull();
        if (cmdPath) {
          expect(cmdPath.toLowerCase()).toMatch(/cmd\.exe$/);
        }
      }
    });

    it("returns null for non-existent commands", () => {
      const result = findWindowsCommand("this-command-should-not-exist-xyz123");
      expect(result).toBeNull();
    });
  });

  describe("Windows executable detection", () => {
    it("recognizes Windows executable extensions", () => {
      expect(isWindowsExecutable("test.exe")).toBe(true);
      expect(isWindowsExecutable("script.bat")).toBe(true);
      expect(isWindowsExecutable("program.cmd")).toBe(true);
      expect(isWindowsExecutable("tool.com")).toBe(true);
    });

    it("rejects non-Windows extensions", () => {
      expect(isWindowsExecutable("test.sh")).toBe(false);
      expect(isWindowsExecutable("script.py")).toBe(false);
    });
  });

  describe("Windows shell command building", () => {
    it("builds PowerShell commands correctly", () => {
      const cmd = buildWindowsShellCommand("echo hello", "powershell");

      expect(cmd.length).toBe(4);
      expect(cmd[0]).toMatch(/powershell\.exe$/i);
      expect(cmd[1]).toBe("-NoProfile");
      expect(cmd[2]).toBe("-Command");
      expect(cmd[3]).toBe("echo hello");
    });

    it("builds CMD commands correctly", () => {
      const cmd = buildWindowsShellCommand("echo hello", "cmd");

      expect(cmd.length).toBe(3);
      expect(cmd[0]).toMatch(/cmd\.exe$/i);
      expect(cmd[1]).toBe("/c");
      expect(cmd[2]).toBe("echo hello");
    });

    it("uses default shell when not specified", () => {
      const cmd = buildWindowsShellCommand("echo hello");

      expect(cmd.length).toBeGreaterThanOrEqual(3);
      expect(
        ["powershell.exe", "cmd.exe"].map((s) => s.toLowerCase()).includes(cmd[0].toLowerCase()),
      ).toBe(true);
    });
  });
});
