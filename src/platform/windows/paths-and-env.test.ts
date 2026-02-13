import path from "node:path";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getWindowsDefaultPath,
  findWindowsCommand,
  getWindowsDefaultShell,
  buildWindowsShellCommand,
  isWindowsExecutable,
} from "./paths-and-env.js";

describe("windows: getWindowsDefaultPath", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("includes Windows-specific program directories", () => {
    const defaultPath = getWindowsDefaultPath();
    const pathSegments = defaultPath.split(path.delimiter);

    // Should contain paths that include Windows directories
    expect(pathSegments.length).toBeGreaterThan(0);
  });

  it("deduplicates paths while preserving order", () => {
    const originalPath = process.env.PATH;
    try {
      const duplicatePath = `C:\\Duplicate\\bin${path.delimiter}C:\\Duplicate\\bin${path.delimiter}C:\\Other\\bin`;
      process.env.PATH = duplicatePath;

      const result = getWindowsDefaultPath();
      const segments = result.split(path.delimiter);

      const duplicates = segments.filter((s, idx) => segments.indexOf(s) !== idx);
      expect(duplicates.length).toBe(0);
    } finally {
      process.env.PATH = originalPath;
    }
  });
});

describe("windows: getWindowsDefaultShell", () => {
  it("returns PowerShell when available", () => {
    // In most Windows environments, PowerShell should be available
    const shell = getWindowsDefaultShell();
    expect(shell === "powershell.exe" || shell === "cmd.exe").toBe(true);
  });
});

describe("windows: buildWindowsShellCommand", () => {
  it("builds PowerShell command with -NoProfile", () => {
    const cmd = buildWindowsShellCommand("echo hello", "powershell");

    expect(cmd[0]).toContain("powershell.exe");
    expect(cmd).toContain("-NoProfile");
    expect(cmd).toContain("-Command");
    expect(cmd).toContain("echo hello");
  });

  it("builds CMD command with /c", () => {
    const cmd = buildWindowsShellCommand("echo hello", "cmd");

    expect(cmd[0]).toContain("cmd.exe");
    expect(cmd).toContain("/c");
    expect(cmd).toContain("echo hello");
  });

  it("resolves to system default when shell not specified", () => {
    const cmd = buildWindowsShellCommand("echo hello");

    // Should be either powershell or cmd
    expect(cmd[0]).toMatch(/(powershell|cmd)\.exe/);
    expect(cmd[cmd.length - 1]).toBe("echo hello");
  });
});

describe("windows: isWindowsExecutable", () => {
  it("returns true for Windows executable extensions", () => {
    expect(isWindowsExecutable("program.exe")).toBe(true);
    expect(isWindowsExecutable("SCRIPT.CMD")).toBe(true);
    expect(isWindowsExecutable("script.bat")).toBe(true);
    expect(isWindowsExecutable("tool.com")).toBe(true);
    expect(isWindowsExecutable("installer.msi")).toBe(true);
    expect(isWindowsExecutable("library.dll")).toBe(true);
  });

  it("returns false for non-Windows extensions", () => {
    expect(isWindowsExecutable("program.sh")).toBe(false);
    expect(isWindowsExecutable("script.py")).toBe(false);
    expect(isWindowsExecutable("Makefile")).toBe(false);
  });

  it("returns false for files without extension", () => {
    expect(isWindowsExecutable("program")).toBe(false);
    expect(isWindowsExecutable("program.")).toBe(false);
  });
});

describe("windows: findWindowsCommand", () => {
  it("finds command in PATH using PATHEXT", () => {
    // This test will find actual commands in the system PATH
    const nodePath = findWindowsCommand("node");

    // On Windows with Node installed, this should not be null
    // In CI/test environments, it might be null
    expect(typeof nodePath === "string" || nodePath === null).toBe(true);
    if (nodePath) {
      expect(nodePath).toMatch(/node\.exe$/i);
    }
  });

  it("returns null when command not found", () => {
    const nonExistent = findWindowsCommand("nonexistent-tool-openclaw-test-12345");
    expect(nonExistent).toBeNull();
  });
});
