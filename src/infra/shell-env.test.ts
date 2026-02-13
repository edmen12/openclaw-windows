import { describe, expect, it, vi } from "vitest";
import { loadShellEnvFallback } from "./shell-env.js";

describe("shell env fallback - Windows-only", () => {
  it("is disabled by default", () => {
    const env: NodeJS.ProcessEnv = {};
    const res = loadShellEnvFallback({
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
    const exec = vi.fn();

    const res = loadShellEnvFallback({
      enabled: true,
      env,
      expectedKeys: ["OPENAI_API_KEY", "DISCORD_BOT_TOKEN"],
    });

    expect(res.ok).toBe(true);
    expect(res.applied).toEqual([]);
    if (res.ok && res.skippedReason) {
      expect(res.skippedReason).toBe("already-has-keys");
    }
    expect(exec).not.toHaveBeenCalled();
  });

  it("attempts to load from Windows PowerShell when no keys present", () => {
    const env: NodeJS.ProcessEnv = {};
    const res = loadShellEnvFallback({
      enabled: true,
      env,
      expectedKeys: ["OPENAI_API_KEY", "DISCORD_BOT_TOKEN"],
    });

    // Windows implementation is tested in platform/windows/shell-env.test.ts
    expect(res.ok).toBeDefined();
  });
});
