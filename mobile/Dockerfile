FROM node:18-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    git \
    openssh \
    bash

# 复制 package 文件
COPY package.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8081 19000 19001 19002

# 设置环境变量
ENV CI=true
ENV EXPO_DEBUG=true

CMD ["npx", "expo", "start", "--host", "0.0.0.0", "--offline"]