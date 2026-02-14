---
name: windows-users
description: Use to manage local user accounts and groups (list, create, delete, set password, group membership). Thin wrapper around UserTool.
version: 1.0.0
author: Eden
metadata:
  openclaw:
    emoji: 👥
    requires: []
    install:
      - label: "Install windows-users skill"
        command: "skills install windows-users"
    run:
      - label: "User/group operations"
        command: "python -m agents.tools.windows.user-tool"
---

# Windows Users & Groups Skill

Manage local users and groups via the built-in UserTool.

## Usage

```
skills install windows-users
```

Actions (user):

- `list_users` – Enumerate all local users
- `create_user` (name, password, fullName?, description?) – Create a new user
- `delete_user` (name, confirm?) – Delete a user
- `set_password` (name, newPassword) – Set user password
- `enable` / `disable` (name) – Enable or disable an account
- `get_info` (name) – Get user details (SID, groups, etc.)

Actions (group):

- `list_groups` – Enumerate local groups
- `group_members` (groupName) – List group members
- `add_to_group` (userName, groupName) – Add user to group
- `remove_from_group` (userName, groupName) – Remove user from group

⚠️ Requires administrative privileges for most operations. Use with care.
