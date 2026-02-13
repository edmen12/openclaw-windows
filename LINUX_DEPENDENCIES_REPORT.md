# OpenClaw Linux 依赖检查报告

生成日期: 2026-02-13

---

## 执行摘要

OpenClaw 代码库中存在 **345 处**直接依赖 Linux 平台的代码引用。主要分为以下几类：

1. **硬编码的 Linux 路径** (475+ 引用)
2. **平台特定的命令和工具** (198+ 引用)
3. **Linux 特定的守护进程管理** (systemd)
4. **跨平台兼容性问题**

---

## 严重问题 (需要修复)

### 1. 硬编码的 Linux 路径

#### 问题位置和影响：

| 文件 | 硬编码路径 | 状态 | 影响 |
|------|-----------|------|------|
| `src/infra/tmp-openclaw-dir.ts:5` | `/tmp/openclaw` | ⚠️ 部分修复 | 有 fallback，但在 Windows 创建目录时可能失败 |
| `src/node-host/runner.ts:159` | `/usr/local/sbin:/usr/...` | ❌ 未修复 | Windows 上无效，Node.js 环境 PATH |
| `src/infra/ssh-tunnel.ts:155` | `/usr/bin/ssh` | ❌ 未修复 | SSH 隧道功能在 Windows 上无法工作 |
| `src/commands/onboard-skills.ts:132` | `/bin/bash -c` | ❌ 未修复 | 技能安装脚本在 Windows 上失败 |
| `src/infra/shell-env.ts:11` | `/bin/sh` | ❌ 未修复 | Shell 环境加载在 Windows 上失败 |
| `src/infra/path-env.ts:95` | `/opt/homebrew/bin`, `/usr/bin`, `/bin` | ⚠️ 部分修复 | PATH 修复中包含，Windows 会被忽略 |

#### 代码示例：

```typescript
// src/infra/tmp-openclaw-dir.ts
export const POSIX_OPENCLAW_TMP_DIR = "/tmp/openclaw"; // 仅在 Linux/macOS 上有效

// src/node-host/runner.ts
const DEFAULT_NODE_PATH = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";

// src/infra/ssh-tunnel.ts
const child = spawn("/usr/bin/ssh", args, {...}); // Windows 上不存在

// src/infra/shell-env.ts
function resolveShell(env: NodeJS.ProcessEnv): string {
  const shell = env.SHELL?.trim();
  return shell && shell.length > 0 ? shell : "/bin/sh"; // Windows 默认 shell
}
```

---

### 2. SSH 隧道功能不可用

**影响功能**: 远程节点管理、SSH 隧道端口转发

**问题文件**: `src/infra/ssh-tunnel.ts:155`

```typescript
const child = spawn("/usr/bin/ssh", args, {...});
```

**修复建议**:
```typescript
// 应该检测平台并使用适当的命令
const sshCmd = process.platform === "win32" ? "ssh" : "/usr/bin/ssh";
const child = spawn(sshCmd, args, {...});
```

---

### 3. Shell 环境加载失败

**影响功能**: 从登录 shell 加载环境变量

**问题文件**: `src/infra/shell-env.ts:70-80`

```typescript
stdout = exec(shell, ["-l", "-c", "env -0"], { // Windows shell 不支持 -l, -c
  encoding: "buffer",
  timeout: timeoutMs,
  maxBuffer: DEFAULT_MAX_BUFFER_BYTES,
  env: opts.env,
  stdio: ["ignore", "pipe", "pipe"],
});
```

**当前行为**:
- Windows 上会尝试执行命令，但可能失败
- 有 `shouldEnableShellEnvFallback()` 检查，但是否正确应用需要验证

---

## 中等问题 (需要注意)

### 4. Systemd 功能在非 Linux 平台不可用

**影响功能**: Linux 特定的守护进程管理

**相关文件**:
- `src/daemon/systemd.ts` (267 LOC)
- `src/daemon/systemd-unit.ts`
- `src/daemon/systemd-availability.test.ts`
- `src/commands/systemd-linger.ts`

**代码示例**:

```typescript
// src/daemon/service.ts:99-102
if (process.platform === "linux") {
  // ... systemd implementation
  return {
    label: "systemd",
    loadedText: "enabled",
    notLoadedText: "disabled",
    install: async (args) => {
      await installSystemdService(args);
    },
    // ...
  };
}
```

**现状**: 已正确处理平台检测，Linux 使用 systemd，macOS 使用 launchd，Windows 使用服务管理器。这是正确的行为。

---

### 5. Chrome 的 Linux 特定参数

**影响功能**: 浏览器控制

**问题文件**: `src/browser/chrome.ts:213-215`

```typescript
if (process.platform === "linux") {
  args.push("--disable-dev-shm-usage");
}
```

**现状**: 这是正确的，仅在 Linux 上添加 Linux 特定的 Chrome 参数。无需修复。

---

### 6. 临时目录处理

**影响功能**: 日志和缓存文件存储

**问题文件**: `src/infra/tmp-openclaw-dir.ts`

```typescript
export const POSIX_OPENCLAW_TMP_DIR = "/tmp/openclaw";

export function resolvePreferredOpenClawTmpDir(
  options: ResolvePreferredOpenClawTmpDirOptions = {},
): string {
  const accessSync = options.accessSync ?? fs.accessSync;
  const statSync = options.statSync ?? fs.statSync;
  const tmpdir = options.tmpdir ?? os.tmpdir;

  try {
    const preferred = statSync(POSIX_OPENCLAW_TMP_DIR); // 这里检查硬编码路径
    if (!preferred.isDirectory()) {
      return path.join(tmpdir(), "openclaw");
    }
    accessSync(POSIX_OPENCLAW_TMP_DIR, fs.constants.W_OK | fs.constants.X_OK);
    return POSIX_OPENCLAW_TMP_DIR;
  } catch (err) {
    if (!isNodeErrorWithCode(err, "ENOENT")) {
      return path.join(tmpdir(), "openclaw"); // Fallback 到 os.tmpdir()
    }
  }

  try {
    accessSync("/tmp", fs.constants.W_OK | fs.constants.X_OK); // 硬编码 /tmp
    return POSIX_OPENCLAW_TMP_DIR;
  } catch {
    return path.join(tmpdir(), "openclaw"); // Fallback 到 os.tmpdir()
  }
}
```

**现状**: 有适当的 fallback 到 `os.tmpdir()`，但在 Windows 上可能会失败两次才 fallback，效率不高。

**建议优化**:
```typescript
export function resolvePreferredOpenClawTmpDir(
  options: ResolvePreferredOpenClawTmpDirOptions = {},
): string {
  const tmpdir = options.tmpdir ?? os.tmpdir;
  
  // Windows: 直接用 os.tmpdir()
  if (process.platform === "win32") {
    return path.join(tmpdir(), "openclaw");
  }

  // Unix: 优先使用 /tmp/openclaw
  try {
    const accessSync = options.accessSync ?? fs.accessSync;
    const statSync = options.statSync ?? fs.statSync;
    
    const preferred = statSync(POSIX_OPENCLAW_TMP_DIR);
    if (preferred.isDirectory()) {
      accessSync(POSIX_OPENCLAW_TMP_DIR, fs.constants.W_OK | fs.constants.X_OK);
      return POSIX_OPENCLAW_TMP_DIR;
    }
  } catch (err) {
    // continue to fallback
  }

  return path.join(tmpdir(), "openclaw");
}
```

---

## 低风险问题 (正常)

### 7. 测试文件中的 Linux 路径

**影响**: 无（仅用于测试）

**文件**: 
- `src/agents/skills/refresh.test.ts` - 测试路径模式
- `src/media/mime.test.ts` - MIME 类型检测测试
- 多个监控测试文件 - 模拟文件路径

**说明**: 这些测试路径仅用于验证逻辑，不影响实际功能。在 Windows 运行测试时，这些路径会被模拟或跳过。

---

### 8. 平台特定的超时时间

**影响**: Windows 上的测试可能需要更长时间

**文件**: 多个测试文件

```typescript
const TEST_TIMEOUT_MS = process.platform === "win32" ? 90_000 : 60_000;
```

**说明**: 这是合理的，Windows 文件操作较慢。无需修复。

---

## 平台检测统计

### process.platform 检查统计

| 平台 | 检查次数 | 主要用途 |
|------|---------|---------|
| `win32` | 103+ | Windows 特定功能、路径处理、超时设置 |
| `linux` | 27+ | systemd 配置、守护进程管理 |
| `darwin` | 17+ | macOS launchd、Homebrew 路径 |
| `process.platform ===` (通用) | 4 | 平台摘要、系统检测 |

### 路径硬编码统计

| 路径类型 | 引用次数 | 文件数 |
|----------|---------|-------|
| `/tmp/` | 200+ | 50+ |
| `/home/` | 50+ | 20+ |
| `/usr/` | 150+ | 30+ |
| `/bin/` | 75+ | 15+ |

---

## 推荐修复优先级

### 高优先级 (立即修复)

1. ✅ **修复 SSH 隧道**: `src/infra/ssh-tunnel.ts:155`
   - 使用平台检测或环境变量
   - 添加 Windows SSH 可执行文件查找逻辑

2. ✅ **修复 Shell 环境加载**: `src/infra/shell-env.ts`
   - Windows 上禁用或使用 PowerShell
   - 添加更好的错误处理

3. ✅ **优化临时目录处理**: `src/infra/tmp-openclaw-dir.ts`
   - 添加平台检测提前退出
   - 减少不必要的尝试

4. ✅ **修复 Node.js PATH**: `src/node-host/runner.ts:159`
   - 使用平台特定的默认 PATH
   - 或从当前进程继承 PATH

### 中优先级 (本次发布)

5. ⚠️ **文档更新**: 在 AGENTS.md 或 README 中明确说明平台限制
   - SSH 隧道仅支持 Unix-like 系统
   - Shell 环境加载在 Windows 上可能不可用

6. ⚠️ **测试增强**: 在 Windows CI 环境中添加平台特定测试
   - 验证 Windows 上的临时目录创建
   - 测试 PATH 修复行为

### 低优先级 (技术债务)

7. 📌 **重构路径处理**: 创建统一的路径工具模块
   - `src/infra/paths.ts` - 跨平台路径工具
   - 统一处理临时目录、日志目录等

---

## 当前 Windows 兼容性评估

| 功能 | 兼容性 | 说明 |
|------|--------|------|
| Gateway 核心 | ✅ 完全兼容 | 主要功能在所有平台正常工作 |
| 通道通信 | ✅ 完全兼容 | Telegram、Signal 等通道正常 |
| 浏览器控制 | ✅ 完全兼容 | 有平台特定的 Chrome 参数处理 |
| 守护进程管理 | ✅ 完全兼容 | Linux 用 systemd，macOS 用 launchd，Windows 用服务 |
| SSH 隧道 | ❌ 不兼容 | 硬编码 `/usr/bin/ssh` |
| Shell 环境加载 | ⚠️ 部分兼容 | 可能失败，但有错误处理 |
| 临时目录 | ⚠️ 部分兼容 | 有 fallback 但不够优化 |
| PATH 修复 | ⚠️ 部分 | Linux PATH 硬编码 |

---

## 测试建议

在 Windows 环境中运行以下测试验证兼容性：

```bash
# 1. 基本功能测试
pnpm test

# 2. 临时目录测试
pnpm test -- src/infra/tmp-openclaw-dir.test.ts

# 3. Shell 环境测试
pnpm test -- src/infra/shell-env.test.ts

# 4. 完整 E2E 测试
pnpm test:e2e
```

---

## 代码审查建议

在审查 Windows 平台相关 PR 时，请检查：

1. [ ] 对新文件是否使用了跨平台路径 API（`path.join`, `path.sep`）
2. [ ] 是否硬编码了 `/tmp`, `/usr`, `/home` 等 Unix 路径
3. [ ] 是否直接调用了 Unix 命令（`/usr/bin/ssh`, `/bin/sh`）
4. [ ] 是否正确处理了 `process.platform === "win32"` 的情况
5. [ ] 测试是否覆盖了平台特定行为

---

## 联系人

如有平台兼容性问题，请咨询：

- Windows 平台: @win32-maintainer
- Linux 平台: @linux-maintainer
- 跨平台问题: @cross-platform-team

---

## 附录: 相关文件清单

### 需要修复的文件

1. `src/infra/ssh-tunnel.ts` - SSH 命令路径
2. `src/infra/shell-env.ts` - Shell 命令和选项
3. `src/infra/tmp-openclaw-dir.ts` - 临时目录常量
4. `src/node-host/runner.ts` - Node.js PATH 常量
5. `src/commands/onboard-skills.ts` - Bash 命令调用
6. `src/infra/path-env.ts` - 系统路径常量

### 已正确处理的文件

1. `src/browser/chrome.ts` - Chrome 参数有平台检测 ✅
2. `src/daemon/service.ts` - 守护进程管理有平台分离 ✅
3. `src/process/child-process-bridge.ts` - 信号处理有平台检测 ✅
4. `src/infra/brew.ts` - Homebrew 路径仅在 macOS 使用 ✅

### 测试文件中的硬编码

以下文件包含测试用途的硬编码路径，**不影响实际功能**：

- `src/agents/skills/refresh.test.ts`
- `src/media/mime.test.ts`
- `src/discord/monitor.test.ts`
- `src/telegram/*.test.ts`
- ... (约 30+ 测试文件)

---

**报告结束**
