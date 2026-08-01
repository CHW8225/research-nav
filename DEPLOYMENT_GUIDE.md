# 科研一站式导航网站 - 宝塔面板部署方案

## 📋 部署信息

- **服务器IP**: 119.91.227.249
- **本地项目路径**: D:\科研导航网站
- **服务器部署路径**: /www/wwwroot/research-nav
- **技术栈**: Node.js + Express + LowDB

---

## 🚀 第一步：项目打包和准备

### 1.1 在本地打包项目

在本地 Windows 电脑上打开命令提示符（CMD）：

```bash
# 进入项目目录
cd D:\科研导航网站

# 创建部署包（排除不必要的文件）
# 方式1：手动压缩
# 使用 WinRAR 或 7-Zip 压缩整个项目文件夹为 research-nav.zip

# 方式2：使用命令行（如果有 PowerShell）
# Compress-Archive -Path * -DestinationPath research-nav.zip
```

**需要包含的文件**：
```
research-nav/
├── server/              # 后端代码
├── public/              # 前台代码
├── admin/               # 后台管理
├── package.json         # 项目配置
├── ecosystem.config.js  # PM2配置（需要新建）
└── README.md
```

**需要排除的文件**：
```
node_modules/           # 依赖包（服务器重新安装）
.git/                  # Git文件
.env.local             # 本地环境变量
.DS_Store              # Mac系统文件
```

---

## 📤 第二步：上传项目到服务器

### 2.1 使用宝塔面板上传

1. **登录宝塔面板**
   - 浏览器访问：`http://119.91.227.249:8888`
   - 输入宝塔账号密码登录

2. **进入文件管理**
   - 点击左侧菜单【文件】

3. **创建网站目录**
   ```
   路径：/www/wwwroot/research-nav
   操作：
   - 点击【新建目录】
   - 输入：research-nav
   - 点击【确定】
   ```

4. **上传项目压缩包**
   ```
   操作：
   - 进入 research-nav 目录
   - 点击【上传】
   - 选择本地的 research-nav.zip
   - 等待上传完成
   ```

5. **解压项目**
   ```
   操作：
   - 找到上传的 research-nav.zip
   - 右键点击【解压】
   - 解压到当前目录
   - 删除 research-nav.zip（节省空间）
   ```

---

## 🔧 第三步：安装 Node.js 环境

### 3.1 在宝塔面板安装 Node.js

1. **进入软件商店**
   - 点击左侧菜单【软件商店】

2. **搜索并安装 Node.js**
   ```
   推荐版本：Node.js 16.x 或 18.x
   
   操作：
   - 搜索"Node.js"
   - 选择【PM2管理器】（推荐）或【Node项目】
   - 点击【安装】
   - 等待安装完成
   ```

3. **验证安装**
   ```bash
   # 点击宝塔面板【终端】或使用 SSH 连接服务器
   node -v
   npm -v
   ```

---

## 📦 第四步：安装项目依赖

### 4.1 在服务器终端安装依赖

1. **打开宝塔终端**
   - 点击宝塔面板【终端】按钮

2. **进入项目目录**
   ```bash
   cd /www/wwwroot/research-nav
   ```

3. **安装依赖（使用国内镜像加速）**
   ```bash
   # 使用淘宝镜像
   npm install --registry=https://registry.npmmirror.com

   # 或者直接安装（宝塔会自动使用国内镜像）
   npm install
   ```

4. **验证安装**
   ```bash
   # 检查 node_modules 是否存在
   ls -la node_modules/
   ```

---

## ⚙️ 第五步：创建 PM2 配置文件

### 5.1 创建 ecosystem.config.js

在宝塔面板【文件管理】中：

1. **进入项目目录**
   ```
   /www/wwwroot/research-nav/
   ```

2. **新建文件**
   - 点击【新建文件】
   - 文件名：`ecosystem.config.js`
   - 点击【创建】

3. **编辑文件内容**
   ```javascript
   module.exports = {
     apps: [{
       name: 'research-nav',
       script: './server/app.js',
       cwd: '/www/wwwroot/research-nav',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/pm2-error.log',
       out_file: './logs/pm2-out.log',
       log_file: './logs/pm2-combined.log',
       time: true,
       merge_logs: true,
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
     }]
   };
   ```

4. **创建日志目录**
   ```bash
   # 在终端执行
   cd /www/wwwroot/research-nav
   mkdir -p logs
   ```

---

## 🚀 第六步：启动项目（使用 PM2）

### 6.1 使用 PM2 启动项目

**方式1：使用宝塔面板 PM2 插件**

1. **进入 PM2 管理**
   - 点击左侧菜单【软件商店】
   - 找到已安装的【PM2管理器】
   - 点击【设置】

2. **添加项目**
   ```
   项目名称：research-nav
   运行目录：/www/wwwroot/research-nav
   启动文件：server/app.js
   端口：3000
   ```
   - 点击【提交】
   - 点击【启动】

**方式2：使用命令行（推荐）**

在宝塔终端执行：

```bash
# 进入项目目录
cd /www/wwwroot/research-nav

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs research-nav

# 设置开机自启
pm2 startup
pm2 save
```

### 6.2 验证项目运行

```bash
# 检查端口是否监听
netstat -ntlp | grep 3000

# 或使用 curl 测试
curl http://localhost:3000/api/health
```

应该返回：
```json
{"status":"ok","message":"服务器运行正常"}
```

---

## 🌐 第七步：配置 Nginx 反向代理

### 7.1 在宝塔面板创建网站

1. **进入网站管理**
   - 点击左侧菜单【网站】

2. **添加站点**
   ```
   域名：119.91.227.249（或你的域名，如 nav.example.com）
   根目录：/www/wwwroot/research-nav/public
   PHP版本：纯静态
   创建数据库：不需要（使用JSON数据库）
   ```

3. **点击【提交】创建网站**

### 7.2 配置 Nginx 反向代理

1. **进入网站设置**
   - 在网站列表中找到刚创建的网站
   - 点击【设置】

2. **配置反向代理**
   - 点击左侧【反向代理】
   - 点击【添加反向代理】

   ```
   代理名称：research-nav
   目标URL：http://127.0.0.1:3000
   发送域名：$host
   ```

   - 点击【提交】

3. **或者手动修改配置文件**
   - 点击【配置文件】
   - 将配置修改为：

   ```nginx
   server {
       listen 80;
       server_name 119.91.227.249 nav.example.com; # 你的域名或IP

       # 访问日志
       access_log /www/wwwlogs/research-nav_access.log;
       error_log /www/wwwlogs/research-nav_error.log;

       # 前台静态文件
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # 后台管理
       location /admin {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # API 接口
       location /api {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # 静态文件缓存
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
           proxy_pass http://127.0.0.1:3000;
           expires 7d;
           add_header Cache-Control "public, immutable";
       }

       # 上传文件大小限制
       client_max_body_size 2M;
   }
   ```

4. **保存并重载配置**
   - 点击【保存】
   - 宝塔会自动重载 Nginx

### 7.3 配置防火墙

1. **开放 3000 端口（可选，建议只开放80/443）**
   - 点击左侧菜单【安全】
   - 添加防火墙规则：
   ```
   类型：端口放行
   端口：3000
   协议：tcp
   备注：科研导航Node.js
   ```
   - 点击【提交】

   ⚠️ **注意**：如果使用 Nginx 反向代理，可以不开放 3000 端口

---

## 🧪 第八步：测试部署

### 8.1 测试网站访问

1. **前台访问**
   ```
   浏览器访问：http://119.91.227.249
   应该看到：科研一站式导航首页
   ```

2. **后台访问**
   ```
   浏览器访问：http://119.91.227.249/admin/login.html
   用户名：admin
   密码：admin123
   ```

3. **API 测试**
   ```bash
   curl http://119.91.227.249/api/health
   ```

### 8.2 检查 PM2 状态

```bash
# 在宝塔终端执行
pm2 status

# 应该显示：
# ┌──────────────┬──────┬─────────┬─────┬─────────┐
# │ App name     │ mode │ status  │ cpu │ memory │
# ├──────────────┼──────┼─────────┼─────┼─────────┤
# │ research-nav │ fork │ online  │ 0%  │ 100MB   │
# └──────────────┴──────┴─────────┴─────┴─────────┘
```

---

## 🔐 第九步：安全配置

### 9.1 修改默认密码

1. **登录后台**
   - 访问 `http://119.91.227.249/admin/login.html`
   - 使用 admin / admin123 登录

2. **修改密码**
   - 点击右上角用户名
   - 选择【修改密码】
   - 输入新密码并确认

### 9.2 配置 SSL 证书（可选）

1. **申请免费证书**
   - 在网站设置中点击【SSL】
   - 选择【Let's Encrypt】
   - 点击【申请】

2. **强制 HTTPS**
   - 申请成功后，开启【强制HTTPS】

### 9.3 设置目录权限

```bash
# 在宝塔终端执行
cd /www/wwwroot/research-nav

# 设置适当的文件权限
chmod -R 755 .
chmod -R 755 server/database

# 确保 logs 目录可写
chmod -R 777 logs
```

---

## 📊 第十步：监控和维护

### 10.1 查看日志

```bash
# PM2 日志
pm2 logs research-nav

# 应用日志
tail -f /www/wwwroot/research-nav/logs/pm2-out.log
tail -f /www/wwwroot/research-nav/logs/pm2-error.log
```

### 10.2 PM2 常用命令

```bash
# 查看状态
pm2 status

# 重启应用
pm2 restart research-nav

# 停止应用
pm2 stop research-nav

# 删除应用
pm2 delete research-nav

# 查看详细信息
pm2 info research-nav

# 监控
pm2 monit
```

### 10.3 宝塔面板监控

1. **CPU 和内存监控**
   - 点击左侧菜单【监控】

2. **设置告警**
   - 配置 CPU、内存、磁盘使用率告警
   - 配置离线告警（微信、邮件通知）

---

## 🔄 第十一步：更新和维护

### 11.1 更新项目代码

当需要更新项目时：

```bash
# 1. 备份当前版本
cd /www/wwwroot
cp -r research-nav research-nav-backup-$(date +%Y%m%d)

# 2. 上传新代码到服务器

# 3. 重启应用
pm2 restart research-nav
```

### 11.2 查看数据库

项目使用 LowDB（JSON 数据库），数据库文件位于：
```
/www/wwwroot/research-nav/server/database/db.json
```

**备份建议**：
```bash
# 定期备份数据库文件
cp /www/wwwroot/research-nav/server/database/db.json \
   /www/wwwroot/research-nav/server/database/db.json.backup
```

---

## ❗ 常见问题解决

### 问题1：端口 3000 被占用

```bash
# 查找占用进程
lsof -i :3000
# 或
netstat -ntlp | grep 3000

# 杀死进程
kill -9 <PID>
```

### 问题2：npm install 失败

```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 问题3：PM2 启动失败

```bash
# 查看详细日志
pm2 logs research-nav --lines 100

# 检查端口
netstat -ntlp | grep 3000
```

### 问题4：网站无法访问

1. **检查 PM2 状态**
   ```bash
   pm2 status
   ```

2. **检查 Nginx 配置**
   - 宝塔面板 → 网站 → 设置 → 配置文件

3. **检查防火墙**
   - 宝塔面板 → 安全 → 端口放行

4. **查看错误日志**
   ```bash
   tail -f /www/wwwroot/research-nav/logs/pm2-error.log
   ```

---

## 📋 部署检查清单

- [ ] 项目已上传到服务器
- [ ] Node.js 环境已安装
- [ ] 依赖已安装（npm install）
- [ ] PM2 配置文件已创建
- [ ] 项目已使用 PM2 启动
- [ ] PM2 开机自启已设置
- [ ] Nginx 反向代理已配置
- [ ] 防火墙规则已设置
- [ ] 网站可以正常访问
- [ ] 后台可以正常登录
- [ ] 默认密码已修改
- [ ] SSL 证书已配置（可选）
- [ ] 数据库备份计划已设置

---

## 🎉 完成部署

恭喜！你的科研一站式导航网站已经成功部署到服务器！

### 访问地址

- **前台地址**：http://119.91.227.249（或你的域名）
- **后台地址**：http://119.91.227.249/admin/login.html
- **默认账号**：admin / admin123

### 下一步建议

1. **配置域名解析**
   - 在域名服务商添加 A 记录指向 119.91.227.249

2. **启用 SSL 证书**
   - 使用 Let's Encrypt 免费证书

3. **定期备份数据**
   - 备份 /www/wwwroot/research-nav/server/database/db.json

4. **监控网站状态**
   - 设置宝塔监控告警

---

## 📞 技术支持

如遇到问题，可以：
1. 查看宝塔面板日志
2. 查看 PM2 日志
3. 检查 Nginx 配置
4. 查看本文档的常见问题部分

**祝部署顺利！** 🚀

---

## 当前版本补充说明

- 数据库使用 LowDB JSON，默认文件为 `server/database/db.json`，不是 SQLite。
- 生产环境必须设置 `JWT_SECRET`，否则服务会拒绝启动。
- 可用 `DB_PATH` 指定数据库文件路径，便于测试或迁移。
- 首次导入数据后建议运行 `npm run cache-icons`，将公开网站图标缓存到 `public/assets/icons/sites/`。
- 上传图标不再接受 SVG，仅允许 `jpeg`、`jpg`、`png`、`gif`、`ico`、`webp`。
