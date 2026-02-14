import type { Command } from "commander";

// Windows: node daemon commands removed
export function registerNodeCli(program: Command) {
  program.command("node").description("Run a headless node host");
}
