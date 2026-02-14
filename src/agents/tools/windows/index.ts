/**
 * Windows Native Tools Collection
 *
 * Windows-only tools for system administration, process management,
 * and native Windows API access through PowerShell and COM automation.
 */

export { createPowerShellTool } from "./powershell-tool.js";

export { createFilesystemTool } from "./filesystem-tool.js";

/**
 * All Windows tool creators (for batch registration)
 */
export const WINDOWS_TOOL_CREATORS = ["createPowerShellTool", "createFilesystemTool"] as const;
