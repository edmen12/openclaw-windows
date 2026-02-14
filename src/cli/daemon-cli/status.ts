import type { DaemonStatusOptions } from "./types.js";
import { defaultRuntime } from "../../runtime.js";
import { colorize, isRich, theme } from "../../terminal/theme.js";
import { gatherDaemonStatus } from "./status.gather.js";
// Windows: status.print.js removed (complex status formatting)
// import { printDaemonStatus } from "./status.print.js";

export async function runDaemonStatus(opts: DaemonStatusOptions) {
  try {
    const status = await gatherDaemonStatus({
      rpc: opts.rpc,
      probe: Boolean(opts.probe),
      deep: Boolean(opts.deep),
    });
    // Windows: simple JSON-only status output
    if (opts.json) {
      const rich = isRich();
      defaultRuntime.log(
        rich ? colorize(rich, theme.muted, JSON.stringify(status, null, 2))
          : JSON.stringify(status, null, 2),
      );
    } else {
      const rich = isRich();
      defaultRuntime.log(
        rich ? colorize(rich, theme.muted, JSON.stringify(status, null, 2))
          : JSON.stringify(status, null, 2),
      );
    }
  } catch (err) {
    const rich = isRich();
    defaultRuntime.error(
      colorize(rich, theme.error, `Gateway status failed: ${String(err)}`),
    );
    defaultRuntime.exit(1);
  }
}

