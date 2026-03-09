# Daily News Push Implementation Plan

## Goal
Automatically push top 10 daily news to WeLink and personal WeChat groups every day.

## Technical Approach

### 1. WeLink Integration
**Method**: Group Robot Webhook API
- WeLink supports custom group robots with webhook URLs
- Supports Markdown format messages
- No authentication required (webhook URL acts as credential)

### 2. WeChat Integration
**Method**: WeChat Bot (wechaty-based)
- Use `wechaty` library for personal WeChat automation
- Requires QR code login once
- Can send messages to groups and individuals

## Proposed Changes

### Backend Services

#### [NEW] [messenger.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/services/messenger.ts)
- `sendToWeLink(message: string)`: Send formatted message to WeLink group
- `sendToWeChat(message: string)`: Send formatted message to WeChat group
- `formatDailyNews(news: NewsItem[])`: Format top 10 news into readable message

#### [MODIFY] [scheduler.ts](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/src/jobs/scheduler.ts)
- Add daily push task (default: 09:00 AM)
- Fetch top 10 news from yesterday
- Call messenger service to send to both platforms

### Configuration

#### [MODIFY] [.env](file:///Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/server/.env)
```env
# WeLink Group Robot Webhook
WELINK_WEBHOOK_URL=https://open.welink.huaweicloud.com/api/...

# WeChat Bot Configuration
WECHAT_BOT_ENABLED=true
WECHAT_TARGET_GROUP=StorageNews情报站

# Daily Push Schedule
DAILY_PUSH_TIME=09:00
DAILY_PUSH_ENABLED=true
```

## Message Format Example

```markdown
📰 **存储行业情报日报 - 2026-02-06**

🔥 **今日 Top 10 高价值新闻**

1. **[55分] 45Drives 发布 Proxinator VM2 超融合平台**
   🏢 Dell EMC | 📦 Product
   💡 AI摘要：45Drives公司宣布扩大其紧凑型超融合平台...
   🔗 [阅读原文](https://...)

2. **[51分] Kioxia 推出 512GB SD 存储卡系列**
   ...

---
📊 数据来源：StorageNews 智能聚合 | 由 AI 自动生成
```

## Implementation Steps

1. Install dependencies: `axios` (for WeLink), `wechaty` (for WeChat)
2. Create messenger service with platform-specific formatters
3. Update scheduler to add daily push task
4. Add configuration to `.env`
5. Test with manual trigger before enabling cron

## Verification Plan

### Manual Testing
1. Test WeLink webhook with sample message
2. Test WeChat bot login and group message sending
3. Verify message formatting on both platforms

### Automated Testing
1. Add manual trigger endpoint: `POST /api/admin/trigger-daily-push`
2. Verify cron schedule is working correctly
