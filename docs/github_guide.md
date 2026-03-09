# GitHub 项目提交完全指南

## 📋 前置准备

### 1. 安装 Git
```bash
# 检查是否已安装
git --version

# macOS 安装（如果未安装）
brew install git

# 配置 Git 用户信息
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

### 2. 创建 GitHub 账号
1. 访问 https://github.com
2. 点击 "Sign up" 注册账号
3. 验证邮箱

---

## 🚀 提交项目到 GitHub

### 步骤 1: 初始化 Git 仓库

```bash
# 进入项目目录
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 初始化 Git 仓库
git init

# 查看状态
git status
```

### 步骤 2: 创建 .gitignore 文件

```bash
# 创建 .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Expo
.expo/
.expo-shared/

# Docker
*.log
EOF
```

### 步骤 3: 添加文件到 Git

```bash
# 添加所有文件
git add .

# 查看将要提交的文件
git status

# 提交到本地仓库
git commit -m "feat: initial commit - StorageNews v1.0.0

- Implemented news aggregation from NewsAPI and RSS
- Added intelligent scoring system
- Integrated AI summarization (DeepSeek)
- Created mobile app with Expo
- Added daily push to WeLink and WeChat
- Complete documentation and development guides"
```

### 步骤 4: 在 GitHub 创建远程仓库

1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `StorageNews`
   - **Description**: `智能存储行业情报聚合平台`
   - **Visibility**: 
     - Public（公开，任何人可见）
     - Private（私有，只有你可见）
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 步骤 5: 连接远程仓库并推送

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/StorageNews.git

# 查看远程仓库
git remote -v

# 推送到 GitHub（首次推送）
git branch -M main
git push -u origin main
```

**如果遇到认证问题**：
```bash
# 使用 Personal Access Token (PAT)
# 1. 访问 https://github.com/settings/tokens
# 2. 点击 "Generate new token (classic)"
# 3. 勾选 "repo" 权限
# 4. 生成 token 并复制

# 5. 推送时使用 token 作为密码
git push -u origin main
# Username: YOUR_USERNAME
# Password: YOUR_TOKEN
```

---

## 🔄 日常更新流程

### 提交新更改

```bash
# 1. 查看修改的文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交更改（遵循 Conventional Commits 规范）
git commit -m "feat: add search functionality"
# 或
git commit -m "fix: resolve image loading issue"
# 或
git commit -m "docs: update README"

# 4. 推送到 GitHub
git push
```

### Commit 消息规范

```bash
# 新功能
git commit -m "feat: add full-text search"

# Bug 修复
git commit -m "fix: resolve API timeout issue"

# 文档更新
git commit -m "docs: update deployment guide"

# 代码重构
git commit -m "refactor: improve scoring algorithm"

# 性能优化
git commit -m "perf: optimize database queries"

# 测试相关
git commit -m "test: add unit tests for messenger service"

# 构建/工具链
git commit -m "chore: update dependencies"
```

---

## 🌿 分支管理

### 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/search-functionality

# 开发功能...

# 提交更改
git add .
git commit -m "feat: implement search API"

# 推送分支到 GitHub
git push -u origin feature/search-functionality

# 在 GitHub 上创建 Pull Request
# 访问仓库页面，点击 "Compare & pull request"
```

### 合并分支

```bash
# 切换回主分支
git checkout main

# 拉取最新代码
git pull

# 合并功能分支
git merge feature/search-functionality

# 推送到 GitHub
git push

# 删除本地分支
git branch -d feature/search-functionality

# 删除远程分支
git push origin --delete feature/search-functionality
```

---

## 📝 创建 Release

### 步骤 1: 更新版本号

```bash
# 更新 CHANGELOG.md
nano CHANGELOG.md

# 添加新版本信息
## [1.1.0] - 2026-02-06
### Added
- Full-text search functionality
- Daily push to WeLink and WeChat
...
```

### 步骤 2: 提交版本更新

```bash
git add CHANGELOG.md
git commit -m "chore: release v1.1.0"
git push
```

### 步骤 3: 创建 Git Tag

```bash
# 创建 tag
git tag -a v1.1.0 -m "Release v1.1.0 - Search and Daily Push"

# 推送 tag 到 GitHub
git push origin v1.1.0
```

### 步骤 4: 在 GitHub 创建 Release

1. 访问仓库页面
2. 点击 "Releases" → "Create a new release"
3. 选择刚才创建的 tag: `v1.1.0`
4. 填写 Release 标题: `v1.1.0 - Search and Daily Push`
5. 填写 Release 说明（从 CHANGELOG 复制）
6. 点击 "Publish release"

---

## 🔒 保护敏感信息

### 确保 .env 不被提交

```bash
# 检查 .gitignore 是否包含 .env
cat .gitignore | grep .env

# 如果已经误提交了 .env
git rm --cached server/.env
git commit -m "chore: remove .env from git"
git push
```

### 创建 .env.example

```bash
# 复制 .env 为模板
cp server/.env server/.env.example

# 编辑 .env.example，移除敏感信息
nano server/.env.example

# 替换真实值为占位符
NEWSAPI_KEY=your_newsapi_key_here
AI_API_KEY=your_ai_api_key_here
WELINK_WEBHOOK_URL=your_welink_webhook_url_here
WECHAT_WEBHOOK_URL=your_wechat_webhook_url_here

# 提交 .env.example
git add server/.env.example
git commit -m "docs: add .env.example template"
git push
```

---

## 📊 GitHub Actions CI/CD

你的项目已经配置了 GitHub Actions，每次推送都会自动：
1. 运行 ESLint 检查代码质量
2. 运行 Prettier 检查代码格式
3. 编译 TypeScript
4. 运行测试（如果有）
5. 构建 Docker 镜像

查看 CI/CD 状态：
1. 访问仓库页面
2. 点击 "Actions" 标签
3. 查看最近的 workflow 运行结果

---

## 🎯 最佳实践

1. **频繁提交**：每完成一个小功能就提交
2. **清晰的 commit 消息**：遵循 Conventional Commits 规范
3. **使用分支**：新功能在独立分支开发
4. **代码审查**：使用 Pull Request 进行代码审查
5. **保护主分支**：在 GitHub 设置中启用分支保护
6. **定期同步**：每天开始工作前 `git pull`

---

## 🔧 常用命令速查

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 推送代码
git push

# 查看分支
git branch -a

# 切换分支
git checkout branch-name

# 撤销修改
git checkout -- filename

# 查看差异
git diff
```

---

## 🆘 常见问题

### Q: 推送时提示 "rejected"
**A**: 远程仓库有新提交，先拉取再推送
```bash
git pull --rebase
git push
```

### Q: 如何撤销最后一次 commit
**A**: 
```bash
# 保留修改
git reset --soft HEAD~1

# 丢弃修改
git reset --hard HEAD~1
```

### Q: 如何修改最后一次 commit 消息
**A**:
```bash
git commit --amend -m "new message"
git push --force
```

---

**恭喜！你的项目现在已经在 GitHub 上了！** 🎉

仓库地址：`https://github.com/YOUR_USERNAME/StorageNews`
