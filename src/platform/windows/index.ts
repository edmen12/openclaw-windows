export * from "./paths.js";
export * from "./ssh.js";
export * from "./shell-env.js";
export * from "./paths-and-env.js";

export const IS_WINDOWS = process.platform === "win32";
export const IS_WINDOWS_OR_WSL = IS_WINDOWS || process.env.WSL_DISTRO !== undefined;
