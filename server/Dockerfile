FROM node:18-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    openssh

# 复制 package 文件
COPY package.json ./
COPY package-lock.json* ./

# 安装所有依赖（包括开发依赖用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN node ./node_modules/typescript/lib/tsc.js

# 移除开发依赖
RUN npm prune --production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]