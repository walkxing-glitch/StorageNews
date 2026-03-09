# StorageNews 部署文档

## 环境要求

### 开发环境
- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 14.0
- **Docker**: >= 20.10 (可选)
- **npm**: >= 9.0

### 生产环境
- **服务器**: 2 CPU, 4GB RAM (最小配置)
- **存储**: 20GB SSD
- **操作系统**: Ubuntu 22.04 LTS / CentOS 8+
- **域名**: 已备案域名（如需公网访问）

---

## 本地开发部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd StorageNews
```

### 2. 后端部署

#### 使用 Docker Compose（推荐）
```bash
cd server
cp .env.example .env
# 编辑 .env 配置数据库和 API 密钥

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f server

# 初始化数据库
docker-compose exec server npm run init

# 停止服务
docker-compose down
```

#### 手动部署
```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 启动 PostgreSQL（如果没有 Docker）
# 方式1: 使用系统服务
sudo systemctl start postgresql

# 方式2: 使用 Homebrew (macOS)
brew services start postgresql@14

# 创建数据库
createdb storage_news

# 编译 TypeScript
npm run build

# 初始化数据库表
node dist/index.js --init

# 启动服务
npm run dev  # 开发模式（热重载）
npm start    # 生产模式
```

### 3. 移动端部署

```bash
cd mobile

# 安装依赖
npm install

# 配置 API 地址
cp .env.example .env
# 编辑 EXPO_PUBLIC_API_URL

# 启动开发服务器
npx expo start

# 在手机上测试
# 1. 安装 Expo Go App
# 2. 扫描二维码
```

### 4. Dashboard 部署

```bash
cd dashboard

# 使用 Python HTTP 服务器
python3 -m http.server 8080

# 或使用 Node.js
npx http-server -p 8080

# 访问 http://localhost:8080
```

---

## 生产环境部署

### 方案 A: Docker Compose（单机部署）

#### 1. 准备服务器
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 配置生产环境
```bash
# 创建项目目录
mkdir -p /opt/storagenews
cd /opt/storagenews

# 上传代码
git clone <repository-url> .

# 配置环境变量
cp server/.env.example server/.env
nano server/.env

# 生产环境配置示例
DB_HOST=postgres
DB_PORT=5432
DB_NAME=storage_news
DB_USER=postgres
DB_PASSWORD=<strong_password>
PORT=3001
NEWSAPI_KEY=<your_key>
AI_API_KEY=<your_key>
```

#### 3. 启动服务
```bash
cd server
docker-compose -f docker-compose.prod.yml up -d

# 初始化数据库
docker-compose exec server npm run init

# 验证服务
curl http://localhost:3001/api/news
```

#### 4. 配置 Nginx 反向代理
```nginx
# /etc/nginx/sites-available/storagenews
server {
    listen 80;
    server_name news.yourdomain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        root /opt/storagenews/dashboard;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/storagenews /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. 配置 SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d news.yourdomain.com
```

---

### 方案 B: Kubernetes（集群部署）

#### 1. 准备 Kubernetes 配置

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: storagenews-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: storagenews-backend
  template:
    metadata:
      labels:
        app: storagenews-backend
    spec:
      containers:
      - name: backend
        image: storagenews/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          value: postgres-service
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: storagenews-service
spec:
  selector:
    app: storagenews-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

#### 2. 部署到 Kubernetes
```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get services
```

---

## 数据库管理

### 备份
```bash
# 手动备份
pg_dump -U postgres storage_news > backup_$(date +%Y%m%d).sql

# 定时备份 (crontab)
0 2 * * * pg_dump -U postgres storage_news > /backups/storage_news_$(date +\%Y\%m\%d).sql
```

### 恢复
```bash
psql -U postgres storage_news < backup_20260206.sql
```

### 迁移
```bash
# 导出数据
pg_dump -U postgres -h old-server storage_news > migration.sql

# 导入到新服务器
psql -U postgres -h new-server storage_news < migration.sql
```

---

## 监控与日志

### 日志管理

#### 查看日志
```bash
# Docker 日志
docker-compose logs -f server

# 系统日志
journalctl -u storagenews -f

# 应用日志
tail -f /var/log/storagenews/app.log
```

#### 日志轮转配置
```bash
# /etc/logrotate.d/storagenews
/var/log/storagenews/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload storagenews
    endscript
}
```

### 性能监控

#### 使用 PM2（进程管理）
```bash
npm install -g pm2

# 启动应用
pm2 start dist/index.js --name storagenews

# 监控
pm2 monit

# 查看日志
pm2 logs storagenews

# 开机自启
pm2 startup
pm2 save
```

#### 使用 Prometheus + Grafana
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 故障排查

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接配置
psql -U postgres -h localhost -p 5433 storage_news

# 查看错误日志
tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. API 响应慢
```bash
# 检查数据库查询性能
EXPLAIN ANALYZE SELECT * FROM news ORDER BY score DESC LIMIT 50;

# 检查索引
\d news

# 添加缺失的索引
CREATE INDEX idx_news_score ON news(score DESC);
```

#### 3. 内存不足
```bash
# 查看内存使用
free -h
docker stats

# 限制容器内存
docker-compose.yml:
  services:
    server:
      mem_limit: 1g
```

#### 4. 磁盘空间不足
```bash
# 清理 Docker 镜像
docker system prune -a

# 清理日志
journalctl --vacuum-time=7d

# 清理数据库
VACUUM FULL;
```

---

## 更新部署

### 滚动更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 备份数据库
pg_dump storage_news > backup_before_update.sql

# 3. 构建新镜像
docker-compose build

# 4. 滚动更新
docker-compose up -d --no-deps --build server

# 5. 验证
curl http://localhost:3001/api/news

# 6. 如果失败，回滚
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

### 零停机更新（蓝绿部署）
```bash
# 1. 启动新版本（绿环境）
docker-compose -f docker-compose.green.yml up -d

# 2. 健康检查
curl http://localhost:3002/api/news

# 3. 切换 Nginx 配置
# 修改 upstream 指向新端口

# 4. 重载 Nginx
sudo nginx -s reload

# 5. 停止旧版本（蓝环境）
docker-compose -f docker-compose.blue.yml down
```

---

## 安全加固

### 1. 防火墙配置
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 数据库安全
```sql
-- 创建只读用户
CREATE USER readonly WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

-- 限制远程访问
-- 编辑 pg_hba.conf
host    storage_news    postgres    127.0.0.1/32    md5
```

### 3. API 限流
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 次请求
});

app.use('/api/', limiter);
```

---

## 性能优化建议

1. **启用 Redis 缓存**：缓存热门查询结果
2. **CDN 加速**：使用 Cloudflare 加速静态资源
3. **数据库优化**：定期 VACUUM 和 ANALYZE
4. **负载均衡**：使用 Nginx 或 HAProxy
5. **压缩响应**：启用 gzip 压缩

---

## 成本估算

### 云服务器方案（阿里云/腾讯云）
- **基础版**：2核4G，40GB SSD - ¥100/月
- **标准版**：4核8G，100GB SSD - ¥300/月
- **高级版**：8核16G，200GB SSD - ¥800/月

### 流量成本
- **国内流量**：¥0.8/GB
- **国际流量**：¥1.5/GB

### 第三方服务
- **NewsAPI**：免费版（100 请求/天）
- **DeepSeek API**：¥0.001/1K tokens
- **域名**：¥50-100/年
- **SSL 证书**：免费（Let's Encrypt）
