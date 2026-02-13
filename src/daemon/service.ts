import type { GatewayServiceRuntime } from "./service-runtime.js";
import {
  installWindowsService,
  uninstallWindowsService,
  startWindowsService,
  stopWindowsService,
  isWindowsServiceRunning,
  getWindowsServiceStatus,
} from "./service-windows.js";

export type GatewayServiceInstallArgs = {
  env: Record<string, string | undefined>;
  stdout: NodeJS.WritableStream;
  programArguments: string[];
  workingDirectory?: string;
  environment?: Record<string, string | undefined>;
  description?: string;
};

export type GatewayService = {
  label: string;
  loadedText: string;
  notLoadedText: string;
  install: (args: GatewayServiceInstallArgs) => Promise<void>;
  uninstall: (args: {
    env: Record<string, string | undefined>;
    stdout: NodeJS.WritableStream;
  }) => Promise<void>;
  stop: (args: {
    env?: Record<string, string | undefined>;
    stdout: NodeJS.WritableStream;
  }) => Promise<void>;
  restart: (args: {
    env?: Record<string, string | undefined>;
    stdout: NodeJS.WritableStream;
  }) => Promise<void>;
  isLoaded: (args: { env?: Record<string, string | undefined> }) => Promise<boolean>;
  readCommand: (env: Record<string, string | undefined>) => Promise<{
    programArguments: string[];
    workingDirectory?: string;
    environment?: Record<string, string>;
    sourcePath?: string;
  } | null>;
  readRuntime: (env: Record<string, string | undefined>) => Promise<GatewayServiceRuntime>;
};

/**
 * Windows-only gateway service implementation using Task Scheduler
 */
export function resolveGatewayService(): GatewayService {
  return {
    label: "Scheduled Task (Windows)",
    loadedText: "installed",
    notLoadedText: "not installed",
    install: async (_args) => {
      await installWindowsService({
        cwd: process.cwd(),
      });
    },
    uninstall: async (_args) => {
      await uninstallWindowsService();
    },
    stop: async (_args) => {
      await stopWindowsService();
    },
    restart: async (_args) => {
      await stopWindowsService();
      await startWindowsService();
    },
    isLoaded: async (_args) => {
      try {
        const status = await getWindowsServiceStatus();
        return status !== "Not Installed";
      } catch {
        return false;
      }
    },
    readCommand: async (_env) => null,
    readRuntime: async (_env) => ({
      pid: undefined,
      uptimeSeconds: undefined,
      memoryBytes: undefined,
      status: (await isWindowsServiceRunning()) ? "running" : "stopped",
      detail: await getWindowsServiceStatus(),
    }),
  };
}
