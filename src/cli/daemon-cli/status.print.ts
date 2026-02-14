import type { DaemonStatus } from "./status.gather.js";
import { colorize, isRich, theme } from "../../terminal/theme.js";

export function printDaemonStatus(status: DaemonStatus, opts: { json: boolean }): void {
  if (opts.json) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  const rich = isRich();
  const print = (type: "ok" | "warn" | "error", text: string) =>
    console.log(colorize(rich, theme[type], text));

  // Service status
  console.log(`\n${theme.bold("Gateway Service:")} ${status.service.label}`);
  print("ok", `  Loaded: ${status.service.loaded ? status.service.loadedText : status.service.notLoadedText}`);

  if (status.service.runtime) {
    const rt = status.service.runtime;
    if (rt.status) console.log(`  Status: ${rt.status}`);
    if (rt.pid) console.log(`  PID: ${rt.pid}`);
    if (rt.lastExitStatus !== undefined) console.log(`  Last Exit Status: ${rt.lastExitStatus}`);
  }

  // Config path
  if (status.config) {
    console.log(`\n${theme.bold("Configuration:")}`);
    console.log(`  CLI: ${status.config.cli.path}${status.config.cli.exists ? "" : " (not found)"}`);
    if (status.config.daemon) {
      console.log(`  Daemon: ${status.config.daemon.path}${status.config.daemon.exists ? "" : " (not found)"}`);
      if (status.config.mismatch) {
        print("warn", "  ⚠️  CLI and daemon config paths differ");
      }
    }
  }

  // Gateway info
  if (status.gateway) {
    console.log(`\n${theme.bold("Gateway:")}`);
    console.log(`  Bind: ${status.gateway.bindMode}${status.gateway.customBindHost ? ` (${status.gateway.customBindHost})` : ""}`);
    console.log(`  Port: ${status.gateway.port} (${status.gateway.portSource})`);
    console.log(`  Host: ${status.gateway.bindHost}`);
  }

  // RPC status
  if (status.rpc) {
    console.log(`\n${theme.bold("RPC Probe:")}`);
    if (status.rpc.ok) {
      print("ok", `  Connected: ${status.rpc.url}`);
    } else {
      print("error", `  Failed: ${status.rpc.error ?? "Unknown error"}`);
      if (status.rpc.url) console.log(`  URL: ${status.rpc.url}`);
    }
  }

  // Port diagnostics
  if (status.port) {
    console.log(`\n${theme.bold("Port Usage:")}`);
    console.log(`  Port ${status.port.port}: ${status.port.status}`);
    if (status.port.listeners.length > 0) {
      for (const l of status.port.listeners) {
        console.log(`    ${l.address ?? "unknown"} (${l.pid ?? "?"})`);
      }
    }
    if (status.port.hints.length > 0) {
      for (const h of status.port.hints) print("warn", `    ${h}`);
    }
  }

  // Last error
  if (status.lastError) {
    console.log(`\n${theme.bold("Last Error:")}`);
    print("error", `  ${status.lastError}`);
  }

  // Extra services
  if (status.extraServices.length > 0) {
    console.log(`\n${theme.bold("Extra Services:")}`);
    for (const s of status.extraServices) {
      console.log(`  ${s.label} (${s.scope}): ${s.detail}`);
    }
  }

  console.log();
}
