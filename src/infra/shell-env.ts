import { loadWindowsShellEnvFallback } from "../platform/windows/shell-env.js";
import { isTruthyEnvValue } from "./env.js";

let lastAppliedKeys: string[] = [];

export type ShellEnvFallbackResult =
  | { ok: true; applied: string[]; skippedReason?: never }
  | { ok: true; applied: []; skippedReason: "already-has-keys" | "disabled" }
  | { ok: false; error: string; applied: [] };

export type ShellEnvFallbackOptions = {
  enabled: boolean;
  env: NodeJS.ProcessEnv;
  expectedKeys: string[];
  logger?: Pick<typeof console, "warn">;
  timeoutMs?: number;
};

export function loadShellEnvFallback(opts: ShellEnvFallbackOptions): ShellEnvFallbackResult {
  // Windows: Use Windows-specific shell env loading (PowerShell)
  const result = loadWindowsShellEnvFallback(opts);
  if (result.ok) {
    lastAppliedKeys = result.applied;
  }
  return result;
}

export function shouldEnableShellEnvFallback(env: NodeJS.ProcessEnv): boolean {
  return isTruthyEnvValue(env.OPENCLAW_LOAD_SHELL_ENV);
}

export function shouldDeferShellEnvFallback(env: NodeJS.ProcessEnv): boolean {
  return isTruthyEnvValue(env.OPENCLAW_DEFER_SHELL_ENV_FALLBACK);
}

export function resolveShellEnvFallbackTimeoutMs(env: NodeJS.ProcessEnv): number {
  const raw = env.OPENCLAW_SHELL_ENV_TIMEOUT_MS?.trim();
  if (!raw) {
    return 15000;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return 15000;
  }
  return Math.max(0, parsed);
}

// Windows does not have login shell concept
export function getShellPathFromLoginShell(): null {
  return null;
}

export function getShellEnvAppliedKeys(): string[] {
  return [...lastAppliedKeys];
}
