import { spawn } from "node:child_process";

export type WindowsSshParsedTarget = {
  user?: string;
  host: string;
  port: number;
};

export type WindowsSshTunnel = {
  parsedTarget: WindowsSshParsedTarget;
  localPort: number;
  remotePort: number;
  pid: number | null;
  stderr: string[];
  stop: () => Promise<void>;
};

/**
 * Parse SSH target for Windows.
 */
export function parseWindowsSshTarget(raw: string): WindowsSshParsedTarget | null {
  const trimmed = raw.trim().replace(/^ssh\s+/, "");
  if (!trimmed) {
    return null;
  }

  const [userPart, hostPart] = trimmed.includes("@")
    ? (() => {
        const idx = trimmed.indexOf("@");
        const user = trimmed.slice(0, idx).trim();
        const host = trimmed.slice(idx + 1).trim();
        return [user || undefined, host];
      })()
    : [undefined, trimmed];

  const colonIdx = hostPart.lastIndexOf(":");
  if (colonIdx > 0 && colonIdx < hostPart.length - 1) {
    const host = hostPart.slice(0, colonIdx).trim();
    const portRaw = hostPart.slice(colonIdx + 1).trim();
    const port = Number.parseInt(portRaw, 10);
    if (!host || !Number.isFinite(port) || port <= 0) {
      return null;
    }
    if (host.startsWith("-")) {
      return null;
    }
    return { user: userPart, host, port };
  }

  if (!hostPart) {
    return null;
  }
  if (hostPart.startsWith("-")) {
    return null;
  }
  return { user: userPart, host: hostPart, port: 22 };
}

/**
 * Check if Windows OpenSSH is available.
 */
export async function isWindowsSshAvailable(): Promise<boolean> {
  try {
    const result = await spawnPowerShellCommand("Get-Command ssh -ErrorAction SilentlyContinue");
    return result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Find Windows OpenSSH executable.
 */
export async function findWindowsSshPath(): Promise<string | null> {
  try {
    const result = await spawnPowerShellCommand("(Get-Command ssh).Source");
    return result.stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Spawn SSH tunnel on Windows using OpenSSH.
 */
export async function startWindowsSshPortForward(opts: {
  target: string;
  identity?: string;
  localPortPreferred: number;
  remotePort: number;
  timeoutMs: number;
}): Promise<WindowsSshTunnel> {
  const sshPath = await findWindowsSshPath();
  if (!sshPath) {
    throw new Error("OpenSSH is not installed or not in PATH");
  }

  const parsed = parseWindowsSshTarget(opts.target);
  if (!parsed) {
    throw new Error(`invalid SSH target: ${opts.target}`);
  }

  const localPort = opts.localPortPreferred;
  const userHost = parsed.user ? `${parsed.user}@${parsed.host}` : parsed.host;

  const args = [
    "-N",
    "-L",
    `${localPort}:127.0.0.1:${opts.remotePort}`,
    "-p",
    String(parsed.port),
    "-o",
    "ExitOnForwardFailure=yes",
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=accept-new",
    "-o",
    "UpdateHostKeys=yes",
    "-o",
    "ConnectTimeout=5",
    "-o",
    "ServerAliveInterval=15",
    "-o",
    "ServerAliveCountMax=3",
  ];

  if (opts.identity?.trim()) {
    args.push("-i", opts.identity.trim());
  }

  args.push("--", userHost);

  const stderr: string[] = [];
  const child = spawn(sshPath, args, {
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  });

  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (chunk) => {
    const lines = String(chunk)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    stderr.push(...lines);
  });

  const stop = async () => {
    if (child.killed) {
      return;
    }
    try {
      child.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (!child.killed) {
            child.kill("SIGKILL");
          }
          resolve();
        }, 5000);
        child.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    } catch {
      // ignore
    }
  };

  return {
    parsedTarget: parsed,
    localPort,
    remotePort: opts.remotePort,
    pid: child.pid ?? null,
    stderr,
    stop,
  };
}

type ShellResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

/**
 * Spawn a PowerShell command and capture output.
 */
async function spawnPowerShellCommand(command: string, timeoutMs = 15000): Promise<ShellResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-Command", command], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (data) => {
      stdout += data;
    });

    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (data) => {
      stderr += data;
    });

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`PowerShell command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on("exit", (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode: code ?? null });
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
