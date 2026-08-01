const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化数据库（同步版本）
try {
  initDatabase();
  console.log('✅ 数据库连接成功');
} catch (err) {
  console.error('❌ 数据库连接失败:', err);
}

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, '../public/assets/uploads')));

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/links', require('./routes/links'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/upload', require('./routes/upload'));

// 测试路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 前台路由 - 所有其他请求返回 index.html
app.get('*', (req, res) => {
  // 如果是 API 请求，返回 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API 路由不存在' });
  }
  // 其他请求返回前台页面
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 服务器已启动`);
  console.log(`📝 前台地址: http://localhost:${PORT}`);
  console.log(`⚙️  后台地址: http://localhost:${PORT}/admin/index.html`);
  console.log(`🔧 API 地址: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
