# Windows-Only Branch Windows Native Tools

## 新增工具列表

### 🔥 高优先级工具

#### 1. PowerShell 工具 (`powershell-tool.ts`)

- **功能**: 通用 PowerShell 命令执行、WMI 查询、PowerShell 模块操作
- **Actions**:
  - `version` - 获取 PowerShell 版本
  - `query` - 执行任意 PowerShell 代码
  - `wmic` - WMI 查询（Windows 系统信息）
  - `module` - PowerShell 模块操作（如 NetSecurity）

#### 2. Windows 服务管理 (`service-tool.ts`)

- **功能**: Windows 服务列表、状态、启动、停止、重启
- **Actions**:
  - `list` - 列出所有服务
  - `status` - 查询服务状态
  - `start` - 启动服务
  - `stop` - 停止服务
  - `restart` - 重启服务
  - `details` - 获取服务详细信息

#### 3. Windows 任务计划 (`task-tool.ts`)

- **功能**: Windows Task Scheduler 任务管理
- **Actions**:
  - `list` - 列出所有任务
  - `create` - 创建新任务
  - `delete` - 删除任务
  - `run` - 运行任务
  - `end` - 结束任务
  - `query` - 查询任务详情

#### 4. 注册表操作 (`registry-tool.ts`)

- **功能**: Windows 注册表读写操作
- **Actions**:
  - `read` - 读取注册表值
  - `write` - 写入注册表值
  - `delete` - 删除注册表值
  - `list` - 列出键/值
  - `exists` - 检查键是否存在

---

### 🌟 中优先级工具

#### 5. Windows 事件日志 (`eventlog-tool.ts`)

- **功能**: Windows 事件日志查询
- **Actions**:
  - `list` - 列出可用日志源
  - `query` - 查询事件日志
  - `search` - 搜索事件日志
- **日志源**: System, Application, Security, Setup, ForwardedEvents

#### 6. Windows 性能计数器 (`perf-monitor-tool.ts`)

- **功能**: 系统性能监控
- **Actions**:
  - `list` - 列出可用计数器
  - `query` - 查询性能计数器
- **支持类别**: Processor, Memory, PhysicalDisk, Network Interface

#### 7. 剪贴板操作 (`clipboard-tool.ts`)

- **功能**: Windows 剪贴板读写
- **Actions**:
  - `read` - 读取剪贴板内容
  - `write` - 写入剪贴板内容
  - `clear` - 清空剪贴板

#### 8. Windows 扩展文件系统 (`filesystem-tool.ts`)

- **功能**: Windows 特定文件系统操作
- **Actions**:
  - `create_symlink` - 创建符号链接（需管理员权限）
  - `create_junction` - 创建连接点
  - `create_hardlink` - 创建硬链接
  - `get_file_info` - 获取扩展文件信息
  - `get_file_acl/set_file_acl` - 文件权限/ACL操作

---

### 💡 低优先级工具

#### 9. Office 自动化 (`office-tool.ts`)

- **功能**: Microsoft Office 自动化
- **Actions**:
  - `excel` - Excel 操作（读取/写入单元格）
  - `word` - Word 文档操作
  - `outlook` - Outlook 邮件/任务操作
- **要求**: 需要安装 Microsoft Office

#### 10. 增强屏幕截图 (`screenshot-tool.ts`)

- **功能**: 高级屏幕截图功能
- **Actions**:
  - `capture` - 截取屏幕
  - `region` - 区域截图
  - `window` - 窗口截图
  - `multiscreen` - 多屏截图

#### 11. Windows 用户/权限 (`user-tool.ts`)

- **功能**: 用户账户和权限管理
- **Actions**:
  - `list` - 列出本地用户
  - `info` - 用户详细信息
  - `groups` - 用户组管理
  - `permissions` - 文件权限查询

#### 12. Windows 防火墙 (`firewall-tool.ts`)

- **功能**: Windows Defender 防火墙规则管理
- **Actions**:
  - `list` - 列出防火墙规则
  - `add` - 添加防火墙规则
  - `delete` - 删除防火墙规则
  - `enable` - 启用规则
  - `disable` - 禁用规则

---

## 使用方式

所有工具都通过 `system.run` 调用，或者使用专门的 PowerShell 工具：

```javascript
// 方式 1: 直接使用 PowerShell 工具
{
  "command": "powershell",
  "params": {
    "action": "wmic",
    "class": "Win32_OperatingSystem",
    "properties": ["Caption", "Version"]
  }
}

// 方式 2: 直接 system.run，使用建议的 PowerShell 命令
{
  "command": "system.run",
  "params": {
    "command": ["powershell", "-Command", "Get-Service | Where-Object {$_.Status -eq 'Running'}"]
  }
}
```

---

## 工具导出

统一导出文件: `src/agents/tools/windows/index.ts`

```typescript
export { createPowerShellTool } from "./powershell-tool.js";
export { createServiceTool } from "./service-tool.js";
export { createTaskTool } from "./task-tool.js";
export { createRegistryTool } from "./registry-tool.js";
export { createEventLogTool } from "./eventlog-tool.js";
export { createPerfMonitorTool } from "./perf-monitor-tool.js";
export { createClipboardTool } from "./clipboard-tool.js";
export { createFilesystemTool } from "./filesystem-tool.js";
export { createOfficeTool } from "./office-tool.js";
export { createScreenshotTool } from "./screenshot-tool.ts";
export { createUserTool } from "./user-tool.js";
export { createFirewallTool } from "./firewall-tool.js";
```

---

## 集成到 Agent

要将这些工具集成到 Agent，在 agent 配置文件中添加：

```typescript
import { createServiceTool, createTaskTool, createRegistryTool } from "../tools/windows/index.js";

export const myTool = createServiceTool({
  config: cfg,
  agentSessionKey: sessionKey,
});
```

---

## 注意事项

1. **权限要求**: 某些操作（如修改注册表、服务）需要管理员权限
2. **Office 要求**: Office 自动化需要安装 Microsoft Office
3. **防火墙**: 防火墙操作需要管理员权限
4. **服务管理**: 某些系统服务可能无法停止/启动

---

## 总结

创建了 **12 个 Windows 原生工具**，涵盖了 Windows 管理的核心功能：

✅ **系统管理**: PowerShell, WMI, 注册表, 事件日志
✅ **进程/服务**: 任务计划, 性能监控
✅ **文件系统**: 扩展链接, 权限管理
✅ **网络管理**: 防火墙规则
✅ **办公自动化**: Office 集成
✅ **UI 操作**: 剪贴板, 屏幕截图

这些工具让 Agent 可以深入控制 Windows 系统的所有方面！🚀
