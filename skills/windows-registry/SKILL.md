---
name: windows-registry
description: Use to read and modify Windows Registry keys/values. Thin wrapper around RegistryTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 📝
    requires: []
    install:
      - label: "Install windows-registry skill"
        command: "skills install windows-registry"
    run:
      - label: "Registry operations"
        command: "python -m agents.tools.windows.registry-tool"
---

# Windows Registry Skill

Read and modify Windows Registry via the built-in RegistryTool.

## Usage

```
skills install windows-registry
```

Actions:

- `read` (key, valueName?) – Read a registry key/value
- `write` (key, valueName, value, type?) – Write a registry value
- `delete` (key, valueName?) – Delete a key or value
- `list` (key) – List subkeys and values
- `exists` (key, valueName?) – Check existence

Supported value types: `REG_SZ`, `REG_DWORD`, `REG_QWORD`, `REG_BINARY`, `REG_MULTI_SZ`.

⚠️ Modifying the registry can affect system stability. Use with caution and prefer reading over writing.
