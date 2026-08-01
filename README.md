# 科研一站式导航网站

一个基于 Node.js + Express 的科研工具导航站，包含前台分类导航、搜索、点击统计、公告展示，以及后台分类/链接/公告管理。

## 技术栈

- 前台：HTML5 + Bootstrap 5 + jQuery
- 后端：Node.js + Express
- 数据库：LowDB（JSON 文件）
- 认证：JWT + bcryptjs
- 部署：Nginx + PM2

## 快速开始

```bash
npm install
npm run init-db
npm run seed-data
npm run cache-icons
npm start
```

访问地址：

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/index.html
- 默认账号：admin / admin123

首次登录后请尽快修改默认密码。

## 常用命令

```bash
npm start        # 启动服务
npm run dev      # 开发模式
npm run init-db  # 初始化 LowDB 数据文件和默认管理员
npm run seed-data    # 导入初始分类、链接、公告
npm run cache-icons  # 缓存公开网站图标到本地
npm test         # 运行自动化测试
```

## 数据与图标

- 数据文件：`server/database/db.json`
- 数据备份：`server/database/backups/`
- 本地图标：`public/assets/icons/sites/`
- 上传图标：`public/assets/uploads/`

链接的 `icon` 字段优先使用本地路径，例如：

```json
"/assets/icons/sites/link-001-site.ico"
```

如果公开图标下载失败，`npm run cache-icons` 会生成统一风格的本地 SVG 占位图标。

## 环境变量

- `PORT`：服务端口，默认 `3000`
- `DB_PATH`：可选，自定义 LowDB JSON 数据文件路径
- `JWT_SECRET`：生产环境必须设置；本地开发未设置时会使用开发默认值并输出警告

生产环境示例：

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=please-change-this-secret
```

## 安全说明

- 密码使用 bcryptjs 加密保存。
- 后台接口使用 JWT 鉴权。
- 生产环境必须配置 `JWT_SECRET`。
- 图标上传不接受 SVG，只允许 `jpeg`、`jpg`、`png`、`gif`、`ico`、`webp`。
- 前台/后台动态内容渲染会进行基础 HTML 转义，降低 XSS 风险。

## 目录结构

```text
public/                 # 前台页面和静态资源
  assets/css/
  assets/js/
  assets/icons/sites/   # 本地缓存图标
  assets/uploads/       # 后台上传图标
admin/                  # 后台页面和静态资源
server/                 # Express 服务和 API
  config/database.js    # LowDB 配置
  database/db.json      # JSON 数据库
  routes/               # API 路由
scripts/cache-icons.js  # 图标缓存脚本
tests/                  # 自动化测试
```
