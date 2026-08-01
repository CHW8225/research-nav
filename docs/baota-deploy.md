# 宝塔部署说明

本项目是一个 Node.js + Express + LowDB JSON 的科研导航网站。宝塔部署推荐使用：

- 宝塔 Node 项目管理器或 PM2 启动 Node 服务
- Nginx 反向代理到 Node 服务端口
- 生产环境设置 `JWT_SECRET`

## 1. 服务器环境

建议环境：

- Node.js 18 或更高版本
- npm
- Nginx
- 宝塔面板
- 宝塔 Node 项目管理器，或命令行 PM2

## 2. 上传项目

把项目上传到服务器，例如：

```bash
/www/wwwroot/research-nav
```

进入项目目录：

```bash
cd /www/wwwroot/research-nav
```

安装依赖：

```bash
npm install --omit=dev
```

如果是第一次部署，并且数据库文件不存在，确认：

```bash
server/database/db.json
```

已经随项目上传。不要删除这个文件，它保存后台账号、分类、链接和公告数据。

## 3. 生产环境变量

生产环境必须设置：

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=请换成一串足够长的随机密钥
DB_PATH=/www/wwwroot/research-nav/server/database/db.json
```

注意：

- `JWT_SECRET` 不要使用示例值。
- 不要把真实密钥提交到 Git。
- `DB_PATH` 可以不设置；不设置时默认使用 `server/database/db.json`。宝塔部署建议写成绝对路径，避免工作目录变化导致找不到数据库。

## 4. 宝塔 Node 项目管理器方式

在宝塔面板中：

1. 安装 Node.js 版本管理器或 Node 项目管理器。
2. 添加 Node 项目。
3. 项目目录选择：

```text
/www/wwwroot/research-nav
```

4. 启动文件填写：

```text
server/app.js
```

5. 运行用户建议使用网站对应用户，通常是：

```text
www
```

6. 端口填写：

```text
3000
```

7. 环境变量填写：

```text
NODE_ENV=production
PORT=3000
JWT_SECRET=请换成一串足够长的随机密钥
DB_PATH=/www/wwwroot/research-nav/server/database/db.json
```

8. 保存并启动。

启动成功后，在服务器本机验证：

```bash
curl http://127.0.0.1:3000/api/health
```

期望返回包含：

```json
{"status":"ok"}
```

## 5. PM2 命令行方式

如果不用宝塔 Node 项目管理器，可以使用 PM2：

```bash
npm install -g pm2
cd /www/wwwroot/research-nav
NODE_ENV=production PORT=3000 JWT_SECRET="请换成一串足够长的随机密钥" DB_PATH="/www/wwwroot/research-nav/server/database/db.json" pm2 start server/app.js --name research-nav
pm2 save
```

查看状态：

```bash
pm2 status
pm2 logs research-nav
```

重启：

```bash
pm2 restart research-nav
```

## 6. Nginx 反向代理

在宝塔网站管理中绑定域名，例如：

```text
nav.example.com
```

然后设置反向代理：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

如果宝塔自动生成了站点配置，把上面的代理规则放在对应 server 块中。

## 7. SSL

在宝塔网站管理里申请 SSL：

1. 网站 -> SSL
2. 选择 Let's Encrypt
3. 勾选域名
4. 申请并开启强制 HTTPS

## 8. 部署后验证

访问：

```text
https://你的域名/
https://你的域名/admin/login.html
https://你的域名/api/health
```

后台默认账号：

```text
admin / admin123
```

上线后建议第一时间进入后台修改密码。

## 9. 更新网站

后续更新代码时：

```bash
cd /www/wwwroot/research-nav
git pull
npm install --omit=dev
pm2 restart research-nav
```

如果用宝塔 Node 项目管理器，则在面板里重启 Node 项目。

## 10. 常见问题

### 生产环境启动失败并提示 JWT_SECRET

原因：生产环境没有设置 `JWT_SECRET`。

解决：在宝塔 Node 项目环境变量中添加：

```text
JWT_SECRET=一串足够长的随机密钥
```

### 访问域名显示 502

常见原因：

- Node 项目没有启动。
- Nginx 代理端口和 Node 端口不一致。
- 防火墙或安全组拦截。

检查：

```bash
curl http://127.0.0.1:3000/api/health
```

如果本机 curl 不通，先修 Node 服务；如果本机 curl 通但域名不通，检查 Nginx 反向代理。

### 后台上传图标失败

确认目录可写：

```bash
public/assets/uploads
```

如果没有目录：

```bash
mkdir -p public/assets/uploads
chown -R www:www public/assets/uploads
```

### 数据丢失

LowDB 数据保存在：

```text
server/database/db.json
```

部署、更新、备份时不要覆盖这个文件。建议定期备份：

```bash
cp server/database/db.json server/database/db.$(date +%F-%H%M%S).backup.json
```
