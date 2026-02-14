---
name: windows-performance
description: Use to monitor system performance counters (CPU, memory, disk, network) in real-time orhistorically. Thin wrapper around PerfMonitorTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 📈
    requires: []
    install:
      - label: "Install windows-performance skill"
        command: "skills install windows-performance"
    run:
      - label: "Performance queries"
        command: "python -m agents.tools.windows.perf-monitor-tool"
---

# Windows Performance Monitoring Skill

Monitor system performance counters via the built-in PerfMonitorTool.

## Usage

```
skills install windows-performance
```

Actions:

- `list_counters` – List available performance counters
- `query` (counter, instances?, sampleInterval?, duration?) – Query a counter value(s)
- `monitor` (counter, threshold, condition?, interval?) – Monitor with alert-like callback (experimental)

Common counters:

- `\Processor(_Total)\% Processor Time`
- `\Memory\Available MBytes`
- `\LogicalDisk(_Total)\% Free Space`
- `\Network Interface(*)\Bytes Total/sec`

Example:

```
/perf action=list_counters
/perf action=query counter="\Processor(_Total)\% Processor Time"
```
