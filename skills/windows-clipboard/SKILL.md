---
name: windows-clipboard
description: Use to read from and write to the Windows clipboard (text, images, files). Thin wrapper around ClipboardTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 📋
    requires: []
    install:
      - label: "Install windows-clipboard skill"
        command: "skills install windows-clipboard"
    run:
      - label: "Clipboard operations"
        command: "python -m agents.tools.windows.clipboard-tool"
---

# Windows Clipboard Skill

Read and write the Windows clipboard via the built-in ClipboardTool.

## Usage

```
skills install windows-clipboard
```

Actions:

- `read` (format?) – Read clipboard content (text or image)
- `write_text` (text) – Write text to clipboard
- `write_image` (imagePath) – Write an image file to clipboard
- `clear` – Clear clipboard
- `has_text` / `has_image` – Check content types

Example:

```
/clipboard action=read
/clipboard action=write_text text="Hello from OpenClaw"
/clipboard action=write_image imagePath="C:\Users\Public\Pictures\sample.png"
```
