# AI 编程工具切换完全指南

## 📋 目录
1. [类似 Antigravity 的工具推荐](#工具推荐)
2. [工具间切换方法](#切换方法)
3. [恢复开发的提示词模板](#提示词模板)
4. [各工具的使用指南](#使用指南)

---

## 🛠️ 工具推荐

### 1. **Cursor** ⭐⭐⭐⭐⭐
**最推荐！与 Antigravity 最相似**

- **类型**: AI-first IDE（基于 VS Code）
- **特点**:
  - 内置 Claude、GPT-4 等多模型
  - Composer 模式（类似 Antigravity 的对话式开发）
  - 自动读取项目文档
  - 支持 @文件 和 @文件夹 引用
- **价格**: $20/月（Pro），免费版有限制
- **官网**: https://cursor.sh
- **适合**: 全职开发者，需要深度 AI 辅助

### 2. **Windsurf (Codeium)** ⭐⭐⭐⭐⭐
**免费且强大！**

- **类型**: AI-first IDE（基于 VS Code）
- **特点**:
  - 完全免费
  - Cascade 模式（AI 自主编辑多文件）
  - 支持多模型切换
  - 类似 Cursor 的体验
- **价格**: 免费
- **官网**: https://codeium.com/windsurf
- **适合**: 预算有限，想要类似 Cursor 的体验

### 3. **Cline (原 Claude Dev)** ⭐⭐⭐⭐
**VS Code 扩展，最灵活**

- **类型**: VS Code 扩展
- **特点**:
  - 在 VS Code 中使用 Claude
  - 支持自定义 API Key
  - 可以执行终端命令
  - 类似 Antigravity 的任务模式
- **价格**: 免费（需自己的 API Key）
- **安装**: VS Code 扩展商店搜索 "Cline"
- **适合**: 已经习惯 VS Code，想要 AI 辅助

### 4. **GitHub Copilot Workspace** ⭐⭐⭐⭐
**GitHub 官方，集成度高**

- **类型**: 在线 IDE + VS Code 扩展
- **特点**:
  - GitHub 深度集成
  - 自动生成 PR 描述
  - 支持 Issue → Code 自动化
- **价格**: $10/月（包含在 Copilot 订阅中）
- **官网**: https://github.com/features/copilot
- **适合**: GitHub 重度用户

### 5. **Aider** ⭐⭐⭐
**命令行工具，极客最爱**

- **类型**: 命令行 AI 编程助手
- **特点**:
  - 在终端中对话式编程
  - 支持多种 LLM（Claude、GPT-4、DeepSeek）
  - Git 集成
- **价格**: 免费（需自己的 API Key）
- **安装**: `pip install aider-chat`
- **适合**: 喜欢命令行的开发者

### 6. **Continue** ⭐⭐⭐
**开源的 Copilot 替代品**

- **类型**: VS Code / JetBrains 扩展
- **特点**:
  - 完全开源
  - 支持本地模型（Ollama）
  - 自定义提示词
- **价格**: 免费
- **官网**: https://continue.dev
- **适合**: 注重隐私，想用本地模型

---

## 🔄 切换方法详解

### 场景 1: Antigravity → Cursor

#### 步骤 1: 安装 Cursor
```bash
# 下载并安装
# https://cursor.sh/download

# 或使用 Homebrew (macOS)
brew install --cask cursor
```

#### 步骤 2: 打开项目
```bash
# 方式 1: 命令行
cursor /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 方式 2: 在 Cursor 中
# File → Open Folder → 选择 StorageNews 目录
```

#### 步骤 3: 恢复开发（提示词）
在 Cursor 的 Composer 中（Cmd+I）输入：

```
我正在开发 StorageNews 项目，这是一个存储行业情报聚合平台。

请先阅读以下文档了解项目：
@docs/architecture.md
@docs/task.md
@docs/roadmap.md

当前进度：Phase 3 已完成（视觉优化），准备开始 Phase 4（每日推送功能）。

请告诉我：
1. 当前项目的整体状态
2. 下一步应该做什么
3. 有哪些待完成的任务
```

#### 步骤 4: 继续开发
```
# Cursor 会自动读取文档并回复

# 然后你可以说：
"根据 implementation_plan_daily_push.md，帮我实现 WeLink 推送功能"
```

---

### 场景 2: Antigravity → Windsurf

#### 步骤 1: 安装 Windsurf
```bash
# 下载并安装
# https://codeium.com/windsurf

# macOS 安装
# 下载 .dmg 文件，拖到 Applications
```

#### 步骤 2: 打开项目
```bash
# 命令行打开
windsurf /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
```

#### 步骤 3: 恢复开发（提示词）
在 Cascade 面板中输入：

```
我需要继续开发 StorageNews 项目。

项目背景：
- 存储行业新闻聚合平台
- 已完成 Phase 1-3（评分系统、AI摘要、视觉优化）
- 当前在 Phase 4（每日推送功能）

请执行以下操作：
1. 阅读 README.md 了解项目概况
2. 查看 docs/task.md 了解当前进度
3. 查看 docs/roadmap.md 了解下一步计划
4. 总结当前状态并建议下一步行动
```

---

### 场景 3: Antigravity → VS Code + Cline

#### 步骤 1: 安装 VS Code 和 Cline
```bash
# 安装 VS Code
brew install --cask visual-studio-code

# 打开 VS Code
code /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 在 VS Code 中：
# 1. 打开扩展面板（Cmd+Shift+X）
# 2. 搜索 "Cline"
# 3. 点击 Install
```

#### 步骤 2: 配置 Cline
```
# 在 Cline 扩展中：
# 1. 点击设置图标
# 2. 选择 API Provider（Claude、OpenAI、DeepSeek 等）
# 3. 输入你的 API Key
```

#### 步骤 3: 恢复开发（提示词）
在 Cline 面板中输入：

```
我正在开发 StorageNews 项目。请帮我恢复开发状态。

项目路径：/Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

请执行：
1. 阅读 README.md
2. 查看 docs/task.md 中的任务清单
3. 查看 docs/architecture.md 了解系统架构
4. 告诉我当前进度和下一步建议

我们上次完成了 Phase 3（视觉优化），准备开始 Phase 4（每日推送）。
```

---

### 场景 4: Antigravity → Aider（命令行）

#### 步骤 1: 安装 Aider
```bash
# 使用 pip 安装
pip install aider-chat

# 或使用 pipx（推荐）
pipx install aider-chat
```

#### 步骤 2: 配置 API Key
```bash
# 设置环境变量
export ANTHROPIC_API_KEY=your_claude_api_key
# 或
export OPENAI_API_KEY=your_openai_api_key
```

#### 步骤 3: 启动 Aider
```bash
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 启动 Aider，添加关键文件到上下文
aider \
  README.md \
  docs/task.md \
  docs/architecture.md \
  server/src/index.ts
```

#### 步骤 4: 恢复开发（提示词）
在 Aider 中输入：

```
我正在开发 StorageNews 项目。

请先阅读 README.md 和 docs/task.md 了解项目背景和当前进度。

我们已完成 Phase 1-3，现在要开始 Phase 4（每日推送功能）。

请告诉我：
1. 当前项目状态
2. Phase 4 的实施计划在哪里
3. 下一步应该做什么
```

---

## 💬 提示词模板库

### 模板 1: 首次恢复开发
```
我正在开发 [项目名称] 项目。

项目背景：
- [简短描述项目是什么]
- 技术栈：[主要技术]
- 当前阶段：[Phase X]

请执行以下操作：
1. 阅读 README.md 了解项目概况
2. 查看 docs/task.md 了解当前进度
3. 查看 docs/architecture.md 了解系统架构
4. 总结当前状态并建议下一步行动

上次我完成了 [上次完成的内容]，现在准备开始 [下一步计划]。
```

### 模板 2: 继续特定功能开发
```
我需要继续开发 [功能名称]。

相关文档：
- 实施计划：docs/implementation_plan_[xxx].md
- 任务清单：docs/task.md

当前状态：
- [已完成的部分]
- [待完成的部分]

请帮我：
1. 回顾实施计划
2. 检查当前代码状态
3. 继续实现 [具体功能]
```

### 模板 3: 修复问题
```
我遇到了一个问题：[问题描述]

项目信息：
- 项目：StorageNews
- 相关文件：[文件路径]
- 错误信息：[错误日志]

请帮我：
1. 分析问题原因
2. 查看相关代码
3. 提供修复方案
```

### 模板 4: 代码审查
```
请帮我审查以下代码，确保符合项目规范。

项目规范文档：docs/development_guide.md

需要审查的文件：
- [文件1]
- [文件2]

重点检查：
1. 代码风格是否符合 ESLint 规则
2. 是否遵循命名规范
3. 错误处理是否完善
4. 性能是否有优化空间
```

---

## 🎯 不同工具的最佳使用场景

### Cursor - 适合：
- ✅ 需要深度 AI 辅助的复杂项目
- ✅ 多文件同时编辑
- ✅ 愿意付费获得最佳体验

### Windsurf - 适合：
- ✅ 想要 Cursor 体验但预算有限
- ✅ 需要 AI 自主编辑多文件
- ✅ 开源项目开发

### Cline (VS Code) - 适合：
- ✅ 已经习惯 VS Code
- ✅ 需要灵活切换不同 AI 模型
- ✅ 想要完全控制 API 使用

### Aider - 适合：
- ✅ 喜欢命令行工作流
- ✅ 需要 Git 深度集成
- ✅ 脚本化和自动化开发

### Antigravity - 适合：
- ✅ 需要项目管理功能（task.md）
- ✅ 需要持久化对话历史
- ✅ 多模型切换（Claude、Gemini）

---

## 📝 快速切换检查清单

### 切换前检查：
- [ ] 所有代码已提交到 Git
- [ ] 文档已更新（task.md、walkthrough.md）
- [ ] 环境变量已配置（.env）
- [ ] 依赖已安装（npm install）

### 切换后验证：
- [ ] 项目可以正常打开
- [ ] AI 能读取项目文档
- [ ] 开发服务器可以启动
- [ ] ESLint 和 Prettier 正常工作

---

## 🔧 常见问题解决

### Q: AI 读不到我的文档？
**A**: 确保文档在项目根目录的 `docs/` 文件夹中，并使用 `@docs/xxx.md` 引用。

### Q: 切换工具后代码风格不一致？
**A**: 所有工具都会自动识别 `.eslintrc.json` 和 `.prettierrc.json`，运行 `npm run lint:fix` 统一风格。

### Q: 如何在不同工具间同步进度？
**A**: 始终更新 `docs/task.md`，所有 AI 工具都会读取这个文件。

### Q: 哪个工具最接近 Antigravity？
**A**: Cursor 或 Windsurf，它们都有类似的对话式开发体验。

---

## 🎓 推荐学习路径

1. **第 1 周**: 继续在 Antigravity 中开发，熟悉项目
2. **第 2 周**: 尝试 Cursor 或 Windsurf，体验不同的 AI 辅助方式
3. **第 3 周**: 尝试 VS Code + Cline，学习传统 IDE + AI 的工作流
4. **第 4 周**: 根据个人偏好选择主力工具

**最终目标**: 能够在任何工具中无缝继续开发，不依赖特定环境。
