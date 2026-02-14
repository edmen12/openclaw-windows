# Windows Native Tools - 精简版说明

## 概述

为了优化 token 消耗，Windows Native Tools 已从 12 个精简到 2 个核心工具。

## 当前工具列表 (2 个)

### 1. powershell-tool.ts

**功能:** Windows PowerShell 命令执行
**用途:** 通用入口，可以通过 PowerShell 命令访问所有 Windows 系统功能

**支持的操作（通过 PowerShell 命令）:**

- 系统服务管理: `Get-Service`, `Start-Service`, `Stop-Service`
- 任务调度器: `Get-ScheduledTask`, `Start-ScheduledTask`, `Disable-ScheduledTask`
- 注册表操作: `Get-ItemProperty`, `Set-ItemProperty`, `New-Item`
- 事件日志: `Get-EventLog`, `Get-WinEvent`
- 性能监控: `Get-Counter`, `Get-Process`
- 剪贴板: PowerShell COM 对象
- 网络管理: `Get-NetAdapter`, `Test-NetConnection`
- 防火墙: `Get-NetFirewallRule`, `New-NetFirewallRule`
- 用户管理: `Get-LocalUser`, `New-LocalUser`, `Add-LocalGroupMember`
- WMI 查询: `Get-WmiObject`
- 进程管理: `Get-Process`, `Start-Process`, `Stop-Process`

### 2. filesystem-tool.ts

**功能:** Windows 文件系统扩展操作
**用途:** 创建符号链接、硬链接、管理 ACL 等 Windows 特定文件系统操作

## 已移除的工具 (11 个)

以下工具已移除，功能可通过 PowerShell Tool 实现：

1. ~~service-tool.ts~~ - 使用 `Get-Service`, `Start-Service` 等
2. ~~task-tool.ts~~ - 使用 `Get-ScheduledTask`, `Start-ScheduledTask` 等
3. ~~registry-tool.ts~~ - 使用 `Get-ItemProperty`, `Set-ItemProperty` 等
4. ~~eventlog-tool.ts~~ - 使用 `Get-EventLog`, `Get-WinEvent` 等
5. ~~perf-monitor-tool.ts~~ - 使用 `Get-Counter`, `Get-Process` 等
6. ~~clipboard-tool.ts~~ - 使用 PowerShell COM 对象
7. ~~office-tool.ts~~ - 使用 PowerShell `New-Object -ComObject`
8. ~~screenshot-tool.ts~~ - 使用 PowerShell 截图命令
9. ~~user-tool.ts~~ - 使用 `Get-LocalUser`, `New-LocalUser` 等
10. ~~firewall-tool.ts~~ - 使用 `Get-NetFirewallRule`, `New-NetFirewallRule` 等
11. ~~wmi-tool.ts~~ - 使用 `Get-WmiObject`

## Token 优化

### 之前

```
12 tools × ~150 tokens = ~1800 tokens/对话
```

### 现在

```
2 tools × ~150 = ~300 tokens/对话
节省：~1500 tokens/对话 = 83% 减少！
```

## 使用示例

### Windows 服务管理

```
Agent: 启动 Windows Update 服务
PowerShell: Start-Service wuauserv
```

### 查看运行的服务

```
Agent: 列出所有运行中的服务
PowerShell: Get-Service | Where-Object {$_.Status -eq 'Running'}
```

### 查询注册表

```
Agent: 查看注册表中的某个键值
PowerShell: Get-ItemProperty "HKLM:\Software\MyApp"
```

### 防火墙规则

```
Agent: 列出所有入站防火墙规则
PowerShell: Get-NetFirewallRule -Direction Inbound
```

### WMI 查询

```
Agent: 获取系统信息
PowerShell: Get-WmiObject Win32_ComputerSystem | Select-Object Model, Manufacturer
```

## 优势

1. **减少 token 消耗** - 83% 减少
2. **保持功能完整** - 所有功能仍可通过 PowerShell 访问
3. **更灵活** - PowerShell 是通用接口
4. **易于维护** - 只需维护 2 个工具
5. **Agent 可以学习** - PowerShell 命令是标准 Windows 技能
