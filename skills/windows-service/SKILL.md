---
name: windows-service
description: Use to manage Windows services (list, start, stop, restart, query status and details). Installs as a separate skill; not built-in.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 🔧
    requires: []
    install:
      - label: "Install windows-service skill"
        command: "skills install windows-service"
    run:
      - label: "Service operations"
        command: "python -m agents.tools.windows.service-tool"
---

# Windows Service Skill

Manage Windows services via the Service Tool.

## Installation

```
skills install windows-service
```

This skill package contains the service management tool and its dependencies.

## Usage

Once installed, the Agent will load `windows-service` tool automatically.

Actions:

- `list` (filter?, properties?) – List services
- `status` (name) – Get service status
- `start` (name) – Start a service
- `stop` (name) – Stop a service
- `restart` (name) – Restart a service
- `details` (name) – Detailed service information

## Examples

```
/service action=list
/service action=status name=Spooler
/service action=start name=Spooler
```
