# App Store 发布完全指南

## 📋 前置准备

### 1. 注册 Apple Developer 账号

**费用**: $99/年

**步骤**:
1. 访问 https://developer.apple.com
2. 点击 "Account" → "Join the Apple Developer Program"
3. 使用你的 Apple ID 登录
4. 填写个人/公司信息
5. 支付 $99 年费
6. 等待审核（通常 1-2 天）

### 2. 安装必要工具

```bash
# 安装 Xcode（必需，仅 macOS）
# 从 App Store 下载 Xcode

# 安装 EAS CLI（Expo Application Services）
npm install -g eas-cli

# 登录 Expo 账号
eas login
```

---

## 🚀 使用 Expo 构建和发布

### 步骤 1: 配置 app.json

```bash
cd /Users/ddn/Developer/02_AI_Assistants/Qoder_Work/StorageNews/mobile
nano app.json
```

**关键配置**:
```json
{
  "expo": {
    "name": "StorageNews",
    "slug": "storagenews",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.storagenews",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourdomain.storagenews",
      "versionCode": 1
    }
  }
}
```

### 步骤 2: 准备应用图标和启动画面

**图标要求**:
- iOS: 1024x1024 px (PNG, 无透明度)
- Android: 1024x1024 px (PNG, 可透明)

**创建图标**:
```bash
# 使用在线工具生成图标
# 推荐: https://www.appicon.co/
# 或使用 Figma/Sketch 设计

# 将图标放到 assets/ 目录
cp your-icon.png mobile/assets/icon.png
cp your-splash.png mobile/assets/splash.png
```

### 步骤 3: 配置 EAS Build

```bash
cd mobile

# 初始化 EAS
eas build:configure

# 这会创建 eas.json 文件
```

**eas.json 示例**:
```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📱 iOS 发布流程

### 步骤 1: 在 App Store Connect 创建应用

1. 访问 https://appstoreconnect.apple.com
2. 点击 "My Apps" → "+" → "New App"
3. 填写信息:
   - **Platform**: iOS
   - **Name**: StorageNews
   - **Primary Language**: Chinese (Simplified)
   - **Bundle ID**: com.yourdomain.storagenews
   - **SKU**: storagenews-ios-001
4. 点击 "Create"

### 步骤 2: 构建 iOS 应用

```bash
cd mobile

# 构建生产版本
eas build --platform ios --profile production

# 等待构建完成（通常 10-20 分钟）
# 构建完成后会自动上传到 App Store Connect
```

### 步骤 3: 填写 App Store 信息

在 App Store Connect 中填写:

**1. App 信息**:
- **名称**: StorageNews
- **副标题**: 智能存储行业情报聚合
- **类别**: 新闻 / 商业

**2. 定价和销售范围**:
- **价格**: 免费
- **销售范围**: 中国大陆

**3. App 隐私**:
- 填写隐私政策 URL（需要准备）
- 说明数据收集情况

**4. 截图**:
- iPhone 6.7": 至少 3 张（1290x2796 px）
- iPhone 6.5": 至少 3 张（1242x2688 px）
- iPad Pro 12.9": 至少 2 张（2048x2732 px）

**5. 描述**:
```
StorageNews 是一款专为存储行业从业者打造的智能情报聚合平台。

核心功能：
• 多源新闻聚合：自动抓取 NewsAPI、RSS 等多个来源
• 智能评分系统：基于来源、厂商、类别的自动打分
• AI 摘要：高价值新闻自动生成中文摘要
• 精美视觉：Featured 卡片 + 缩略图设计
• 智能筛选：厂商/类别双层过滤

适用人群：
- 存储架构师
- 产品经理
- 技术决策者
- 行业分析师
```

**6. 关键词**:
```
存储,新闻,情报,AI,摘要,Dell,NetApp,Pure Storage
```

### 步骤 4: 提交审核

1. 在 App Store Connect 中选择构建版本
2. 填写"What's New in This Version"
3. 点击 "Submit for Review"
4. 等待审核（通常 1-3 天）

---

## 🤖 Android 发布流程

### 步骤 1: 创建 Google Play Console 账号

**费用**: $25（一次性）

1. 访问 https://play.google.com/console
2. 注册开发者账号
3. 支付 $25 注册费

### 步骤 2: 创建应用

1. 在 Google Play Console 点击 "Create app"
2. 填写信息:
   - **App name**: StorageNews
   - **Default language**: Chinese (Simplified)
   - **App or game**: App
   - **Free or paid**: Free

### 步骤 3: 构建 Android 应用

```bash
cd mobile

# 构建 AAB（Android App Bundle）
eas build --platform android --profile production

# 或构建 APK（用于测试）
eas build --platform android --profile preview
```

### 步骤 4: 上传到 Google Play

1. 在 Google Play Console 中选择你的应用
2. 进入 "Production" → "Create new release"
3. 上传 AAB 文件
4. 填写 "Release notes"
5. 点击 "Review release"

### 步骤 5: 填写商店信息

**应用详情**:
- **简短描述**: StorageNews - 智能存储行业情报聚合平台
- **完整描述**: （同 iOS）
- **应用图标**: 512x512 px
- **功能图片**: 1024x500 px
- **截图**: 至少 2 张（手机 + 平板）

### 步骤 6: 内容分级

1. 填写内容分级问卷
2. 通常选择 "Everyone"（所有人）

### 步骤 7: 提交审核

1. 完成所有必填项
2. 点击 "Submit for review"
3. 等待审核（通常几小时到 1 天）

---

## 🔄 更新应用

### 更新版本号

```bash
# 编辑 app.json
cd mobile
nano app.json

# 更新版本号
{
  "version": "1.1.0",  # 主版本号
  "ios": {
    "buildNumber": "2"  # iOS 构建号
  },
  "android": {
    "versionCode": 2    # Android 版本码
  }
}
```

### 构建新版本

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### 提交更新

1. 在 App Store Connect / Google Play Console 中创建新版本
2. 上传新构建
3. 填写更新说明
4. 提交审核

---

## 🧪 测试发布（TestFlight / Internal Testing）

### iOS TestFlight

```bash
# 构建测试版本
eas build --platform ios --profile preview

# 在 App Store Connect 中:
# 1. 进入 "TestFlight" 标签
# 2. 添加测试人员（邮箱）
# 3. 测试人员会收到邀请邮件
```

### Android Internal Testing

```bash
# 构建测试版本
eas build --platform android --profile preview

# 在 Google Play Console 中:
# 1. 进入 "Internal testing"
# 2. 创建测试轨道
# 3. 添加测试人员
```

---

## 📊 应用审核常见拒绝原因

### iOS 审核要点

1. **功能完整性**: 应用必须完全可用，不能有"即将推出"的功能
2. **隐私政策**: 必须提供隐私政策 URL
3. **数据使用说明**: 清楚说明收集哪些数据
4. **测试账号**: 如果需要登录，提供测试账号
5. **元数据准确**: 截图、描述必须与实际功能一致

### Android 审核要点

1. **目标 API 级别**: 必须符合 Google Play 要求
2. **权限说明**: 清楚说明为什么需要每个权限
3. **内容分级**: 正确填写内容分级
4. **隐私政策**: 提供隐私政策 URL

---

## 🎯 发布检查清单

### 发布前检查

- [ ] 应用图标和启动画面已准备
- [ ] 版本号已更新
- [ ] 所有功能已测试
- [ ] 隐私政策已准备
- [ ] 截图已准备（多种设备尺寸）
- [ ] 应用描述已撰写
- [ ] 关键词已优化
- [ ] 测试账号已准备（如需要）

### 发布后检查

- [ ] 在 App Store / Google Play 中搜索应用
- [ ] 下载并测试正式版
- [ ] 监控崩溃报告
- [ ] 回复用户评论
- [ ] 跟踪下载量和评分

---

## 💰 费用总结

| 项目 | iOS | Android | 总计 |
|------|-----|---------|------|
| 开发者账号 | $99/年 | $25（一次性） | $124 首年 |
| EAS Build | 免费额度 | 免费额度 | $0 |
| 超出额度 | $29/月 | $29/月 | $29/月 |

---

## 🔗 相关资源

- [Expo 官方文档](https://docs.expo.dev/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Apple 审核指南](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play 政策](https://play.google.com/about/developer-content-policy/)

---

**注意**: 首次发布可能需要 1-2 周时间完成所有步骤和审核。建议提前规划！
