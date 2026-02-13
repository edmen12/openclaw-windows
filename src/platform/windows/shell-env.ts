import { spawnSync } from "node:child_process";

type ShellEnvFallbackResult =
  | { ok: true; applied: string[]; skippedReason?: never }
  | { ok: true; applied: []; skippedReason: "already-has-keys" | "disabled" }
  | { ok: false; error: string; applied: [] };

type ShellEnvFallbackOptions = {
  enabled: boolean;
  env: NodeJS.ProcessEnv;
  expectedKeys: string[];
  logger?: Pick<typeof console, "warn">;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Parse PowerShell environment variable output.
 * PowerShell's `Get-ChildItem env:` returns key-value pairs.
 */
function parsePowerShellEnv(stdout: string): Map<string, string> {
  const env = new Map<string, string>();
  const lines = stdout.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    // PowerShell format: KEY VALUE or KEY=VALUE
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (key) {
        env.set(key, value);
      }
    } else {
      const spaceIdx = trimmed.indexOf(" ");
      if (spaceIdx > 0) {
        const key = trimmed.slice(0, spaceIdx).trim();
        const value = trimmed.slice(spaceIdx + 1).trim();
        if (key) {
          env.set(key, value);
        }
      }
    }
  }
  return env;
}

/**
 * Load Windows shell environment variables from PowerShell.
 * This captures environment variables set by PowerShell profiles.
 */
export function loadWindowsShellEnvFallback(opts: ShellEnvFallbackOptions): ShellEnvFallbackResult {
  const logger = opts.logger ?? console;

  if (!opts.enabled) {
    return { ok: true, applied: [], skippedReason: "disabled" };
  }

  const hasAnyKey = opts.expectedKeys.some((key) => Boolean(opts.env[key]?.trim()));
  if (hasAnyKey) {
    return { ok: true, applied: [], skippedReason: "already-has-keys" };
  }

  const timeoutMs =
    typeof opts.timeoutMs === "number" && Number.isFinite(opts.timeoutMs)
      ? Math.max(0, opts.timeoutMs)
      : DEFAULT_TIMEOUT_MS;

  let stdout: string;
  try {
    stdout = spawnPowerShellSync(
      "Get-ChildItem env: | ForEach-Object { $_.Name + '=' + $_.Value }",
      timeoutMs,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[openclaw] Windows shell env fallback failed: ${msg}`);
    return { ok: false, error: msg, applied: [] };
  }

  const shellEnv = parsePowerShellEnv(stdout);

  const applied: string[] = [];
  for (const key of opts.expectedKeys) {
    if (opts.env[key]?.trim()) {
      continue;
    }
    const value = shellEnv.get(key);
    if (!value?.trim()) {
      continue;
    }
    opts.env[key] = value;
    applied.push(key);
  }

  return { ok: true, applied };
}

/**
 * Get the path to the default Windows shell.
 * On Windows, this is PowerShell by default.
 */
export function getWindowsShellForEnvLoading(): string {
  if (process.env.PSModulePath) {
    return "powershell.exe";
  }
  return "cmd.exe";
}

/**
 * Check if Windows PowerShell is available.
 */
export function isWindowsPowerShellEnvAvailable(): boolean {
  try {
    const result = spawnPowerShellSync("$PSVersionTable.PSVersion", 5000);
    return result.length > 0;
  } catch {
    return false;
  }
}

/**
 * Spawn a PowerShell command synchronously.
 * This is used for environment variable loading.
 */
function spawnPowerShellSync(command: string, timeoutMs: number): string {
  const result = spawnSync("powershell.exe", ["-Command", "-NoProfile", command], {
    windowsHide: true,
    encoding: "utf8",
    timeout: timeoutMs,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`PowerShell exited with code ${result.status}: ${result.stderr}`);
  }

  return result.stdout;
}

export type { ShellEnvFallbackOptions, ShellEnvFallbackResult };
