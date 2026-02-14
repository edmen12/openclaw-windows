# 🦞 OpenClaw — Personal AI Assistant (Windows-Only Fork)

> Windows-native fork of OpenClaw — macOS/Linux support removed for a cleaner Windows experience.

**OpenClaw** is a personal AI assistant you run on your own Windows machine. It integrates with your existing messaging channels (Telegram, Slack, Discord, Signal, Line, BlueBubbles) and includes powerful tools for automation, web browsing, voice interaction, and more.

**Windows-Only Fork**: This is maintained fork with optimized Windows support. For cross-platform builds (macOS/Linux), use the [upstream repo](https://github.com/openclaw/openclaw).

## 🚀 Features

- **Multi-Channel Inbox**: Telegram, Slack, Discord, Signal, Line, BlueBubbles, WhatsApp (limited), WebChat
- **Multi-Agent Routing**: Route different channels/accounts to isolated workspaces
- **Built-in Tools**: Browser automation, file system operations, cron jobs, session management
- **Voice & Audio**: Speech-to-speech interaction with Windows nodes
- **Live Canvas**: Agent-driven visual workspace with A2UI rendering
- **Windows-Native**: Optimized for Windows 10/11, no WSL required

---

## 📦 Quick Start

**Requirements**: Node.js ≥22, Windows 10/11

### Install

```bash
npm install -g openclaw@latest
# or: pnpm add -g openclaw@latest

# Run onboarding wizard
openclaw onboard
```

### Run

**Foreground mode (recommended for development)**:
```bash
openclaw gateway --port 18789
```

**Background operation**:
- Run in separate terminal, or
- Use Windows Task Scheduler for auto-start

### Send Messages

```bash
# Telegram: Send to your bot
openclaw message send --channel telegram --to <your_telegram_id> --message "Hello!"

# Slack: Send to channel/DM
openclaw message send --channel slack --to <channel_or_user_id> --message "Hello!"

# Talk to the assistant directly
openclaw agent --message "Summarize my emails" --thinking high
```

---

## 🔧 Configuration

**Configuration file**: `C:\Users\User\.openclaw\config\config.json5`

### Basic Setup

1. **Add a model** (Claude, OpenAI, or other supported provider):
   ```bash
   openclaw models add --provider anthropic --profile claude-pro
   ```

2. **Configure channels** (example: Telegram):
   ```bash
   openclaw telegram add
   # Follow prompts to connect your Telegram bot
   ```

3. **Test connection**:
   ```bash
   openclaw message send --channel telegram --to <your_id> --message "Are you working?"
   ```

### Channel Configuration

**Telegram**:
```json5
{
  "channels": {
    "telegram": {
      "accounts": {
        "mybot": {
          "botToken": "your_bot_token",
          "userId": "your_telegram_id"
        }
      }
    }
  }
}
```

**Slack**:
```json5
{
  "channels": {
    "slack": {
      "accounts": {
        "workspace": {
          "appToken": "xapp-...",
          "botToken": "xoxb-..."
        }
      }
    }
  }
}
```

---

## 🛠️ Windows-Only Features

This fork includes Windows-specific tools and optimizations:

- **Windows File System**: Direct access to Windows paths, junctions, ACLs
- **Windows Registry**: Registry read/write operations
- **Windows Services**: Service management (start, stop, query)
- **Windows Tasks**: Task Scheduler integration
- **Windows Performance**: CPU, memory, disk monitoring
- **Windows Event Logs**: Event log querying
- **Windows Office**: Word, Excel, PowerPoint automation

Example Windows registry operation:
```bash
openclaw agent --message "Read HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion"
```

---

## 📚 Core Concepts

### Sessions & Agents

- **Multi-Agent**: Create isolated workspaces for different tasks
- **Session Continuity**: Each conversation track independently
- **Context Management**: Intelligent context window management

```bash
# List sessions
openclaw sessions list

# Reset a session
openclaw sessions reset --key <session_key>
```

### Tools

Built-in tools for automation:

| Tool | Description |
|------|-------------|
| `browser` | Control Chrome browser (tabs, navigation, actions) |
| `canvas` | Visual workspace with A2UI |
| `exec` | Execute shell commands |
| `sessions` | Session state management |
| `cron` | Schedule tasks |
| `web_search` | Brave search integration |
| `web_fetch` | Extract content from URLs |

Example: Browse a website
```bash
openclaw agent --message "Open https://example.com and find the contact page"
```

### Skills (Extensions)

- **Workspace Skills**: Add custom skills in `C:\Users\User\.openclaw\workspace\skills\`
- **Built-in Skills**: Pre-installed skills for common tasks

```bash
# List available skills
openclaw skills list

# Install a skill
openclaw skills install <skill_name>
```

---

## 🔍 Troubleshooting

### Check Status

```bash
# Run diagnostics
openclaw doctor

# Check gateway status
openclaw gateway status

# View logs
openclaw gateway logs
```

### Common Issues

**Gateway won't start**:
- Check if port 18789 is in use: `netstat -ano | findstr 18789`
- Verify Node.js version: `node --version` (should be ≥22)

**Channel not responding**:
- Verify API tokens in config
- Check channel permissions (bot permissions in Slack, etc.)
- Run `openclaw doctor` for diagnostics

**Model authentication**:
- Verify API keys or OAuth tokens
- Run `openclaw models list` to check available profiles

---

## 🔄 Updates

**From source (development)**:

```bash
git clone https://github.com/edmen12/openclaw-windows.git
cd openclaw-windows

pnpm install
pnpm ui:build  # Build UI assets
pnpm build     # Build from source

pnpm openclaw # Run locally from source

# Dev loop with auto-reload
pnpm gateway:watch
```

**Updating from npm**:

```bash
npm update -g openclaw@latest
# or: pnpm update -g openclaw@latest
```

---

## ⚙️ Advanced Configuration

### Environment Variables

Set environment variables in your shell (`.env` or PowerShell profile):

```bash
# Gateway configuration
OPENCLAW_PORT=18789
OPENCLAW_HOST=127.0.0.1

# Paths
OPENCLAW_DATA_DIR=C:\Users\User\.openclaw
OPENCLAW_WORKSPACE=C:\Users\User\.openclaw\workspace
```

### Agent Configuration

```json5
{
  "agents": {
    "default": {
      "model": {
        "profile": "anthropic-default"
      },
      "tools": {
        "elevated": {
          "enabled": false
        }
      }
    }
  }
}
```

---

## 🤝 Contributing

This is a Windows-only fork focused on Windows-native functionality. For cross-platform changes, submit PRs to the [upstream repo](https://github.com/openclaw/openclaw).

**Windows-specific issues**: Use this repo's issues
**Cross-platform issues**: Report upstream

---

## 📜 License

MIT License — see [LICENSE](LICENSE) file

---

## 🔗 Links

- **Upstream Repo**: https://github.com/openclaw/openclaw
- **Documentation**: https://docs.openclaw.ai
- **Community**: https://discord.gg/clawd
- **Windows-Only Fork**: https://github.com/edmen12/openclaw-windows
