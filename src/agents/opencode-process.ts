import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import path from "node:path";
import { logVerbose } from "../globals.js";

type OpenCodeProcess = {
  pid: number;
  process: ChildProcess;
  workDir: string;
};

const OPENCODE_PROCESSES = new Map<number, OpenCodeProcess>();

export function isOpencodeProcessAlive(pid: number): boolean {
  const entry = OPENCODE_PROCESSES.get(pid);
  if (!entry) return false;
  if (entry.process.killed || entry.process.exitCode !== null) {
    OPENCODE_PROCESSES.delete(pid);
    return false;
  }
  return true;
}

export function getOpencodeProcess(pid: number): OpenCodeProcess | undefined {
  if (!isOpencodeProcessAlive(pid)) return undefined;
  return OPENCODE_PROCESSES.get(pid);
}

export async function startOpencodeProcess(
  workDir: string = "C:\\User\\User",
): Promise<{ pid: number; output: string }> {
  const resolvedWorkDir = path.resolve(workDir);

  const process = spawn("opencode", [], {
    cwd: resolvedWorkDir,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });

  const pid = process.pid;
  const entry: OpenCodeProcess = {
    pid,
    process,
    workDir: resolvedWorkDir,
  };
  OPENCODE_PROCESSES.set(pid, entry);

  logVerbose(`opencode-process: started pid=${pid} workDir=${resolvedWorkDir}`);

  let output = "";
  process.stdout?.on("data", (data: Buffer) => {
    output += data.toString();
  });
  process.stderr?.on("data", (data: Buffer) => {
    output += data.toString();
  });

  process.on("exit", (code) => {
    logVerbose(`opencode-process: exit pid=${pid} code=${code}`);
    OPENCODE_PROCESSES.delete(pid);
  });
  process.on("error", (err) => {
    logVerbose(`opencode-process: error pid=${pid} ${String(err)}`);
    OPENCODE_PROCESSES.delete(pid);
  });

  return { pid, output };
}

export async function sendToOpencodeProcess(
  pid: number,
  input: string,
  timeoutMs: number = 30000,
): Promise<string> {
  const entry = getOpencodeProcess(pid);
  if (!entry) {
    throw new Error(`OpenCode process not found (pid=${pid})`);
  }

  const { process } = entry;

  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error("OpenCode process timeout"));
    }, timeoutMs);

    const finish = () => {
      clearTimeout(timeout);
      resolve(output.trim());
    };

    const onStdout = (data: Buffer) => {
      output += data.toString();
    };
    const onStderr = (data: Buffer) => {
      output += data.toString();
    };
    const onExit = () => {
      process.stdout?.off("data", onStdout);
      process.stderr?.off("data", onStderr);
      process.off("exit", onExit);
      process.off("error", onError);
      finish();
    };
    const onError = (err: Error) => {
      clearTimeout(timeout);
      process.stdout?.off("data", onStdout);
      process.stderr?.off("data", onStderr);
      process.off("exit", onExit);
      process.off("error", onError);
      reject(err);
    };

    process.stdout?.on("data", onStdout);
    process.stderr?.on("data", onStderr);
    process.on("exit", onExit);
    process.on("error", onError);

    const stdin = process.stdin;
    if (stdin) {
      stdin.write(input + "\n", (err) => {
        if (err) reject(err);
      });
    } else {
      reject(new Error("OpenCode process stdin unavailable"));
    }
  });
}

export function killOpencodeProcess(pid: number): boolean {
  const entry = getOpencodeProcess(pid);
  if (!entry) return false;

  entry.process.kill("SIGTERM");
  OPENCODE_PROCESSES.delete(pid);
  logVerbose(`opencode-process: killed pid=${pid}`);
  return true;
}
