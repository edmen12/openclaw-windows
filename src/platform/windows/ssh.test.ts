import { describe, expect, it } from "vitest";
import { parseWindowsSshTarget, type WindowsSshParsedTarget } from "./ssh.js";

describe("windows: parseWindowsSshTarget", () => {
  it("parses simple target without user", () => {
    const result = parseWindowsSshTarget("example.com");

    expect(result).not.toBeNull();
    expect(result?.host).toBe("example.com");
    expect(result?.port).toBe(22);
    expect(result?.user).toBeUndefined();
  });

  it("parses target with user", () => {
    const result = parseWindowsSshTarget("user@example.com");

    expect(result).not.toBeNull();
    expect(result?.host).toBe("example.com");
    expect(result?.port).toBe(22);
    expect(result?.user).toBe("user");
  });

  it("parses target with port", () => {
    const result = parseWindowsSshTarget("user@example.com:2222");

    expect(result).not.toBeNull();
    expect(result?.host).toBe("example.com");
    expect(result?.port).toBe(2222);
    expect(result?.user).toBe("user");
  });

  it("parses target with port but no user", () => {
    const result = parseWindowsSshTarget("example.com:2222");

    expect(result).not.toBeNull();
    expect(result?.host).toBe("example.com");
    expect(result?.port).toBe(2222);
    expect(result?.user).toBeUndefined();
  });

  it("rejects invalid targets with leading dash", () => {
    const targets = ["-malicious.com", "user@-bad.com:22", "user@-bad.com"];

    for (const target of targets) {
      const result = parseWindowsSshTarget(target);
      expect(result).toBeNull();
    }
  });

  it("rejects empty string", () => {
    const result = parseWindowsSshTarget("");

    expect(result).toBeNull();
  });

  it("rejects target with only user@", () => {
    const result = parseWindowsSshTarget("user@");

    expect(result).toBeNull();
  });
});

describe("windows: formatWindowsSshTarget", () => {
  it("formats target with user and port", () => {
    const target: WindowsSshParsedTarget = {
      user: "testuser",
      host: "example.com",
      port: 2222,
    };

    const formatted = `${target.user}@${target.host}:${target.port}`;
    expect(formatted).toBe("testuser@example.com:2222");
  });

  it("formats target with user only", () => {
    const target: WindowsSshParsedTarget = {
      user: "testuser",
      host: "example.com",
      port: 22,
    };

    const formatted = `${target.user}@${target.host}`;
    expect(formatted).toBe("testuser@example.com");
  });

  it("formats target with host and port only", () => {
    const target: WindowsSshParsedTarget = {
      host: "example.com",
      port: 2222,
    };

    const formatted = `${target.host}:${target.port}`;
    expect(formatted).toBe("example.com:2222");
  });

  it("formats target with host only", () => {
    const target: WindowsSshParsedTarget = {
      host: "example.com",
      port: 22,
    };

    const formatted = target.host;
    expect(formatted).toBe("example.com");
  });
});
