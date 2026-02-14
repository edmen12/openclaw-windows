import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChildProcess } from "node:child_process";
import {
  isOpencodeProcessAlive,
  killOpencodeProcess,
  sendToOpencodeProcess,
  startOpencodeProcess,
  type OpenCodeProcess,
} from "./opencode-process.js";

const mockProcess = {
  killed: false,
  exitCode: null,
  on: vi.fn((_event, callback) => {
    (mockProcess as any)[`on_${_event}`] = callback;
  }),
  kill: vi.fn(() => {
    mockProcess.killed = true;
    mockProcess.exitCode = 0;
  }),
  stdin: {
    write: vi.fn((_, callback?: (err?: Error) => void) => callback && callback()),
    end: vi.fn(),
  },
  stdout: {
    on: vi.fn((_event, callback) => {
      (mockProcess as any)[`on_${_event}_stdout`] = callback;
    }),
  },
  stderr: {
    on: vi.fn((_event, callback) => {
      (mockProcess as any)[`on_${_event}_stderr`] = callback;
    }),
  },
  pid: 12345,
} as ChildProcess;

vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => mockProcess),
}));

describe("opencode-process", () => {
  beforeEach(() => {
    mockProcess.killed = false;
    mockProcess.exitCode = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("startOpencodeProcess", () => {
    it("should spawn opencode with correct options", async () => {
      const { pid, output } = await startOpencodeProcess("C:/workspace");

      expect(pid).toBeDefined();
      expect(typeof pid).toBe("number");
      expect(output).toBe("");
    });

    it("should use default workdir if not specified", async () => {
      const { pid } = await startOpencodeProcess();

      expect(pid).toBeDefined();
    });
  });

  describe("isOpencodeProcessAlive", () => {
    it("should return true for active process", async () => {
      const { pid } = await startOpencodeProcess();

      expect(isOpencodeProcessAlive(pid)).toBe(true);
    });

    it("should return false for killed process", async () => {
      const { pid } = await startOpencodeProcess();

      // Simulate process killed by setting exit code
      mockProcess.exitCode = 0;

      expect(isOpencodeProcessAlive(pid)).toBe(false);
    });

    it("should return false for nonexistent process", () => {
      expect(isOpencodeProcessAlive(99999)).toBe(false);
    });
  });

  describe("sendToOpencodeProcess", () => {
    it("should send input to process and return output", async () => {
      const { pid } = await startOpencodeProcess();

      // Simulate stdout output
      const onStdout = (mockProcess as any).on_data_stdout;
      if (onStdout) {
        onStdout(Buffer.from("OpenCode response\n"));
      }

      const output = await sendToOpencodeProcess(pid, "write a function");

      expect(output.trim()).toBe("OpenCode response");
    });

    it("should throw error if process not found", async () => {
      await expect(sendToOpencodeProcess(99999, "test")).rejects.toThrow(
        "OpenCode process not found",
      );
    });

    it("should timeout if no response", async () => {
      const { pid } = await startOpencodeProcess();

      await expect(
        sendToOpencodeProcess(pid, "test", 100),
      ).rejects.toThrow("OpenCode process timeout");
    });
  });

  describe("killOpencodeProcess", () => {
    it("should kill active process", async () => {
      const { pid } = await startOpencodeProcess();

      const result = killOpencodeProcess(pid);

      expect(result).toBe(true);
      expect(mockProcess.kill).toHaveBeenCalledWith("SIGTERM");
      expect(isOpencodeProcessAlive(pid)).toBe(false);
    });

    it("should return false for nonexistent process", () => {
      const result = killOpencodeProcess(99999);

      expect(result).toBe(false);
    });
  });
});
