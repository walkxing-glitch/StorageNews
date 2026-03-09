# StorageNews 📰

> 智能存储行业情报聚合平台 - 让你不错过任何重要的存储技术动态

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## ✨ 功能特性

- 🔄 **多源聚合**：自动从 NewsAPI、RSS 等多个来源抓取存储行业新闻
- 🎯 **智能评分**：基于来源、厂商、类别、关键词的自动打分系统
- 🤖 **AI 摘要**：高价值新闻自动生成中文三句话摘要（DeepSeek/OpenAI）
- 📱 **移动优先**：精美的 React Native 移动应用
- 🎨 **视觉体验**：Featured 卡片 + 缩略图 + 渐变占位符
- 🔍 **智能筛选**：厂商/类别双层过滤系统
- 📊 **数据洞察**：Dashboard 可视化分析（开发中）
- 🔔 **智能推送**：每日 Top 10 新闻推送到 WeLink/微信（开发中）

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Docker (可选，推荐)

### 使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd StorageNews/server

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 API 密钥

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec server npm run init

# 5. 访问 API
curl http://localhost:3001/api/news
```

### 手动安装

#### 后端

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动 PostgreSQL
# macOS: brew services start postgresql@14
# Linux: sudo systemctl start postgresql

# 创建数据库
createdb storage_news

# 编译并启动
npm run build
node dist/index.js --init  # 初始化数据库
npm run dev                # 开发模式
```

#### 移动端

```bash
cd mobile

# 安装依赖
npm install

# 配置 API 地址
cp .env.example .env
# 编辑 EXPO_PUBLIC_API_URL

# 启动开发服务器
npx expo start

# 在手机上安装 Expo Go，扫描二维码测试
```

## 📖 文档

- [系统架构](docs/architecture.md) - 技术栈、架构图、数据库设计
- [开发规范](docs/development_guide.md) - 代码风格、Git 工作流、测试规范
- [部署文档](docs/deployment.md) - 本地部署、生产部署、运维指南
- [产品路线图](docs/roadmap.md) - 未来规划（Phase 4-9）
- [任务清单](docs/task.md) - 当前进度和待办事项

## 🏗️ 技术栈

**后端**
- Node.js + TypeScript + Express.js
- PostgreSQL + pg
- node-cron (定时任务)
- DeepSeek API (AI 摘要)

**移动端**
- React Native (Expo)
- Expo Router
- Axios

**基础设施**
- Docker + Docker Compose
- Nginx (生产环境)

## 📂 项目结构

```
StorageNews/
├── server/              # 后端服务
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   └── jobs/        # 定时任务
│   ├── .env.example
│   └── docker-compose.yml
├── mobile/              # 移动应用
│   ├── app/             # 页面路由
│   ├── services/        # API 服务
│   └── .env.example
├── dashboard/           # Web Dashboard
└── docs/                # 项目文档
```

## 🔧 配置说明

### 环境变量

#### 后端 (.env)

```bash
# 数据库
DB_HOST=localhost
DB_PORT=5433
DB_NAME=storage_news
DB_USER=postgres
DB_PASSWORD=postgres

# API 密钥
NEWSAPI_KEY=your_newsapi_key_here
AI_API_KEY=your_deepseek_or_openai_key
AI_API_URL=https://api.deepseek.com/v1/chat/completions

# 服务端口
PORT=3001
```

#### 移动端 (.env)

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api
# 或使用 ngrok: https://xxxx.ngrok-free.app/api
```

## 🧪 测试

```bash
cd server

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 📦 部署

### 生产环境部署

详见 [部署文档](docs/deployment.md)

```bash
# Docker Compose 部署
cd server
docker-compose -f docker-compose.prod.yml up -d

# Kubernetes 部署
kubectl apply -f k8s/
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请遵循 [开发规范](docs/development_guide.md) 中的代码风格和 Git 提交规范。

## 📝 开发计划

- [x] Phase 1: 新闻评分系统
- [x] Phase 2: UX 增强 + AI 摘要
- [x] Phase 3: 视觉优化
- [ ] Phase 4: 每日推送到 WeLink/微信
- [ ] Phase 5: 全文搜索
- [ ] Phase 6: AI 深度分析
- [ ] Phase 7: 数据洞察与报告

详见 [产品路线图](docs/roadmap.md)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

- 开发者：[@walkxing-glitch](https://github.com/walkxing-glitch)

## 🙏 致谢

- [NewsAPI](https://newsapi.org/) - 新闻数据源
- [DeepSeek](https://www.deepseek.com/) - AI 摘要服务
- [Expo](https://expo.dev/) - 移动开发框架

---

**如有问题或建议，欢迎提 Issue！**
