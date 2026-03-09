# StorageNews 项目目录结构详解

## 📁 完整目录结构

### 1. **项目代码目录**（你的实际代码）
```
/Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/
├── README.md                    # 项目主页
├── LICENSE                      # MIT 许可证
├── CHANGELOG.md                 # 版本历史
├── .github/                     # GitHub 配置
│   └── workflows/
│       └── ci.yml              # CI/CD 自动化
├── docs/                        # 📚 项目文档（已同步）
│   ├── architecture.md
│   ├── development_guide.md
│   ├── deployment.md
│   ├── roadmap.md
│   ├── task.md
│   ├── walkthrough.md
│   ├── tool_switching_guide.md
│   ├── standardization_summary.md
│   └── implementation_plan_*.md
├── server/                      # 🖥️ 后端服务
│   ├── src/
│   │   ├── config/             # 配置文件
│   │   │   ├── database.ts
│   │   │   └── rules.json
│   │   ├── models/             # 数据模型
│   │   │   └── News.ts
│   │   ├── routes/             # API 路由
│   │   │   └── news.ts
│   │   ├── services/           # 业务逻辑
│   │   │   ├── ai.ts
│   │   │   ├── scoring.ts
│   │   │   ├── newsapi.ts
│   │   │   └── rss.ts
│   │   ├── jobs/               # 定时任务
│   │   │   └── scheduler.ts
│   │   └── index.ts            # 入口文件
│   ├── dist/                   # 编译输出（.gitignore）
│   ├── .env                    # 环境变量（.gitignore）
│   ├── .env.example            # 环境变量模板
│   ├── .eslintrc.json          # ESLint 配置
│   ├── .prettierrc.json        # Prettier 配置
│   ├── package.json
│   ├── tsconfig.json
│   └── docker-compose.yml
├── mobile/                      # 📱 移动应用
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # 新闻列表
│   │   │   └── settings.tsx    # 设置页
│   │   └── _layout.tsx
│   ├── services/
│   │   └── api.ts
│   ├── assets/
│   ├── .env
│   ├── .env.example
│   ├── app.json
│   └── package.json
└── dashboard/                   # 📊 Web Dashboard
    ├── index.html
    ├── package.json
    └── Dockerfile
```

### 2. **Antigravity 文档目录**（对话历史和 artifacts）
```
/Users/ddn/.gemini/antigravity/brain/e93b3159-755a-4cb8-a550-6576d5b13e94/
├── task.md                      # 任务清单（主文件）
├── walkthrough.md               # 项目总结
├── roadmap.md                   # 产品路线图
├── architecture.md              # 系统架构
├── development_guide.md         # 开发规范
├── deployment.md                # 部署文档
├── tool_switching_guide.md      # 工具切换指南
├── implementation_plan.md       # Phase 1 计划
├── implementation_plan_v2.md    # Phase 2 计划
├── implementation_plan_v3.md    # Phase 3 计划
├── implementation_plan_daily_push.md  # Phase 4 计划
├── standardization_summary.md   # 标准化总结
├── media__*.jpg                 # 截图和图片
├── *.md.metadata.json           # 文档元数据
├── *.md.resolved.*              # 文档版本历史
└── .system_generated/           # 系统生成的日志
    └── logs/
        ├── overview.txt
        └── [各个任务的日志文件]
```

---

## 🔗 两个目录的关系

### 关键理解：
1. **项目代码目录** = 你的实际代码，可以用 Git 管理，可以在任何 IDE 中打开
2. **Antigravity 文档目录** = Antigravity 专用的对话历史和 artifacts，用于跨对话继承

### 文档同步机制：
```
Antigravity 创建文档
    ↓
保存到 /Users/ddn/.gemini/antigravity/brain/[conversation-id]/
    ↓
我们手动复制到项目的 docs/ 文件夹
    ↓
项目代码目录现在包含所有文档
    ↓
其他工具可以直接读取 docs/ 文件夹
```

**重要**：我已经帮你把所有文档从 Antigravity 目录复制到了项目的 `docs/` 文件夹，所以：
- ✅ 在 Antigravity 中：读取两个位置的文档
- ✅ 在其他工具中：只读取 `docs/` 文件夹

---

## 🎯 切换工具后如何关联项目目录

### 场景 1: 切换到 Cursor

```bash
# 方式 1: 命令行打开（推荐）
cursor /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 方式 2: 在 Cursor 中
# File → Open Folder → 选择 StorageNews 目录

# 方式 3: 拖拽
# 直接把 StorageNews 文件夹拖到 Cursor 图标上
```

**Cursor 会自动：**
- 识别项目根目录
- 读取 `docs/` 文件夹中的所有文档
- 识别 `.eslintrc.json` 和 `.prettierrc.json`
- 支持 `@docs/xxx.md` 引用

### 场景 2: 切换到 VS Code

```bash
# 方式 1: 命令行
code /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 方式 2: 在 VS Code 中
# File → Open Folder → 选择 StorageNews 目录

# 方式 3: 快捷方式
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
code .
```

**VS Code 会自动：**
- 加载工作区配置
- 应用 ESLint 和 Prettier 规则
- Cline 扩展可以读取所有文件

### 场景 3: 切换到 Windsurf

```bash
# 命令行打开
windsurf /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 或在 Windsurf 中
# File → Open Folder
```

### 场景 4: 使用 Aider（命令行）

```bash
# 进入项目目录
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# 启动 Aider，添加关键文档到上下文
aider \
  README.md \
  docs/task.md \
  docs/architecture.md \
  server/src/index.ts

# Aider 会自动关联当前目录
```

---

## 📋 目录关联检查清单

### 切换工具前：
- [ ] 确认项目路径：`/Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews`
- [ ] 确认 `docs/` 文件夹存在且包含所有文档
- [ ] 确认 `.eslintrc.json` 和 `.prettierrc.json` 存在

### 切换工具后：
- [ ] 工具显示的根目录是 `StorageNews/`
- [ ] 可以看到 `README.md`、`docs/`、`server/`、`mobile/` 等文件夹
- [ ] AI 能读取 `docs/` 中的文档（测试：`@docs/task.md`）
- [ ] 终端的当前目录正确

---

## 🔍 常见问题解决

### Q1: 为什么有两个文档目录？
**A**: 
- **Antigravity 目录**：Antigravity 专用，用于跨对话继承
- **项目 docs/ 目录**：通用文档，所有工具都能读取

我们已经把 Antigravity 的文档复制到项目中，所以其他工具也能用。

### Q2: 如果我在 Cursor 中修改了文档，Antigravity 能看到吗？
**A**: 
- ✅ 能！因为 Antigravity 也会读取项目的 `docs/` 文件夹
- 但 Antigravity 的 artifacts 目录不会自动更新
- 建议：在项目的 `docs/` 中维护文档，作为唯一真实来源

### Q3: 我应该在哪个目录执行 Git 命令？
**A**: 
```bash
# 在项目根目录
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
git status
git add .
git commit -m "..."
```

### Q4: 我应该在哪个目录执行 npm 命令？
**A**: 
```bash
# 后端命令
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server
npm run dev
npm run lint

# 移动端命令
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/mobile
npx expo start
```

### Q5: 如何验证目录关联正确？
**A**: 
```bash
# 在任何工具中，打开终端执行：
pwd
# 应该显示：/Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

ls -la
# 应该看到：README.md, docs/, server/, mobile/, dashboard/
```

---

## 🎓 最佳实践

### 1. 文档管理
```bash
# ✅ 推荐：在项目 docs/ 中维护文档
/Users/ddn/Developer/.../StorageNews/docs/

# ❌ 避免：只在 Antigravity 目录中修改
# 因为其他工具读不到
```

### 2. 版本控制
```bash
# ✅ 推荐：把 docs/ 提交到 Git
git add docs/
git commit -m "docs: update architecture"

# ❌ 避免：把 Antigravity 目录提交到 Git
# 那是你的本地对话历史，不需要共享
```

### 3. 团队协作
```bash
# 团队成员克隆项目后
git clone <repository-url>
cd StorageNews

# 他们会得到完整的 docs/ 文件夹
# 可以在任何工具中打开并继续开发
```

---

## 📊 目录关系图

```
你的 Mac
├── /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/
│   └── StorageNews/                    ← 项目代码（Git 管理）
│       ├── docs/                       ← 通用文档（所有工具可读）
│       ├── server/                     ← 后端代码
│       ├── mobile/                     ← 移动端代码
│       └── dashboard/                  ← Dashboard 代码
│
└── /Users/ddn/.gemini/antigravity/brain/
    └── e93b3159-755a-4cb8-a550-6576d5b13e94/  ← Antigravity 专用
        ├── task.md                     ← 对话历史中的 artifacts
        ├── *.md                        ← 已复制到项目 docs/
        └── .system_generated/          ← 对话日志
```

**关键点**：
- 项目代码目录是"唯一真实来源"
- Antigravity 目录是"对话历史备份"
- 所有文档已同步到项目的 `docs/` 文件夹

---

## 🚀 快速切换命令参考

```bash
# Cursor
cursor /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# VS Code
code /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# Windsurf
windsurf /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews

# Aider
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
aider README.md docs/task.md

# 终端（任何操作）
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
```

**记住这个路径**：
```
/Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews
```
这是你的项目根目录，所有工具都应该打开这个目录。
