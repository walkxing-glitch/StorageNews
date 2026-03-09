# 微信群和 WeLink 群推送配置指南

## 📋 功能说明

StorageNews 现在支持每天自动推送 Top 10 新闻到：
- **WeLink 群**（华为企业协作平台）
- **微信群**（企业微信群机器人）

## 🔧 配置步骤

### 1. 获取 WeLink 群机器人 Webhook URL

#### 步骤 1: 在 WeLink 群中添加机器人
1. 打开 WeLink 应用
2. 进入目标群聊
3. 点击右上角 "..." → "群设置"
4. 选择 "群机器人" → "添加机器人"
5. 选择 "自定义机器人"

#### 步骤 2: 配置机器人
1. 输入机器人名称：`StorageNews 情报助手`
2. 选择消息类型：支持 Markdown
3. 点击 "创建"

#### 步骤 3: 复制 Webhook URL
1. 创建成功后，会显示 Webhook URL
2. 格式类似：`https://open.welink.huaweicloud.com/api/...`
3. **复制这个 URL，稍后要用**

---

### 2. 获取微信群机器人 Webhook URL

#### 方式 A: 企业微信群机器人（推荐）

**步骤 1: 在企业微信群中添加机器人**
1. 打开企业微信
2. 进入目标群聊
3. 点击右上角 "..." → "群机器人"
4. 点击 "添加群机器人"

**步骤 2: 配置机器人**
1. 输入机器人名称：`StorageNews 日报`
2. 点击 "添加"

**步骤 3: 复制 Webhook URL**
1. 创建成功后，会显示 Webhook URL
2. 格式类似：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx`
3. **复制这个 URL**

#### 方式 B: 个人微信（需要额外配置）

个人微信没有官方 Webhook API，需要使用第三方工具：
- **Wechaty**：开源微信机器人框架
- **需要额外配置**，暂不推荐（配置复杂）

**建议**：使用企业微信群机器人，配置简单且稳定。

---

### 3. 配置 StorageNews 服务器

#### 步骤 1: 编辑 .env 文件
```bash
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server
nano .env
```

#### 步骤 2: 填入 Webhook URL
```bash
# WeLink Group Robot Webhook
WELINK_WEBHOOK_URL=https://open.welink.huaweicloud.com/api/...你的URL...

# WeChat/Enterprise WeChat Group Robot Webhook  
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...你的key...

# Daily Push Configuration
DAILY_PUSH_TIME=09:00        # 推送时间（24小时制）
DAILY_PUSH_ENABLED=true      # 是否启用每日推送
```

#### 步骤 3: 保存并重启服务
```bash
# 保存文件（Ctrl+O, Enter, Ctrl+X）

# 重启服务
docker-compose restart server

# 或手动重启
npm run dev
```

---

## 🧪 测试推送功能

### 方式 1: 手动触发推送（推荐）

```bash
# 使用 curl 测试
curl -X POST http://localhost:3001/api/admin/trigger-daily-push

# 或使用 Postman/Insomnia
# POST http://localhost:3001/api/admin/trigger-daily-push
```

**预期响应**：
```json
{
  "success": true,
  "message": "Successfully sent 10 news items",
  "data": {
    "newsCount": 10,
    "topNews": [...]
  }
}
```

### 方式 2: 等待定时推送

默认每天早上 9:00 自动推送，可以修改 `DAILY_PUSH_TIME` 环境变量。

---

## 📱 推送消息格式示例

### 🆕 新版消息格式（2026-02-06 更新）

```markdown
# 📰 存储行业情报日报

**📅 2026-02-06 周四** | 🎯 精选 Top 10 条高价值资讯

---

## 1. 🔥🔥 **Dell EMC 发布 PowerStore 3.0，集成 AI 驱动的存储优化功能**

🔴 **评分：75.5分** | 🏢 **Dell EMC** | 📦 **Product**

> 💡 **AI 智能摘要**
> Dell EMC 宣布推出 PowerStore 3.0 存储阵列，新版本集成了先进的 AI 驱动功能。该系统能够自动优化数据放置，提升性能达 40%，并增强了数据保护功能。

> 📅 发布时间：2026/2/5
> 🔗 [📱 阅读全文](https://...)

---

## 2. 🔥 **Pure Storage 推出新一代 FlashArray//X 全闪存阵列**

🟠 **评分：62.0分** | 🏢 **Pure Storage** | 📦 **Product**

> 💡 **AI 智能摘要**
> Pure Storage 发布新一代 FlashArray//X 全闪存阵列，性能提升显著。新产品采用最新的 NVMe 技术，提供更高的 IOPS 和更低的延迟。

> 📅 发布时间：2026/2/5
> 🔗 [📱 阅读全文](https://...)

---

## 📊 数据统计

- 🎯 **今日精选**：10 条高价值新闻
- 🤖 **AI 驱动**：智能评分 + 自动摘要
- 📈 **覆盖范围**：全球存储行业动态

---

**🚀 StorageNews 智能聚合平台**
*让存储资讯触手可及 | 由 AI 自动生成*
```

### ✨ 新版格式特性

**🎨 视觉优化**
- 使用 H1/H2 标题层级，结构更清晰
- 彩色评分标识：🔴(>70分) 🟠(>60分) 🟡(>50分) 🔵(其他)
- 增强的表情符号：🔥🔥(>70分) 🔥(>60分) ⭐(>50分) 📌(其他)

**📝 内容增强**
- 显示星期几（周一到周日）
- AI 摘要显示前两句话，信息更丰富
- 添加发布时间信息
- 底部数据统计模块

**🔧 功能改进**
- 评分显示精度提升到小数点后1位
- 更好的移动端显示效果
- 支持企业微信和 WeLink 的完整 Markdown 渲染

### 🧪 预览新格式

```bash
# 预览新的消息格式
curl -X GET http://localhost:3001/api/admin/preview-message

# 响应将包含完整的格式化消息
```

---

## ⚙️ 高级配置

### 自定义推送时间

```bash
# 早上 8:00 推送
DAILY_PUSH_TIME=08:00

# 下午 6:00 推送
DAILY_PUSH_TIME=18:00

# 中午 12:00 推送
DAILY_PUSH_TIME=12:00
```

### 禁用推送

```bash
DAILY_PUSH_ENABLED=false
```

### 只推送到特定平台

```bash
# 只推送到 WeLink
WELINK_WEBHOOK_URL=https://...
WECHAT_WEBHOOK_URL=    # 留空

# 只推送到微信
WELINK_WEBHOOK_URL=    # 留空
WECHAT_WEBHOOK_URL=https://...
```

---

## 🔍 故障排查

### 问题 1: 推送失败，显示 "webhook not configured"
**原因**：Webhook URL 未配置或为空  
**解决**：检查 `.env` 文件中的 `WELINK_WEBHOOK_URL` 和 `WECHAT_WEBHOOK_URL`

### 问题 2: 推送失败，显示 "Error sending to WeLink"
**原因**：Webhook URL 错误或机器人被删除  
**解决**：
1. 检查 Webhook URL 是否正确
2. 在 WeLink 中确认机器人仍然存在
3. 重新创建机器人并更新 URL

### 问题 3: 没有收到推送消息
**原因**：可能是时间未到或没有新闻  
**解决**：
1. 检查服务器日志：`docker-compose logs -f server`
2. 手动触发测试：`curl -X POST http://localhost:3001/api/admin/trigger-daily-push`
3. 确认数据库中有新闻数据

### 问题 4: 消息格式不正确
**原因**：Webhook 不支持 Markdown  
**解决**：
- WeLink 和企业微信都支持 Markdown
- 如果不支持，需要修改 `messenger.ts` 中的消息格式

---

## 📊 查看推送日志

```bash
# 查看服务器日志
docker-compose logs -f server | grep "Scheduler"

# 查看最近的推送记录
docker-compose logs server | grep "Pushing.*top news"
```

---

## 🎯 最佳实践

1. **测试先行**：先用手动触发测试，确认推送正常后再启用定时任务
2. **备份 Webhook**：将 Webhook URL 保存到安全的地方
3. **监控日志**：定期检查推送日志，确保服务正常
4. **合理时间**：选择团队成员活跃的时间推送（如早上 9:00）
5. **避免打扰**：不要在深夜推送

---

## 🔗 相关文档

- [系统架构](architecture.md)
- [部署指南](deployment.md)
- [开发规范](development_guide.md)
