# Skills 分类索引

## 文件列表

1. **skills-categories.json** - JSON 格式的分类数据（供程序使用）
2. **skills-categories.ts** - TypeScript 类型定义和工具函数
3. **CATEGORIES_README.md** - 详细的分类说明文档

## 快速查询

### 按分类查询

```bash
# 查看内置技能
node -e "const c = require('./skills-categories.json'); console.log(c['built-in'].skills.join(', '));"

# 查看 Windows 技能
node -e "const c = require('./skills-categories.json'); console.log(c.windows.skills.join(', '));"

# 查看所有分类
node -e "const c = require('./skills-categories.json'); Object.keys(c).forEach(k => console.log(k, ':', c[k].label));"
```

### 查找特定技能所属分类

```bash
# 查询 windows-service 属于哪个分类
node -e "const c = require('./skills-categories.json'); for(const k in c) { if(c[k].skills.includes('windows-service')) console.log(k, ':', c[k].label); }"
```

## 集成到 UI

### TypeScript 示例

```typescript
import {
  SKILL_CATEGORIES,
  getSkillCategory,
  getDefaultExpandedCategories,
} from "./skills-categories";

// 获取所有分类
const categories = Object.entries(SKILL_CATEGORIES).map(([key, category]) => ({
  key,
  ...category,
}));

// 获取默认展开的分类
const defaultExpanded = getDefaultExpandedCategories();
// 结果: ['builtin', 'windows', 'development']

// 搜索技能分类
const category = getSkillCategory("windows-service");
// 结果: 'windows'
```

### React 示例

```tsx
import { SKILL_CATEGORIES, SORTED_CATEGORIES } from "./skills-categories";

function SkillsPanel() {
  return (
    <div className="skills-panel">
      {SORTED_CATEGORIES.map((category) => (
        <SkillCategoryCard
          key={category.key}
          label={category.label}
          emoji={category.emoji}
          description={category.description}
          skills={category.skills}
          defaultExpanded={category.defaultExpanded}
        />
      ))}
    </div>
  );
}
```

## 统计

- **总技能数**: 65
- **分类数**: 9
- **默认展开分类**: 3 (内置、Windows、开发)

### 各分类详情

| 分类         | skills | 优先级 | 默认展开 |
| ------------ | ------ | ------ | -------- |
| 内置技能     | 16     | 1      | ✅       |
| Windows 管理 | 9      | 2      | ✅       |
| 通讯社交     | 3      | 3      | -        |
| 搜索 AI      | 4      | 4      | -        |
| 媒体音频     | 8      | 5      | -        |
| 购物订单     | 1      | 6      | -        |
| 交易金融     | 3      | 7      | -        |
| 智能家居     | 11     | 8      | -        |
| 开发工具     | 10     | 9      | ✅       |

## 验证

```bash
# 验证 JSON 有效性和完整性
node -e "
  const fs = require('fs');
  const c = JSON.parse(fs.readFileSync('./skills-categories.json', 'utf8'));
  const dirs = fs.readdirSync('.', { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  const skills = Object.values(c).flatMap(cat => cat.skills);
  const uncategorized = dirs.filter(d => !skills.includes(d));
  console.log('✓ JSON 有效');
  console.log('✓ 所有 skills 已分类:', uncategorized.length === 0);
  console.log('✓ 总数匹配:', dirs.length === skills.length);
"
```

## 维护

### 添加新技能

1. 在 `skills-categories.json` 中对应分类的 `skills` 数组中添加
2. 如果是新分类，在 `skills-categories.json` 中添加新对象
3. 更新 `CATEGORIES_README.md` 和本文件

### 合并分类

不建议：每个技能只属于一个分类，避免重复显示。

### 分类原则

- **内置技能**: 只需配置，无外部依赖
- **Windows 管理**: Windows 专用系统管理
- **通讯社交**: 社交平台集成
- **搜索 AI**: 需要 API Key 的 AI 服务
- **媒体音频**: 媒体处理工具
- **购物订单**: 特定购物平台
- **交易金融**: 金融和交易工具
- **智能家居**: 硬件设备控制
- **开发工具**: 开发辅助工具
