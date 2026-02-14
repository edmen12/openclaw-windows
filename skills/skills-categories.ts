/**
 * OpenClaw Skills 分类定义
 *
 * 所有 skills 的分类数据，用于 UI 显示和筛选
 */

export type SkillCategoryKey =
  | "builtin"
  | "windows"
  | "communication"
  | "searchAi"
  | "media"
  | "shopping"
  | "finance"
  | "smartHome"
  | "development";

export interface SkillCategory {
  /**
   * 分类标识符（唯一键）
   */
  key: SkillCategoryKey;

  /**
   * 分类显示名称
   */
  label: string;

  /**
   * 分类 emoji 图标
   */
  emoji: string;

  /**
   * 分类描述
   */
  description: string;

  /**
   * 该分类下的所有技能列表
   */
  skills: string[];

  /**
   * 优先级（数字越小越靠前显示）
   */
  priority: number;

  /**
   * 是否默认展开（UI 中是否默认显示该分类）
   */
  defaultExpanded?: boolean;
}

export interface SkillCategories {
  builtin: SkillCategory;
  windows: SkillCategory;
  communication: SkillCategory;
  searchAi: SkillCategory;
  media: SkillCategory;
  shopping: SkillCategory;
  finance: SkillCategory;
  smartHome: SkillCategory;
  development: SkillCategory;
}

export const SKILL_CATEGORIES: SkillCategories = {
  builtin: {
    key: "builtin",
    label: "内置技能",
    emoji: "📦",
    description: "只需配置即可使用的技能，无需额外安装",
    skills: [
      "canvas",
      "coding-agent",
      "discord",
      "daily-briefing",
      "email-fetch",
      "github",
      "healthcheck",
      "model-usage",
      "notion",
      "openclaw-repo-monitor",
      "opencode-coder",
      "session-logs",
      "skill-creator",
      "slack",
      "summarize",
      "voice-call",
    ],
    priority: 1,
    defaultExpanded: true,
  },

  windows: {
    key: "windows",
    label: "Windows 系统管理",
    emoji: "🖥️",
    description: "Windows 系统监控和管理",
    skills: [
      "windows-clipboard",
      "windows-eventlog",
      "windows-firewall",
      "windows-office",
      "windows-performance",
      "windows-registry",
      "windows-service",
      "windows-task",
      "windows-users",
    ],
    priority: 2,
    defaultExpanded: true,
  },

  communication: {
    key: "communication",
    label: "通讯和社交",
    emoji: "📱",
    description: "社交平台和通讯工具",
    skills: ["bluebubbles", "bird", "wacli"],
    priority: 3,
  },

  searchAi: {
    key: "searchAi",
    label: "搜索和 AI",
    emoji: "🔍",
    description: "需要 API Key 的 AI 和搜索服务",
    skills: ["gemini", "serpapi-search", "serper-search", "tavily-search"],
    priority: 4,
  },

  media: {
    key: "media",
    label: "媒体和音频",
    emoji: "🎵",
    description: "音频、视频、图像处理工具",
    skills: [
      "gifgrep",
      "openai-image-gen",
      "openai-whisper",
      "qwen3-tts-local",
      "songsee",
      "spotify-player",
      "video-frames",
      "whisper-large-v3-turbo",
    ],
    priority: 5,
  },

  shopping: {
    key: "shopping",
    label: "购物和订单",
    emoji: "🛒",
    description: "购物服务平台",
    skills: ["food-order"],
    priority: 6,
  },

  finance: {
    key: "finance",
    label: "交易和金融",
    emoji: "💰",
    description: "加密货币、股票交易",
    skills: ["crypto-wallet-1.0.0", "mt5-control", "silicon-trader"],
    priority: 7,
  },

  smartHome: {
    key: "smartHome",
    label: "智能家居和设备",
    emoji: "🏠",
    description: "硬件设备控制",
    skills: [
      "blucli",
      "eightctl",
      "openhue",
      "sonoscli",
      "gog",
      "mcporter",
      "nano-banana-pro",
      "nano-pdf",
      "peekaboo",
      "oracle",
      "ordercli",
    ],
    priority: 8,
  },

  development: {
    key: "development",
    label: "开发工具",
    emoji: "🔧",
    description: "开发辅助和工具",
    skills: [
      "1password",
      "clawhub",
      "blogwatcher",
      "humanizer-1.0.0",
      "local-places",
      "goplaces",
      "minicpm-vision",
      "obsidian",
      "trello",
      "weather",
    ],
    priority: 9,
    defaultExpanded: true,
  },
};

/**
 * 按优先级排序的分类列表
 */
export const SORTED_CATEGORIES = Object.values(SKILL_CATEGORIES).sort((a, b) => {
  return a.priority - b.priority;
});

/**
 * 获取技能所属的分类
 * @param skillName 技能名称
 * @returns 分类 key，如果找不到返回 null
 */
export function getSkillCategory(skillName: string): SkillCategoryKey | null {
  for (const [key, category] of Object.entries(SKILL_CATEGORIES)) {
    if (category.skills.includes(skillName)) {
      return key as SkillCategoryKey;
    }
  }
  return null;
}

/**
 * 获取技能的完整信息（包括分类）
 * @param skillName 技能名称
 * @returns 分类信息，如果找不到返回 null
 */
export function getSkillCategoryInfo(
  skillName: string,
): { category: SkillCategory; key: SkillCategoryKey } | null {
  for (const [key, category] of Object.entries(SKILL_CATEGORIES)) {
    if (category.skills.includes(skillName)) {
      return {
        category,
        key: key as SkillCategoryKey,
      };
    }
  }
  return null;
}

/**
 * 获取所有默认展开的分类
 * @returns 默认展开的分类 key 列表
 */
export function getDefaultExpandedCategories(): SkillCategoryKey[] {
  return Object.entries(SKILL_CATEGORIES)
    .filter(([, category]) => category.defaultExpanded === true)
    .map(([key]) => key as SkillCategoryKey);
}
