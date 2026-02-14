import { Type } from "@sinclair/typebox";
import type { OpenClawConfig } from "../../../config/config.js";
import type { AnyAgentTool } from "../common.js";
import { jsonResult, readStringParam } from "../common.js";

const FilesystemToolSchema = Type.Object({
  action: Type.String(),
  link: Type.Optional(Type.String()),
  target: Type.Optional(Type.String()),
  type: Type.Optional(Type.String()),
  path: Type.Optional(Type.String()),
});

export function createFilesystemTool(_options: { config?: OpenClawConfig }): AnyAgentTool {
  return {
    label: "Filesystem",
    name: "filesystem",
    description:
      "Windows filesystem extended operations (junctions, symlinks, hardlinks, ACLs). Create Windows-specific link types and manage file permissions.",
    parameters: FilesystemToolSchema,
    execute: async (_toolCallId, params) => {
      const action = readStringParam(params, "action", { required: true });

      switch (action) {
        case "create_symlink":
          return jsonResult({
            content: [
              {
                type: "text",
                text: "Use powershell tool with: New-Item -ItemType SymbolicLink -Path 'link' -Target 'target' (requires admin)",
              },
            ],
          });
        case "create_junction":
          const link_j = readStringParam(params, "link");
          const target_j = readStringParam(params, "target");
          return jsonResult({
            content: [
              {
                type: "text",
                text:
                  link_j && target_j
                    ? `Use powershell tool with: New-Item -ItemType Junction -Path '${link_j}' -Target '${target_j}'`
                    : "Use powershell tool with: New-Item -ItemType Junction -Path 'link' -Target 'target'",
              },
            ],
          });
        case "create_hardlink":
          return jsonResult({
            content: [
              {
                type: "text",
                text: "Use powershell tool with: New-Item -ItemType HardLink -Path 'link' -Target 'target'",
              },
            ],
          });
        case "get_file_info":
          const path = readStringParam(params, "path");
          return jsonResult({
            content: [
              {
                type: "text",
                text: path
                  ? `Use powershell tool with: Get-Item '${path}' | Select-Object FullName, Length, LastWriteTime, Attributes, Mode`
                  : "Use: Get-ChildItem -Path 'path' | Select-Object *",
              },
            ],
          });
        case "get_file_acl":
          return jsonResult({
            content: [
              {
                type: "text",
                text: "Use powershell tool with: (Get-Acl 'path').Access | Format-List",
              },
            ],
          });
        case "set_file_acl":
          return jsonResult({
            content: [
              {
                type: "text",
                text: "Use powershell tool with: $acl = Get-Acl 'path'; $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule('user', 'FullControl', 'Allow'); $acl.SetAccessRule($accessRule); Set-Acl 'path' $acl",
              },
            ],
          });
        default:
          return jsonResult({
            content: [{ type: "text", text: `Unknown action: ${action}` }],
            error: `Invalid action: ${action}`,
          });
      }
    },
  };
}
