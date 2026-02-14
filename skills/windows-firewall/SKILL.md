---
name: windows-firewall
description: Use to configure Windows Defender Firewall rules (list, add, remove, enable/disable). Thin wrapper around FirewallTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 🔥
    requires: []
    install:
      - label: "Install windows-firewall skill"
        command: "skills install windows-firewall"
    run:
      - label: "Firewall operations"
        command: "python -m agents.tools.windows.firewall-tool"
---

# Windows Firewall Skill

Manage Windows Defender Firewall rules via the built-in FirewallTool.

## Usage

```
skills install windows-firewall
```

Actions:

- `list_rules` (name?, direction?, action?, enabled?) – List firewall rules with optional filters
- `add_rule` (name, direction, action, program?, port?, protocol?, enabled?) – Create a new rule
- `remove_rule` (name, confirm?) – Remove a rule by name
- `enable_rule` / `disable_rule` (name) – Toggle rule state
- `rule_details` (name) – Show full rule configuration

Common directions: `Inbound`, `Outbound`
Common actions: `Allow`, `Block`, `Bypass`
Protocols: `TCP`, `UDP`, `Any`

Example:

```
/firewall action=list_rules
/firewall action=add_rule name="Allow MyApp" direction=Inbound action=Allow program="C:\Program Files\MyApp\app.exe"
/firewall action=remove_rule name="Block OldPort" confirm=true
```

⚠️ Changing firewall settings affects system security. Ensure rules are correct before applying.
