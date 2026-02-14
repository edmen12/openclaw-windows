import type { Command } from "commander";

export function registerNodeCli(program: Command) {
  program.command("node").description("Run a headless node host (Windows-only: simplified for Windows platform)");
}
