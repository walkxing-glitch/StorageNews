# StorageNews 云服务器一键部署手册 (详细版)

本手册专为 **Ubuntu/CentOS** 等 Linux 云服务器设计，使用我们在 GitHub 上配置好的自动打包镜像进行部署。

---

## 🛠 阶段 1：服务器基础环境 (只需操作一次)

在终端登录你的云服务器，依次执行以下命令：

### 1. 安装 Docker
```bash
# 更新源
sudo apt-get update

# 安装 Docker (Ubuntu 示例)
curl -fsSL https://get.docker.com | bash -s docker

# 启动并设置自启动
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. 安装 Docker Compose
```bash
# 下载并安装 Compose (最新版)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

---

## 🔑 阶段 2：授权 GitHub 镜像访问

因为我们的库是私有的，服务器需要“钥匙”才能拉取镜像。

```bash
# 使用你的 GitHub 用户名和之前生成的 PAT (令牌) 登录
# 提示输入密码时，粘贴你的 ghp_xxxx 令牌
docker login ghcr.io -u walkxing-glitch
```

---

## 📂 阶段 3：建立项目目录与配置文件

### 1. 创建目录
```bash
sudo mkdir -p /opt/storagenews/nginx
sudo mkdir -p /opt/storagenews/monitoring
cd /opt/storagenews
```

### 2. 创建或上传核心文件
你需要将本地项目中的以下文件内容，在服务器上通过 `vi` 命令或者直接上传的方式建立：

- **`.env`**: (非常关键！请把本地 `server/.env` 的内容复制进去)
- **`docker-compose.prod.yml`**: (直接使用项目根目录下的同名文件)

```bash
# 示例：在服务器上创建 .env
sudo vi .env
# (按 i 进入输入模式，粘贴你的配置，按 Esc 键，输入 :wq 回车保存)
```

---

## 🚀 阶段 4：正式启动部署

在 `/opt/storagenews` 目录下，执行终极命令：

```bash
# 1. 拉取发布在 GitHub 上的最新“预制菜”镜像
sudo docker-compose -f docker-compose.prod.yml pull

# 2. 启动所有服务 (后台运行)
sudo docker-compose -f docker-compose.prod.yml up -d

# 3. 查看运行状态 (看到 Up 代表成功)
sudo docker-compose -f docker-compose.prod.yml ps
```

---

## 🔄 阶段 5：后续如何更新代码？

以后你每次在本地 `git push` 给 GitHub 之后，只需回服务器执行：

```bash
cd /opt/storagenews
sudo docker-compose -f docker-compose.prod.yml pull
sudo docker-compose -f docker-compose.prod.yml up -d
```

**💪 大功告成！你的系统现在已经通过云端流水线跑在服务器上了。**
