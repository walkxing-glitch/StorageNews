# StorageNews 远程服务器部署指南 (CD)

在本地代码通过 GitHub Actions 成功打包并推送到 GHCR 后，你只需要在远程服务器（如阿里云/腾讯云 Ubuntu）上执行以下步骤即可完成私有部署。

## 1. 服务器前置要求
- 确保服务器已安装 `docker` 和 `docker-compose`。
- 确保开放了外部访问的端口（如 `80` 和 `3001`）。

## 2. 授权服务器访问你的私有镜像库
因为镜像存放在私有的 GHCR 中，服务器需要用到你的 GitHub Personal Access Token (PAT，记得要勾选 `read:packages` 权限) 来登录。

```bash
# 在服务器终端执行登录
echo "ghp_你的_PAT_通行证" | docker login ghcr.io -u walkxing-glitch --password-stdin
```

## 3. 准备部署文件
在服务器上创建一个目录，比如 `/opt/storagenews/`。
你不需要上传所有源代码，只需要把项目中的以下三个文件/文件夹通过 SFTP（或直接复制粘贴内容）传到该目录下：

1. `docker-compose.prod.yml` (核心编排文件)
2. `.env` (包含你所有的 API Key，绝不能放进代码库的机密文件)
3. `nginx/` 文件夹 (如果你打算配置域名的话)

> 💡 **小贴士**: `docker-compose.prod.yml` 里面使用的镜像名字应该是你刚才打包出来的那两个：
> - `ghcr.io/walkxing-glitch/storagenews-server:latest`
> - `ghcr.io/walkxing-glitch/storagenews-dashboard:latest`

## 4. 拉取最新代码并启动 (或更新)
以后每次你在本地推了代码 (`git push`)，等 GitHub 上的机器人打包完转圈圈结束后，你只需连上服务器，在 `/opt/storagenews/` 目录下敲两行命令：

```bash
# 1. 把最新打包好的预制菜拉下来
docker-compose -f docker-compose.prod.yml pull

# 2. 扔掉旧的，热启动新的
docker-compose -f docker-compose.prod.yml up -d
```

🎉 **搞定！你的生产环境现在运行的已经是最新代码了。**
