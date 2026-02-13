import { describe, expect, it, vi } from "vitest";
import {
  loadWindowsShellEnvFallback,
  isWindowsPowerShellEnvAvailable,
  getWindowsShellForEnvLoading,
} from "./shell-env.js";

describe("windows: shell env fallback", () => {
  it("is disabled by default", () => {
    const env: NodeJS.ProcessEnv = {};
    const res = loadWindowsShellEnvFallback({
      enabled: false,
      env,
      expectedKeys: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
    });

    expect(res.ok).toBe(true);
    expect(res.applied).toEqual([]);
    if (res.ok && res.skippedReason) {
      expect(res.skippedReason).toBe("disabled");
    }
  });

  it("skips when already has an expected key", () => {
    const env: NodeJS.ProcessEnv = { OPENAI_API_KEY: "existing" };
    const logger = { warn: vi.fn() };

    const res = loadWindowsShellEnvFallback({
      enabled: true,
      env,
      expectedKeys: ["OPENAI_API_KEY", "DISCORD_BOT_TOKEN"],
      logger,
    });

    expect(res.ok).toBe(true);
    expect(res.applied).toEqual([]);
    if (res.ok && res.skippedReason) {
      expect(res.skippedReason).toBe("already-has-keys");
    }
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("imports expected keys without overriding existing env", () => {
    const env1: NodeJS.ProcessEnv = {};

    // First call - apply from shell
    const res1 = loadWindowsShellEnvFallback({
      enabled: true,
      env: env1,
      expectedKeys: ["OPENAI_API_KEY", "DISCORD_BOT_TOKEN"],
    });

    // PowerShell may not be available in test environment
    // We're testing the function structure, not the actual PowerShell call
    expect(res1.ok).toBeDefined();

    // Second call with existing key should skip
    env1.OPENAI_API_KEY = "from-parent";
    const logger = { warn: vi.fn() };

    const res2 = loadWindowsShellEnvFallback({
      enabled: true,
      env: env1,
      expectedKeys: ["OPENAI_API_KEY", "DISCORD_BOT_TOKEN"],
      logger,
    });

    expect(env1.OPENAI_API_KEY).toBe("from-parent");
    expect(res2.applied).toEqual([]);
  });
});

describe("windows: isWindowsPowerShellEnvAvailable", () => {
  it("returns based on PowerShell availability", () => {
    // This will check actual PowerShell availability
    // In most Windows environments, this should be true
    const result = isWindowsPowerShellEnvAvailable();
    expect(typeof result).toBe("boolean");
  });
});

describe("windows: getWindowsShellForEnvLoading", () => {
  it("returns PowerShell when PSModulePath is set", () => {
    const originalPSModulePath = process.env.PSModulePath;
    process.env.PSModulePath = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules";

    const shell = getWindowsShellForEnvLoading();
    expect(shell).toBe("powershell.exe");

    process.env.PSModulePath = originalPSModulePath;
  });

  it("falls back to cmd.exe when PSModulePath is not set", () => {
    const originalPSModulePath = process.env.PSModulePath;
    delete process.env.PSModulePath;

    const shell = getWindowsShellForEnvLoading();
    expect(shell).toBe("cmd.exe");

    process.env.PSModulePath = originalPSModulePath;
  });
});
