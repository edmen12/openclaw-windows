import os from "node:os";
import path from "node:path";

const WINDOWS_DEFAULT_PATH_SEGMENTS = [
  path.join(os.homedir(), "AppData", "Local", "Programs", "Python"),
  path.join(os.homedir(), "AppData", "Local", "Programs", "nodejs"),
  path.join(os.homedir(), "AppData", "Roaming", "npm"),
  path.join(os.homedir(), "AppData", "Local", "Programs", "Git", "bin"),
  path.join(os.homedir(), "AppData", "Local", "Programs", "Git", "usr", "bin"),
  path.join(process.env.ProgramFiles || "", "OpenSSH"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Git", "bin"),
].filter(Boolean);

/**
 * Get the default PATH for Windows.
 * This is used as a fallback the the system doesn't have NODE_PATH set.
 */
export function getWindowsDefaultPath(): string {
  const systemPath = process.env.PATH ?? "";
  const pathParts = systemPath.split(path.delimiter);

  // Add Windows-specific common paths to the front
  const augmented = [...WINDOWS_DEFAULT_PATH_SEGMENTS, ...pathParts];

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const part of augmented) {
    if (!seen.has(part)) {
      seen.add(part);
      deduplicated.push(part);
    }
  }

  return deduplicated.join(path.delimiter);
}

/**
 * Find a command in Windows PATH.
 * This is a Windows-native replacement for `/usr/bin/env which`.
 */
export function findWindowsCommand(command: string): string | null {
  const pathSegments = (process.env.PATH ?? "").split(path.delimiter);

  const extensions = process.env.PATHEXT?.split(path.delimiter) ?? [".COM", ".EXE", ".BAT", ".CMD"];

  for (const dir of pathSegments) {
    for (const ext of extensions) {
      const fullPath = path.join(dir, command + ext);
      try {
        // Check if file exists without blocking
        const fs = require("node:fs");
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      } catch {
        // continue
      }
    }
  }

  return null;
}

/**
 * Get the default shell for Windows.
 * Prefers PowerShell, falls back to CMD.
 */
export function getWindowsDefaultShell(): string {
  if (isPowerShellAvailable()) {
    return "powershell.exe";
  }
  return "cmd.exe";
}

/**
 * Check if PowerShell is available on this Windows system.
 */
function isPowerShellAvailable(): boolean {
  try {
    const fs = require("node:fs");
    const psPath = path.join(
      process.env.SystemRoot || "C:\\Windows",
      "System32",
      "WindowsPowerShell",
      "v1.0",
      "powershell.exe",
    );
    return fs.existsSync(psPath);
  } catch {
    return false;
  }
}

/**
 * Build a shell command for Windows.
 */
export function buildWindowsShellCommand(command: string, shell?: "powershell" | "cmd"): string[] {
  const defaultShell = getWindowsDefaultShell().includes("powershell") ? "powershell" : "cmd";
  const actualShell = shell ?? defaultShell;

  if (actualShell === "powershell") {
    return ["powershell.exe", "-NoProfile", "-Command", command];
  }

  // CMD: wrap in cmd /c
  return ["cmd.exe", "/c", command];
}

/**
 * Check if this is a Windows executable (has .exe, .bat, .cmd extension).
 */
export function isWindowsExecutable(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [".exe", ".bat", ".cmd", ".com", ".msi", ".dll"].includes(ext);
}
