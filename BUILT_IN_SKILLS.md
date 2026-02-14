# OpenClaw Built-in Skills 整理

## 概述

当前 `skills/` 目录中共有 **65 个 skills**，但并非所有都是真正的 "built-in"（内置）技能。

## 分类

### 📦 纯 Skills（真正的 Built-in Skills - 需要配置即可使用）

这些技能只需要配置即可，不需要额外安装外部工具：

1. **canvas** - 显示 HTML 内容（游戏、可视化、仪表板）
2. **coding-agent** - 代码生成、审查和重构
3. **discord** - Discord 控制（消息、反应、频道管理）
4. **daily-briefing** - 每日简报（新闻、邮件、趋势、天气）
5. **email-fetch** - Gmail/Outlook 邮件获取（IMAP）
6. **github** - GitHub 交互
7. **healthcheck** - 系统健康检查
8. **model-usage** - 模型使用情况
9. **notion** - Notion 集成
10. **openclaw-repo-monitor** - OpenClaw 仓库监控
11. **opencode-coder** - OpenCode 编码器
12. **session-logs** - 会话日志查看
13. **skill-creator** - 自定义技能创建器
14. **slack** - Slack 集成
15. **summarize** - 内容摘要
16. **voice-call** - 语音通话

**小计**: 16 个

---

### 🖥️ Windows 系统管理 Skills（Windows 专用）

这些是我们在本次重构中添加的 Windows 系统管理技能：

17. **windows-clipboard** - Windows 剪贴板操作
18. **windows-eventlog** - Windows 事件日志查询
19. **windows-firewall** - Windows 防火墙管理
20. **windows-office** - Office 自动化
21. **windows-performance** - Windows 性能监控
22. **windows-registry** - Windows 注册表操作
23. **windows-service** - Windows 服务管理
24. **windows-task** - Windows Task Scheduler 管理
25. **windows-users** - Windows 用户管理

**小计**: 9 个

---

### 📱 通讯和社交媒体 Skills（需要外部工具）

这些技能需要外部服务或 CLI 工具：

26. **bluebubbles** - BlueBubbles external channel plugin (iMessage)
27. **1password** - 1Password CLI (op)
28. **bird** - X/Twitter CLI (GraphQL + cookie auth)
29. **wacli** - WhatsApp CLI

**小计**: 4 个

---

### 🔍 搜索和 AI Skills（需要 API Key）

这些技能需要 API 访问权限：

30. **gemini** - Gemini API
31. **serpapi-search** - SerpAPI 搜索
32. **serper-search** - Serper 搜索
33. **tavily-search** - Tavily 搜索

**小计**: 4 个

---

### 🔊 媒体和音频 Skills（需要外部工具）

这些技能需要音频/视频处理工具：

34. **gifgrep** - GIF 搜索和转换
35. **openai-image-gen** - OpenAI 图像生成
36. **openai-whisper** - Whisper 语音识别
37. **qwen3-tts-local** - Qwen3 TTS 本地模型
38. **whisper-large-v3-turbo** - Whisper 大型模型
39. **songsee** - 音乐识别
40. **spotify-player** - Spotify 播放器控制
41. **video-frames** - 视频帧提取

**小计**: 8 个

---

### 🛒 购物和订单 Skills（需要特定服务）

42. **food-order** - Foodora 订单

**小计**: 1 个

---

### 📈 交易和金融 Skills（需要 API/CLI）

43. **crypto-wallet** - 加密货币钱包
44. **mt5-control** - MT5 交易控制
45. **silicon-trader** - 硅谷交易

**小计**: 3 个

---

### 🏠 智能家居和设备控制 Skills（需要特定硬件/服务）

46-57:

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

**小计**: 12 个

---

### 🔧 开发和工具类 Skills（需要特定 CLI）

58-65:

- **clawhub** - ClawHub CLI（技能包管理器）
- **blogwatcher** - Blog 监控
- **obsidian** - Obsidian 笔记
- **local-places** - 本地地点
- **goplaces** - GoPlaces
- **trello** - Trello 看板
- **weather** - 天气查询
- **humanizer** - 文本人性化

**小计**: 8 个

---

## 总结

- **总计**: 65 个 skills
- **真正的 Built-in（纯配置）**: 16 个
- **Windows 系统管理**: 9 个（新增）
- **需要外部工具/API**: 40 个

## 建议

1. **分类显示**: 在 UI 中应该按类别显示 skills，而不是全部混在一起
2. **技能依赖**: 对于需要外部工具的 skills，应该明确提示用户需要安装什么
3. **优先级推荐**: Built-in skills 应该作为推荐，外部工具作为可选
4. **Windows 过滤**: 在 Windows-only 版本中，应该过滤掉 Linux/macOS 相关的 skills
