import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isTruthyEnvValue } from "./env.js";

type EnsureOpenClawPathOpts = {
  execPath?: string;
  cwd?: string;
  homeDir?: string;
  pathEnv?: string;
};

function isExecutable(filePath: string): boolean {
  try {
    const ext = path.extname(filePath).toLowerCase();
    return [".exe", ".bat", ".cmd", ".com"].includes(ext) && fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function mergePath(params: { existing: string; prepend: string[] }): string {
  const partsExisting = params.existing
    .split(path.delimiter)
    .map((part) => part.trim())
    .filter(Boolean);
  const partsPrepend = params.prepend.map((part) => part.trim()).filter(Boolean);

  const seen = new Set<string>();
  const merged: string[] = [];
  for (const part of [...partsPrepend, ...partsExisting]) {
    if (!seen.has(part)) {
      seen.add(part);
      merged.push(part);
    }
  }
  return merged.join(path.delimiter);
}

function candidateBinDirs(opts: EnsureOpenClawPathOpts): string[] {
  const execPath = opts.execPath ?? process.execPath;
  const cwd = opts.cwd ?? process.cwd();
  const homeDir = opts.homeDir ?? os.homedir();

  const candidates: string[] = [];

  // Bundled Windows app: `openclaw.exe` lives next to the executable
  try {
    const execDir = path.dirname(execPath);
    const siblingCli = path.join(execDir, "openclaw.exe");
    if (isExecutable(siblingCli)) {
      candidates.push(execDir);
    }
  } catch {
    // ignore
  }

  // Project-local installs: node_modules/.bin
  const localBinDir = path.join(cwd, "node_modules", ".bin");
  if (isExecutable(path.join(localBinDir, "openclaw.cmd")) || 
      isExecutable(path.join(localBinDir, "openclaw.bat"))) {
    candidates.push(localBinDir);
  }

  const miseDataDir = process.env.MISE_DATA_DIR ?? path.join(homeDir, ".local", "share", "mise");
  const miseShims = path.join(miseDataDir, "shims");
  if (isDirectory(miseShims)) {
    candidates.push(miseShims);
  }

  // Windows-specific paths
  candidates.push(
    path.join(homeDir, "AppData", "Local", "Programs", "Python"),
    path.join(homeDir, "AppData", "Local", "Programs", "nodejs"),
    path.join(homeDir, "AppData", "Roaming", "npm"),
    path.join(homeDir, "AppData", "Local", "Programs", "Git", "bin"),
    path.join(homeDir, "AppData", "Local", "Programs", "Git", "usr", "bin"),
  );

  // Use Windows system PATH if available
  const systemPath = process.env.PATH || "";
  if (systemPath) {
    candidates.push(...systemPath.split(path.delimiter));
  }

  return candidates.filter(isDirectory);
}

/**
 * Best-effort PATH bootstrap so skills that require the `openclaw` CLI can run
 * under Windows service/minimal environments.
 */
export function ensureOpenClawCliOnPath(opts: EnsureOpenClawPathOpts = {}) {
  if (isTruthyEnvValue(process.env.OPENCLAW_PATH_BOOTSTRAPPED)) {
    return;
  }
  process.env.OPENCLAW_PATH_BOOTSTRAPPED = "1";

  const existing = opts.pathEnv ?? process.env.PATH ?? "";
  const prepend = candidateBinDirs(opts);
  if (prepend.length === 0) {
    return;
  }

  const merged = mergePath({ existing, prepend });
  if (merged) {
    process.env.PATH = merged;
  }
}
