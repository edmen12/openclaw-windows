/**
 * OpenCode Process Manager for Telegram integration
 *
 * Manages persistent OpenCode CLI sessions with stdin/stdout communication
 */

import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import os from "node:os";

export type OpenCodeContext = {
  chatId: number;
  userId: number;
  process: ChildProcess;
  startTime: number;
  workspace?: string;
};

export type OpenCodeMessage = {
  text: string;
  timestamp: number;
};

/**
 * Global registry of active OpenCode sessions
 * Key: `${chatId}:${userId}`
 */
const activeSessions = new Map<string, OpenCodeContext>();

/**
 * Get session key for a user
 */
function getSessionKey(chatId: number, userId: number): string {
  return `${chatId}:${userId}`;
}

/**
 * Check if user has active OpenCode session
 */
export function hasActiveSession(chatId: number, userId: number): boolean {
  const key = getSessionKey(chatId, userId);
  return activeSessions.has(key);
}

/**
 * Get active session for user
 */
export function getActiveSession(
  chatId: number,
  userId: number,
): OpenCodeContext | undefined {
  const key = getSessionKey(chatId, userId);
  return activeSessions.get(key);
}

/**
 * Start OpenCode process for user
 */
export async function startOpenCodeSession(
  chatId: number,
  userId: number,
  workspace?: string,
): Promise<{ success: boolean; error?: string }> {
  const key = getSessionKey(chatId, userId);

  // Check if already active
  if (activeSessions.has(key)) {
    return { success: false, error: "OpenCode session already active. Use /opencode_exit first." };
  }

  // Resolve OpenCode executable
  let opencodeExe = "opencode";
  if (os.platform() === "win32") {
    opencodeExe = "opencode.cmd";
  }

  // Build args
  const args = workspace ? [workspace] : [];

  // Spawn process
  const process = spawn(opencodeExe, args, {
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  // Handle process errors
  process.on("error", (err) => {
    console.error(`[OpenCode] Process error: ${err.message}`);
    endSession(chatId, userId);
  });

  // Handle process exit
  process.on("exit", (code, signal) => {
    console.log(`[OpenCode] Process exited: code=${code}, signal=${signal}`);
    endSession(chatId, userId);
  });

  // Capture stderr
  process.stderr?.on("data", (data) => {
    console.error(`[OpenCode stderr] ${data}`);
  });

  // Register session
  activeSessions.set(key, {
    chatId,
    userId,
    process,
    startTime: Date.now(),
    workspace,
  });

  return { success: true };
}

/**
 * Send message to OpenCode stdin
 */
export async function sendToOpenCode(
  chatId: number,
  userId: number,
  message: string,
): Promise<{ success: boolean; output?: string; error?: string }> {
  const session = getActiveSession(chatId, userId);
  if (!session) {
    return { success: false, error: "No active OpenCode session" };
  }

  return new Promise((resolve) => {
    // Capture stdout
    let output = "";

    const stdoutHandler = (data: Buffer) => {
      output += data.toString();
    };

    session.process.stdout?.on("data", stdoutHandler);

    // Write to stdin
    session.process.stdin?.write(`${message}\n`, (err) => {
      if (err) {
        session.process.stdout?.off("data", stdoutHandler);
        resolve({ success: false, error: err.message });
        return;
      }

      // Wait a bit for output
      setTimeout(() => {
        session.process.stdout?.off("data", stdoutHandler);
        resolve({
          success: true,
          output: output.trim() || "(no output)",
        });
      }, 500);
    });
  });
}

/**
 * End OpenCode session
 */
export function endSession(chatId: number, userId: number): boolean {
  const key = getSessionKey(chatId, userId);
  const session = activeSessions.get(key);

  if (!session) {
    return false;
  }

  // Kill process gracefully
  session.process.kill("SIGTERM");

  // Force kill after 1 second
  setTimeout(() => {
    if (!session.process.killed) {
      session.process.kill("SIGKILL");
    }
  }, 1000);

  activeSessions.delete(key);
  return true;
}

/**
 * Get all active sessions (for debugging)
 */
export function getSessionDebugInfo(): Array<{
  key: string;
  duration: number;
  workspace?: string;
}> {
  const info: Array<{
    key: string;
    duration: number;
    workspace?: string;
  }> = [];

  for (const [key, session] of activeSessions.entries()) {
    info.push({
      key,
      duration: Date.now() - session.startTime,
      workspace: session.workspace,
    });
  }

  return info;
}

/**
 * Cleanup all sessions (for shutdown)
 */
export function cleanupAllSessions(): void {
  for (const [key, session] of activeSessions.entries()) {
    console.log(`[OpenCode] Cleaning up session: ${key}`);
    session.process.kill("SIGTERM");
  }
  activeSessions.clear();
}

// Handle process termination
process.on("SIGINT", () => {
  cleanupAllSessions();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cleanupAllSessions();
  process.exit(0);
});
