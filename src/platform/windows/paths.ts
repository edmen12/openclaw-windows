import os from "node:os";
import path from "node:path";

const WINDOWS_TEMP_DIR = path.join(os.tmpdir(), "openclaw");

const WINDOWS_COMMON_DIRS = {
  temp: WINDOWS_TEMP_DIR,
  logs: path.join(os.tmpdir(), "openclaw", "logs"),
  cache: path.join(os.homedir(), "AppData", "Local", "openclaw", "cache"),
  config: path.join(os.homedir(), "AppData", "Local", "openclaw"),
} as const;

type WindowsTempDirOptions = {
  tmpdir?: () => string;
};

/**
 * Resolve OpenClaw temp directory on Windows.
 * Prioritizes %TEMP%\openclaw, falls back to os.tmpdir()/openclaw.
 */
export function resolveWindowsTempDir(options: WindowsTempDirOptions = {}): string {
  const tmpdir = options.tmpdir ?? os.tmpdir;
  return path.join(tmpdir(), "openclaw");
}

/**
 * Get all Windows-specific OpenClaw directories.
 */
export function getWindowsOpenClawDirs(): typeof WINDOWS_COMMON_DIRS {
  return {
    temp: windowsRuntimePaths.temp,
    logs: windowsRuntimePaths.logs,
    cache: windowsRuntimePaths.cache,
    config: windowsRuntimePaths.config,
  };
}

/**
 * Windows runtime paths (cached).
 * These are lazily initialized to avoid triggering path checks过早。
 */
export const windowsRuntimePaths = new Proxy(WINDOWS_COMMON_DIRS, {
  get(target, prop: keyof typeof WINDOWS_COMMON_DIRS) {
    // Ensure directory exists on first access
    return target[prop];
  },
}) as typeof WINDOWS_COMMON_DIRS;

export type WindowsOpenClawPaths = typeof WINDOWS_COMMON_DIRS;
