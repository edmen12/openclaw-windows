# OpenClaw Skills 分类说明

## 概述

OpenClaw 共有 **65 个 Built-in Skills**，按用途分类为 **9 大类**。

## 分类统计

| 分类             | 数量 | emoji | 说明                           |
| ---------------- | ---- | ----- | ------------------------------ |
| **内置技能**     | 16   | 📦    | 只需配置即可使用，无需额外安装 |
| **Windows 管理** | 9    | 🖥️    | Windows 系统监控和管理（新增） |
| **通讯社交**     | 3    | 📱    | 社交平台和通讯工具             |
| **搜索 AI**      | 4    | 🔍    | 需要 API Key 的 AI 和搜索      |
| **媒体音频**     | 8    | 🎵    | 音频、视频、图像处理           |
| **购物订单**     | 1    | 🛒    | 购物服务平台                   |
| **交易金融**     | 3    | 💰    | 加密货币、股票交易             |
| **智能家居**     | 11   | 🏠    | 硬件设备控制                   |
| **开发工具**     | 10   | 🔧    | 开发辅助和工具                 |

**总计**: 65 个 skills

---

## 🔧 开发环境集成

### 使用分类数据

`skills-categories.json` 文件定义了所有 skills 的分类，UI 可以通过以下方式使用：

```typescript
import skillsCategories from '../skills/skills-categories.json';

// 获取所有分类
const categories = Object.keys(skillsCategories);

// 获取特定分类的所有 skills
const builtInSkills = skillsCategories['built-in'].skills;

// 获取分类元数据
const categoryInfo = {
  label: skillsCategories.builtIn.label,
  emoji: skillsCategories.built-in.emoji,
  description: skillsCategories.built-in.description
};
```

### 在 UI 中显示

```tsx
{
  Object.entries(skillsCategories).map(([key, category]) => (
    <SkillCategory
      key={key}
      label={category.label}
      emoji={category.emoji}
      description={category.description}
      skills={category.skills}
    />
  ));
}
```

---

## 📦 内置技能（16）- 推荐

这些技能不需要外部工具，只需配置即可使用：

### 必备技能

- **canvas** - HTML 内容显示（游戏、可视化、仪表板）
- **coding-agent** - 代码生成、审查、重构
- **healthcheck** - 系统健康检查
- **session-logs** - 会话日志查看

### 社交和生产力

- **discord** - Discord 控制和管理
- **email-fetch** - Gmail/Outlook 邮件获取
- **github** - GitHub 交互和 CI/CD
- **notion** - Notion 笔记管理
- **slack** - Slack 集成
- **summarize** - 内容摘要

### 监控和工具

- **model-usage** - 模型使用统计
- **openclaw-repo-monitor** - 仓库监控
- **opencode-coder** - OpenCode 编码器
- **skill-creator** - 自定义技能创建
- **voice-call** - 语音通话

### 自动化

- **daily-briefing** - 每日简报（新闻、邮件、天气）

---

## 🖥️ Windows 系统管理（9）- Windows 专用

新增的 Windows 系统管理技能：

- **windows-clipboard** - 剪贴板操作
- **windows-eventlog** - 事件日志查询
- **windows-firewall** - 防火墙管理
- **windows-office** - Office 自动化
- **windows-performance** - 性能监控
- **windows-registry** - 注册表操作
- **windows-service** - 服务管理
- **windows-task** - Task Scheduler 管理
- **windows-users** - 用户管理

---

## 📱 通讯和社交（3）

需要外部 CLI 工具：

- **bluebubbles** - BlueBubbles (iMessage)
- **bird** - X/Twitter
- **wacli** - WhatsApp

---

## 🔍 搜索和 AI（4）

需要 API Key：

- **gemini** - Gemini API
- **serpapi-search** - SerpAPI
- **serper-search** - Serper API
- **tavily-search** - Tavily

---

## 🎵 媒体和音频（8）

需要音频/视频处理工具：

- **gifgrep** - GIF 搜索和转换
- **openai-image-gen** - OpenAI 图像生成
- **openai-whisper** - Whisper 语音识别
- **qwen3-tts-local** - Qwen3 TTS 本地模型
- **songsee** - 音乐识别
- **spotify-player** - Spotify 播放器
- **video-frames** - 视频帧提取
- **whisper-large-v3-turbo** - Whisper 大型模型

---

## 💰 交易和金融（3）

需要 API/CLI：

- **crypto-wallet-1.0.0** - 加密货币钱包
- **mt5-control** - MT5 交易控制
- **silicon-trader** - 硅谷交易

---

## 🏠 智能家居和设备（11）

需要特定硬件/服务：

- **blucli** - Bluesound/NAD 播放器
- **eightctl** - Eight Sleep 智能床
- **openhue** - Philips Hue 灯光
- **sonoscli** - Sonos 音响
- **gog** - GOG 游戏平台
- **mcporter** - Minecraft 服务器
- **nano-banana-pro** - Nano Banana Pro
- **nano-pdf** - Nano PDF
- **peekaboo** - Peekaboo 设备
- **oracle** - Oracle 集成
- **ordercli** - Order CLI

---

## 🔧 开发工具（10）

需要特定 CLI 或服务：

- **1password** - 1Password CLI
- **clawhub** - ClawHub 技能包管理器
- **blogwatcher** - Blog 监控
- **humanizer-1.0.0** - 文本人性化
- **local-places** - 本地地点搜索
- **goplaces** - Google Places API
- **minicpm-vision** - MiniCPM-V 视觉
- **obsidian** - Obsidian 笔记
- **trello** - Trello 看板
- **weather** - 天气查询

---

## 🛒 购物和订单（1）

- **food-order** - Foodora 订单

---

## UI 显示建议

### 1. 分类优先级

**推荐使用顺序**（从高到低）：

1. 内置技能 - 所有用户都应该看到
2. Windows 管理 - Windows-only 版本重点推荐
3. 通讯社交 - 常用功能
4. 开发工具 - 开发者常用
5. 搜索 AI - 需要 API key
6. 媒体音频 - 需要外部工具
7. 智能家居 - 需要硬件
8. 交易金融 - 特定需求
9. 购物订单 - 特定服务

### 2. 分组显示

建议使用折叠面板或标签页展示：

```
📦 内置技能 (16)
  - canvas
  - coding-agent
  - ...

🖥️ Windows 管理 (9) ⭐ 推荐
  - windows-clipboard
  - windows-eventlog
  - ...

📱 通讯社交 (3)
  - bluebubbles
  - ...
```

### 3. 筛选逻辑

- Windows-only 版本：显示所有 Windows 相关技能
- 用户依赖：根据已安装的工具动态显示
- 配置依赖：根据 `skills.entries.*` 配置项显示

### 4. 默认展开

建议默认展开：

- 📦 内置技能
- 🖥️ Windows 管理
- 🔧 开发工具

其他分类默认折叠，减少信息过载。

---

## 技能依赖检查逻辑

参考 `src/agents/skills/config.ts` 中的 `shouldIncludeSkill` 函数：

```typescript
// 检查依赖的完整逻辑
{
  // 1. 检查技能是否启用
  skillConfig?.enabled !== false;

  // 2. 检查是否在允许列表中
  isBundledSkillAllowed(entry, allowlist);

  // 3. 检查系统平台兼容性
  osList.includes(platform);

  // 4. 检查必需的二进制文件
  requiredBins.every((bin) => hasBinary(bin));

  // 5. 检查必需的环境变量
  requiredEnv.every((env) => process.env[env]);

  // 6. 检查必需的配置
  requiredConfig.every((path) => isConfigPathTruthy(config, path));
}
```

---

## 维护建议

1. **新增技能**：更新 `skills-categories.json` 和此文档
2. **废弃技能**：标记为未分类或移动到废弃分类
3. **分类调整**：如有需要，重新分类技能并更新文档
4. **UI 优化**：根据用户反馈调整显示逻辑
