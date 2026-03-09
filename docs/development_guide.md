# StorageNews 开发规范

## 代码风格规范

### TypeScript/JavaScript

#### 命名规范
```typescript
// 文件名：小写 + 下划线或 camelCase
// services/news_api.ts 或 services/newsApi.ts

// 类名：PascalCase
class NewsAggregator {}

// 函数/变量：camelCase
function fetchNews() {}
const newsItems = [];

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://...';

// 接口/类型：PascalCase
interface NewsItem {
  id: number;
  title: string;
}

// 枚举：PascalCase
enum NewsCategory {
  Product = 'Product',
  Financial = 'Financial'
}
```

#### 代码组织
```typescript
// 1. 导入语句（按类型分组）
import { Router } from 'express';           // 外部库
import { getNews } from '../models/News';   // 内部模块
import type { NewsItem } from '../types';   // 类型导入

// 2. 类型定义
interface ServiceConfig {
  apiKey: string;
  timeout: number;
}

// 3. 常量定义
const DEFAULT_TIMEOUT = 5000;

// 4. 主要逻辑
export async function fetchNews() {
  // ...
}

// 5. 辅助函数
function validateInput(data: any): boolean {
  // ...
}
```

#### 注释规范
```typescript
/**
 * 从 NewsAPI 获取新闻
 * @param query - 搜索关键词
 * @param limit - 返回数量限制
 * @returns Promise<NewsItem[]>
 * @throws {Error} 当 API 密钥无效时
 */
export async function fetchFromNewsAPI(
  query: string, 
  limit: number = 20
): Promise<NewsItem[]> {
  // TODO: 添加重试机制
  // FIXME: 处理超时情况
  
  // 业务逻辑注释
  // 1. 验证 API 密钥
  // 2. 构建请求参数
  // 3. 发送请求并处理响应
}
```

#### 错误处理
```typescript
// ✅ 推荐：明确的错误处理
try {
  const result = await fetchNews();
  return result;
} catch (error) {
  console.error('Failed to fetch news:', error);
  // 记录详细错误信息
  if (error instanceof ApiError) {
    // 特定错误处理
  }
  throw error; // 或返回默认值
}

// ❌ 避免：吞掉错误
try {
  await fetchNews();
} catch (error) {
  // 什么都不做
}
```

#### 异步处理
```typescript
// ✅ 推荐：使用 async/await
async function processNews() {
  const news = await fetchNews();
  const scored = await scoreNews(news);
  return scored;
}

// ✅ 推荐：并行处理
const [news1, news2] = await Promise.all([
  fetchFromNewsAPI(),
  fetchFromRSS()
]);

// ❌ 避免：回调地狱
fetchNews((news) => {
  scoreNews(news, (scored) => {
    saveNews(scored, () => {
      // ...
    });
  });
});
```

---

## Git 工作流规范

### 分支策略

```
main (生产环境)
  ↑
develop (开发主分支)
  ↑
feature/xxx (功能分支)
hotfix/xxx (紧急修复)
```

### 分支命名
```bash
# 功能开发
feature/search-functionality
feature/ai-chat-integration

# Bug 修复
fix/image-loading-error
fix/api-timeout-issue

# 紧急修复
hotfix/security-patch
hotfix/database-connection

# 重构
refactor/scoring-engine
refactor/api-routes
```

### Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)

```bash
# 格式
<type>(<scope>): <subject>

<body>

<footer>

# 类型 (type)
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构（既不是新功能也不是修复）
perf:     性能优化
test:     测试相关
chore:    构建/工具链相关

# 示例
feat(api): add search endpoint for news

- Implement full-text search using PostgreSQL tsvector
- Add query parameter validation
- Update API documentation

Closes #123

fix(mobile): resolve image loading timeout

The image component was not handling network errors properly.
Added retry logic and fallback placeholder.

Fixes #456
```

### Commit 最佳实践
```bash
# ✅ 好的 commit
git commit -m "feat(scoring): add keyword bonus for AI-related news"
git commit -m "fix(api): handle null image_url in response"
git commit -m "docs(readme): update installation instructions"

# ❌ 不好的 commit
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

---

## 测试规范

### 测试策略

```typescript
// 单元测试：测试单个函数/模块
describe('calculateScore', () => {
  it('should return correct score for high-value news', () => {
    const news = {
      title: 'Dell launches new storage',
      vendor: 'Dell EMC',
      category: 'Product'
    };
    const score = calculateScore(news);
    expect(score).toBeGreaterThan(40);
  });
});

// 集成测试：测试多个模块协作
describe('News API', () => {
  it('should fetch and score news correctly', async () => {
    const news = await fetchNews();
    expect(news[0]).toHaveProperty('score');
  });
});
```

### 测试覆盖率目标
- **核心业务逻辑**: > 80%
- **API 路由**: > 70%
- **工具函数**: > 90%

---

## 代码审查清单

### 功能性
- [ ] 代码实现了需求中的所有功能
- [ ] 边界条件已处理
- [ ] 错误处理完善

### 代码质量
- [ ] 遵循命名规范
- [ ] 无重复代码（DRY 原则）
- [ ] 函数职责单一（SRP 原则）
- [ ] 注释清晰且必要

### 性能
- [ ] 无不必要的数据库查询
- [ ] 避免 N+1 查询问题
- [ ] 大数据集使用分页

### 安全
- [ ] 输入验证
- [ ] SQL 注入防护
- [ ] 敏感信息不暴露

### 测试
- [ ] 添加了必要的测试
- [ ] 所有测试通过
- [ ] 手动测试验证

---

## 文件组织规范

### 后端目录结构
```
server/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.ts
│   │   └── rules.json
│   ├── models/          # 数据模型
│   │   └── News.ts
│   ├── routes/          # API 路由
│   │   └── news.ts
│   ├── services/        # 业务逻辑
│   │   ├── ai.ts
│   │   ├── scoring.ts
│   │   ├── newsapi.ts
│   │   └── rss.ts
│   ├── jobs/            # 定时任务
│   │   └── scheduler.ts
│   ├── types/           # TypeScript 类型定义
│   │   └── news.ts
│   ├── utils/           # 工具函数
│   │   └── helpers.ts
│   └── index.ts         # 入口文件
├── dist/                # 编译输出
├── .env                 # 环境变量
├── .env.example         # 环境变量模板
├── package.json
└── tsconfig.json
```

### 移动端目录结构
```
mobile/
├── app/
│   ├── (tabs)/          # 标签页路由
│   │   ├── index.tsx    # 新闻列表
│   │   └── settings.tsx # 设置页
│   └── _layout.tsx
├── services/            # API 服务
│   └── api.ts
├── components/          # 可复用组件
│   ├── NewsCard.tsx
│   └── FilterBar.tsx
├── assets/              # 静态资源
├── .env
└── package.json
```

---

## 性能优化指南

### 数据库优化
```typescript
// ✅ 使用索引
CREATE INDEX idx_news_score ON news(score DESC);

// ✅ 避免 SELECT *
const news = await pool.query(
  'SELECT id, title, score FROM news LIMIT 10'
);

// ✅ 使用连接池
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});

// ❌ 避免 N+1 查询
for (const item of news) {
  const vendor = await getVendor(item.vendor_id); // 每次都查询
}
```

### API 优化
```typescript
// ✅ 实现缓存
const cache = new Map();
function getCachedNews(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetchNews();
  cache.set(key, data);
  return data;
}

// ✅ 请求去重
let pendingRequest: Promise<any> | null = null;
async function fetchNews() {
  if (pendingRequest) {
    return pendingRequest;
  }
  pendingRequest = actualFetch();
  const result = await pendingRequest;
  pendingRequest = null;
  return result;
}
```

---

## 安全最佳实践

### 环境变量管理
```bash
# ✅ .env (不提交到 Git)
DB_PASSWORD=super_secret_password
AI_API_KEY=sk-xxxxx

# ✅ .env.example (提交到 Git)
DB_PASSWORD=your_password_here
AI_API_KEY=your_api_key_here
```

### 输入验证
```typescript
// ✅ 验证用户输入
function validateNewsQuery(query: any) {
  if (typeof query.limit !== 'number' || query.limit > 100) {
    throw new Error('Invalid limit');
  }
  if (query.vendor && !VALID_VENDORS.includes(query.vendor)) {
    throw new Error('Invalid vendor');
  }
}
```

### SQL 注入防护
```typescript
// ✅ 使用参数化查询
await pool.query(
  'SELECT * FROM news WHERE vendor = $1',
  [vendor]
);

// ❌ 避免字符串拼接
await pool.query(
  `SELECT * FROM news WHERE vendor = '${vendor}'`
);
```

---

## 发布流程

### 版本号规范
遵循 [Semantic Versioning](https://semver.org/)

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (Bug 修复)
1.0.1 → 1.1.0  (新功能，向后兼容)
1.1.0 → 2.0.0  (破坏性变更)
```

### 发布检查清单
- [ ] 所有测试通过
- [ ] 代码已审查
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新
- [ ] 环境变量已配置
- [ ] 数据库迁移已执行
- [ ] 备份已完成

---

## 文档规范

### README.md 必备内容
1. 项目简介
2. 功能特性
3. 技术栈
4. 安装步骤
5. 使用说明
6. API 文档链接
7. 贡献指南
8. 许可证

### API 文档
使用 Swagger/OpenAPI 规范

### 代码文档
- 每个模块有清晰的注释
- 复杂逻辑有详细说明
- 公共 API 有 JSDoc 注释
