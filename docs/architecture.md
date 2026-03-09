# StorageNews 系统架构文档

## 系统概览

StorageNews 是一个基于微服务架构的存储行业情报聚合平台，采用前后端分离设计。

### 技术栈

**后端 (Backend)**
- **运行时**: Node.js 18+
- **语言**: TypeScript 5.x
- **框架**: Express.js
- **数据库**: PostgreSQL 14+
- **ORM**: 原生 pg 驱动
- **定时任务**: node-cron
- **AI 服务**: DeepSeek API / OpenAI API

**移动端 (Mobile)**
- **框架**: React Native (Expo)
- **路由**: Expo Router
- **状态管理**: React Hooks
- **HTTP 客户端**: Axios
- **UI 组件**: React Native 原生组件 + expo-linear-gradient

**Dashboard (Web)**
- **框架**: 原生 HTML/CSS/JavaScript
- **图表**: Chart.js (待集成)

**基础设施**
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx (生产环境)
- **隧道**: ngrok (开发环境)

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────┬──────────────────┬──────────────────────────┤
│  Mobile App  │   Web Dashboard  │  Chat Platforms          │
│  (Expo RN)   │   (HTML/JS)      │  (WeLink/WeChat)         │
└──────┬───────┴────────┬─────────┴──────────┬───────────────┘
       │                │                    │
       │ REST API       │ REST API           │ Webhook
       │                │                    │
┌──────▼────────────────▼────────────────────▼───────────────┐
│                    API Gateway (Express)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: /api/news, /api/stats, /api/chat           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────┬──────────────────────────────────────┬──────────────┘
       │                                      │
┌──────▼──────────────────┐          ┌───────▼──────────────┐
│   Business Logic Layer  │          │   External Services  │
├─────────────────────────┤          ├──────────────────────┤
│ • News Aggregation      │          │ • NewsAPI            │
│ • Scoring Engine        │          │ • RSS Feeds          │
│ • AI Summarization      │◄─────────┤ • DeepSeek API       │
│ • Messenger Service     │          │ • WeLink Webhook     │
│ • Scheduler (Cron)      │          │ • WeChat Bot         │
└──────┬──────────────────┘          └──────────────────────┘
       │
┌──────▼──────────────────┐
│   Data Access Layer     │
├─────────────────────────┤
│ • News Model            │
│ • Query Builders        │
│ • Transaction Manager   │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│   PostgreSQL Database   │
├─────────────────────────┤
│ Tables:                 │
│ • news                  │
│ • (future: users, etc)  │
└─────────────────────────┘
```

---

## 数据库设计

### news 表结构

```sql
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  source_name VARCHAR(100),
  vendor VARCHAR(50),
  category VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  hash VARCHAR(64) UNIQUE NOT NULL,
  score DECIMAL(10,2) DEFAULT 0,
  score_breakdown JSONB,
  summary_cn TEXT
);

-- 索引优化
CREATE INDEX idx_news_score ON news(score DESC);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_vendor ON news(vendor);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_hash ON news(hash);
```

---

## API 接口规范

### 通用响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": <payload>
}

// 错误响应
{
  "success": false,
  "error": "Error message"
}
```

### 核心接口

#### GET /api/news
获取新闻列表

**Query Parameters:**
- `limit` (number): 返回数量，默认 50
- `offset` (number): 偏移量，默认 0
- `vendor` (string): 厂商筛选
- `category` (string): 类别筛选

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "...",
      "url": "...",
      "image_url": "...",
      "score": 54.78,
      "score_breakdown": {...},
      "summary_cn": "...",
      "vendor": "Dell EMC",
      "category": "Product",
      "published_at": "2026-02-06T10:00:00Z"
    }
  ]
}
```

#### GET /api/news/stats
获取统计数据

#### GET /api/news/top
获取 Top N 新闻

---

## 核心服务模块

### 1. 新闻聚合服务
- **文件**: `services/newsapi.ts`, `services/rss.ts`, `services/internal.ts`
- **职责**: 从多个数据源抓取新闻
- **调度**: 每小时执行一次

### 2. 评分引擎
- **文件**: `services/scoring.ts`
- **职责**: 计算新闻价值评分
- **算法**: 
  ```
  score = baseScore × sourceWeight × vendorWeight × categoryWeight 
          + keywordBonus + freshnessScore
  ```

### 3. AI 摘要服务
- **文件**: `services/ai.ts`
- **职责**: 为高价值新闻生成中文摘要
- **触发条件**: score > 40
- **API**: DeepSeek / OpenAI

### 4. 消息推送服务
- **文件**: `services/messenger.ts` (待实现)
- **职责**: 推送到 WeLink / WeChat
- **调度**: 每日 09:00

---

## 配置管理

### 环境变量 (.env)

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5433
DB_NAME=storage_news
DB_USER=postgres
DB_PASSWORD=postgres

# API Keys
NEWSAPI_KEY=your_newsapi_key
AI_API_KEY=your_deepseek_key
AI_API_URL=https://api.deepseek.com/v1/chat/completions

# 服务端口
PORT=3001

# 推送配置 (待实现)
WELINK_WEBHOOK_URL=
WECHAT_BOT_ENABLED=false
DAILY_PUSH_TIME=09:00
```

### 规则配置 (config/rules.json)

```json
{
  "vendorKeywords": {
    "Dell EMC": ["dell", "emc", "powerstore"],
    "NetApp": ["netapp", "ontap"],
    ...
  },
  "categoryKeywords": {
    "Product": ["launch", "release", "unveil"],
    ...
  },
  "rssSources": [...],
  "newsApiQueries": [...]
}
```

---

## 部署架构

### 开发环境
```
Docker Compose:
  - PostgreSQL (port 5433)
  - Backend Server (port 3001)
  - ngrok tunnel (for mobile testing)

Mobile:
  - Expo Go (development)
  - Connect via ngrok URL
```

### 生产环境 (建议)
```
Docker Swarm / Kubernetes:
  - PostgreSQL (persistent volume)
  - Backend (3 replicas)
  - Nginx (reverse proxy + SSL)
  - Redis (cache layer)
```

---

## 安全考虑

1. **API 密钥管理**: 使用环境变量，不提交到 Git
2. **数据库访问**: 仅内网访问，使用强密码
3. **HTTPS**: 生产环境强制 HTTPS
4. **输入验证**: 所有 API 输入进行校验
5. **SQL 注入防护**: 使用参数化查询

---

## 性能优化

1. **数据库索引**: 已为高频查询字段添加索引
2. **API 缓存**: 建议使用 Redis 缓存热门查询
3. **图片 CDN**: 考虑使用 Cloudflare 加速
4. **分页**: 所有列表接口支持分页
5. **连接池**: PostgreSQL 连接池配置

---

## 监控与日志

### 日志策略
- **级别**: ERROR, WARN, INFO, DEBUG
- **格式**: 结构化 JSON 日志
- **存储**: 建议使用 ELK Stack

### 关键指标
- API 响应时间 (P95 < 500ms)
- 数据库查询时间
- 新闻抓取成功率
- AI 摘要生成成功率
- 推送到达率

---

## 扩展性设计

### 水平扩展
- 后端服务无状态，可多实例部署
- 数据库读写分离（主从复制）

### 垂直扩展
- 增加数据库连接池大小
- 优化查询性能

### 微服务化路径
1. 分离 AI 服务为独立服务
2. 分离消息推送服务
3. 引入 API Gateway (Kong/Nginx)
