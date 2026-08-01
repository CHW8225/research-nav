# 宝塔面板部署 - 快速参考

## 🚀 快速开始

### 1. 本地打包
```bash
# 双击运行
打包项目.bat
```

### 2. 上传到服务器
- 登录宝塔面板: `http://119.91.227.249:8888`
- 进入【文件管理】
- 上传 `research-nav.zip` 到 `/www/wwwroot/research-nav`
- 解压文件

### 3. 一键部署
```bash
# SSH 连接服务器或使用宝塔终端
cd /www/wwwroot/research-nav
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 常用命令

### PM2 命令
```bash
# 查看状态
pm2 status

# 启动应用
pm2 start ecosystem.config.js

# 重启应用
pm2 restart research-nav

# 停止应用
pm2 stop research-nav

# 查看日志
pm2 logs research-nav

# 清空日志
pm2 flush

# 监控
pm2 monit

# 开机自启
pm2 startup
pm2 save
```

### Nginx 命令
```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 重启 Nginx
nginx -s restart
```

### 查看日志
```bash
# PM2 日志
tail -f /www/wwwroot/research-nav/logs/pm2-out.log
tail -f /www/wwwroot/research-nav/logs/pm2-error.log

# Nginx 访问日志
tail -f /www/wwwlogs/research-nav_access.log

# Nginx 错误日志
tail -f /www/wwwlogs/research-nav_error.log
```

---

## 🔧 配置文件位置

### PM2 配置
```
/www/wwwroot/research-nav/ecosystem.config.js
```

### Nginx 配置
```
/www/server/panel/vhost/nginx/research-nav.conf
```
或通过宝塔面板：网站 → 设置 → 配置文件

### 项目文件
```
/www/wwwroot/research-nav/
├── server/           # 后端代码
├── public/           # 前台代码
├── admin/            # 后台管理
├── logs/             # 日志文件
└── server/database/  # 数据库文件
```

---

## ❗ 常见问题

### 1. 端口被占用
```bash
# 查找占用进程
lsof -i :3000
# 或
netstat -ntlp | grep 3000

# 杀死进程
kill -9 <PID>
```

### 2. npm install 失败
```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 3. PM2 启动失败
```bash
# 查看详细日志
pm2 logs research-nav --lines 100

# 检查配置文件
pm2 start ecosystem.config.js --no-daemon
```

### 4. 网站无法访问
```bash
# 检查 PM2 状态
pm2 status

# 检查 Nginx 状态
systemctl status nginx

# 检查防火墙
# 在宝塔面板：安全 → 端口放行

# 检查 Nginx 配置
nginx -t
```

### 5. 数据库丢失
```bash
# 备份数据库
cp /www/wwwroot/research-nav/server/database/db.json \
   /www/wwwroot/research-nav/server/database/db.json.backup

# 恢复数据库
cp /www/wwwroot/research-nav/server/database/db.json.backup \
   /www/wwwroot/research-nav/server/database/db.json

# 重启应用
pm2 restart research-nav
```

---

## 🔐 安全建议

### 1. 修改默认密码
- 登录后台: `http://你的IP/admin/login.html`
- 使用 `admin` / `admin123` 登录
- 立即修改密码

### 2. 配置防火墙
在宝塔面板：【安全】→【端口放行】
- 保留：80, 443, 8888（宝塔面板）
- 3000 可选（使用 Nginx 反向代理时可关闭）

### 3. 启用 SSL
- 宝塔面板：【网站】→【设置】→【SSL】
- 选择 Let's Encrypt
- 申请证书并开启强制 HTTPS

### 4. 定期备份
```bash
# 添加到 crontab
crontab -e

# 每天凌晨 3 点备份数据库
0 3 * * * cp /www/wwwroot/research-nav/server/database/db.json /www/wwwroot/research-nav/server/database/db.json.backup.$(date +\%Y\%m\%d)
```

---

## 📊 监控和维护

### 查看资源使用
```bash
# CPU 和内存
top
# 或
htop

# 磁盘使用
df -h

# 内存使用
free -h
```

### PM2 监控
```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 info research-nav
```

### 宝塔面板监控
- 【监控】→【CPU监控】
- 【监控】→【内存监控】
- 【监控】→【负载监控】

---

## 🔄 更新项目

### 方式1：手动更新
```bash
# 1. 备份当前版本
cd /www/wwwroot
cp -r research-nav research-nav-backup-$(date +%Y%m%d)

# 2. 上传新代码

# 3. 重启应用
cd /www/wwwroot/research-nav
pm2 restart research-nav
```

### 方式2：使用 Git（推荐）
```bash
cd /www/wwwroot/research-nav

# 拉取最新代码
git pull

# 安装依赖（如有更新）
npm install

# 重启应用
pm2 restart research-nav
```

---

## 📞 获取帮助

### 查看文档
- 部署完整指南：`DEPLOYMENT_GUIDE.md`
- 项目说明：`README.md`

### 查看日志
```bash
# PM2 日志
pm2 logs research-nav --lines 100

# 应用日志
tail -f /www/wwwroot/research-nav/logs/pm2-error.log
```

### 重置应用
```bash
# 完全重置
pm2 delete research-nav
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ 部署检查清单

- [ ] Node.js 已安装
- [ ] PM2 已安装
- [ ] 项目已上传
- [ ] 依赖已安装
- [ ] PM2 已启动
- [ ] Nginx 已配置
- [ ] 防火墙已设置
- [ ] 网站可访问
- [ ] 后台可登录
- [ ] 密码已修改
- [ ] SSL 已配置（可选）
- [ ] 备份已设置

---

## 🎉 完成

部署完成后，你的网站地址为：

- **前台**: http://119.91.227.249（或你的域名）
- **后台**: http://119.91.227.249/admin/login.html
- **账号**: admin
- **密码**: admin123（请立即修改）

**祝使用愉快！** 🚀
