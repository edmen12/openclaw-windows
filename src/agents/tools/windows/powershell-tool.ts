import { Type } from "@sinclair/typebox";
import { spawn } from "node:child_process";
import type { OpenClawConfig } from "../../../config/config.js";
import type { AnyAgentTool } from "../common.js";
import { resolveSessionAgentId } from "../../agent-scope.js";
import { jsonResult, readNumberParam, readStringParam } from "../common.js";

const PowerShellToolSchema = Type.Object({
  action: Type.String(),
  code: Type.Optional(Type.String()),
  class_param: Type.Optional(Type.String()),
  properties: Type.Optional(Type.Array(Type.String())),
  moduleName: Type.Optional(Type.String()),
  command_param: Type.Optional(Type.String()),
  filter: Type.Optional(Type.String()),
  timeoutMs: Type.Optional(Type.Number()),
});

/**
 * Run PowerShell command and return output
 */
async function runPowerShell(code: string, timeoutMs: number = 30000): Promise<string> {
  return await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let settled = false;

    const psPath = process.env.SystemRoot
      ? `${process.env.SystemRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
      : "powershell.exe";

    const child = spawn(psPath, ["-NoProfile", "-NonInteractive", "-Command", code], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    const onChunk = (chunk: Buffer, target: "stdout" | "stderr") => {
      const str = chunk.toString("utf8");
      if (target === "stdout") {
        stdout += str;
      } else {
        stderr += str;
      }
    };

    child.stdout?.on("data", (chunk) => onChunk(chunk as Buffer, "stdout"));
    child.stderr?.on("data", (chunk) => onChunk(chunk as Buffer, "stderr"));

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill("SIGKILL");
        reject(new Error("PowerShell command timed out"));
      }
    }, timeoutMs);

    child.on("error", (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    });

    child.on("exit", (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`PowerShell exited with code ${code}: ${stderr.trim()}`));
        }
      }
    });
  });
}

/**
 * Create PowerShell tool for Windows system administration
 */
export function createPowerShellTool(_options: {
  config?: OpenClawConfig;
  agentSessionKey?: string;
}): AnyAgentTool {
  return {
    label: "PowerShell",
    name: "powershell",
    description:
      "Execute PowerShell commands, WMI queries, and manage Windows system components (services, tasks, registry, event logs, etc.) on Windows.",
    parameters: PowerShellToolSchema,
    execute: async (_toolCallId, params) => {
      const action = readStringParam(params, "action", { required: true });
      const timeoutMs = readNumberParam(params, "timeoutMs") ?? 30000;

      switch (action) {
        case "version": {
          try {
            const output = await runPowerShell("$PSVersionTable", timeoutMs);
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `PowerShell Version:\n\n${output}`,
                },
              ],
            });
          } catch (err) {
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `Failed to get PowerShell version: ${String(err)}`,
                },
              ],
              error: String(err),
            });
          }
        }

        case "query": {
          const code = readStringParam(params, "code", { required: true });
          try {
            const output = await runPowerShell(code, timeoutMs);
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: output,
                },
              ],
            });
          } catch (err) {
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `PowerShell command failed: ${String(err)}`,
                },
              ],
              error: String(err),
            });
          }
        }

        case "wmic": {
          const wmiClass = readStringParam(params, "class_param", { required: true });
          const properties = (params.properties as string[]) ?? ["*"];
          const filter = readStringParam(params, "filter");

          let code = `Get-CimInstance -ClassName ${wmiClass} |`;
          if (filter) {
            code = `Get-CimInstance -ClassName ${wmiClass} | Where-Object ${filter} |`;
          }
          code += ` Select-Object -Property ${properties.join(", ")}`;

          try {
            const output = await runPowerShell(code, timeoutMs);
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `WMI Query Result (${wmiClass}):\n\n${output}`,
                },
              ],
            });
          } catch (err) {
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `WMI query failed: ${String(err)}`,
                },
              ],
              error: String(err),
            });
          }
        }

        case "module": {
          const moduleName = readStringParam(params, "moduleName", { required: true });
          const command = readStringParam(params, "command_param");

          let code = `Import-Module ${moduleName}`;
          if (command) {
            code += `; ${command}`;
          }

          try {
            const output = await runPowerShell(code, timeoutMs);
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `PowerShell Module Result (${moduleName}):\n\n${output}`,
                },
              ],
            });
          } catch (err) {
            return jsonResult({
              content: [
                {
                  type: "text",
                  text: `PowerShell module command failed: ${String(err)}`,
                },
              ],
              error: String(err),
            });
          }
        }

        default: {
          return jsonResult({
            content: [
              {
                type: "text",
                text: `Invalid action: ${action}. Valid actions: version, query, wmic, module`,
              },
            ],
            error: `Invalid action: ${action}`,
          });
        }
      }
    },
  };
}
