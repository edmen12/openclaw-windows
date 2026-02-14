---
name: windows-eventlog
description: Use to query Windows Event Logs (read, filter, tail). Thin wrapper around EventLogTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 📋
    requires: []
    install:
      - label: "Install windows-eventlog skill"
        command: "skills install windows-eventlog"
    run:
      - label: "Event log operations"
        command: "python -m agents.tools.windows.eventlog-tool"
---

# Windows Event Log Skill

Query Windows Event Logs via the built-in EventLogTool.

## Usage

```
skills install windows-eventlog
```

Actions:

- `query` (logName, startTime?, endTime?, source?, level?, eventId?) – Query events with filters
- `tail` (logName, lines?, level?) – Tail recent events
- `clear` (logName, confirm?) – Clear a log (requires confirmation)

Common logs: `System`, `Application`, `Security`, `Setup`, `ForwardedEvents`.

Example:

```
/eventlog action=query logName=System level=Error
/eventlog action=tail logName=Application lines=20
```
