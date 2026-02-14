---
name: windows-task
description: Use to manage Windows Task Scheduler (list, create, delete, run, query tasks). Thin wrapper around TaskTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 📅
    requires: []
    install:
      - label: "Install windows-task skill"
        command: "skills install windows-task"
    run:
      - label: "Task operations"
        command: "python -m agents.tools.windows.task-tool"
---

# Windows Task Scheduler Skill

Manage scheduled tasks via the built-in Task Tool.

## Usage

Install the skill:

```
skills install windows-task
```

Actions:

- `list` (name?) – List tasks
- `create` (name, program, arguments, schedule, startWhenAvailable, runLevel?) – Create a new task
- `delete` (name) – Delete a task
- `run` (name) – Run a task immediately
- `info` (name) – Get detailed task information

All actions are executed through the underlying TaskTool and require appropriate privileges.
