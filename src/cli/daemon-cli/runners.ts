export { runDaemonInstall } from "./install.js";

// Windows: lifecycle.js not supported (Linux/macOS system services)
// export {
//   runDaemonRestart,
//   runDaemonStart,
//   runDaemonStop,
//   runDaemonUninstall,
// } from "./lifecycle.js";

export { runDaemonStatus } from "./status.js";
