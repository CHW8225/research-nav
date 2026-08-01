const fs = require('fs');
const { LowSync } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');
const path = require('path');

const defaultData = {
  users: [],
  categories: [],
  links: [],
  announcements: []
};

// 数据库文件路径
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/db.json');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// 初始化 lowdb（同步版本，兼容现有路由代码）
const adapter = new JSONFileSync(dbPath);
const db = new LowSync(adapter, defaultData);

// 初始化数据库连接（同步版本）
const initDatabase = () => {
  db.read();
  // 确保数据结构完整
  db.data = db.data || { ...defaultData };
  db.data.users = db.data.users || [];
  db.data.categories = db.data.categories || [];
  db.data.links = db.data.links || [];
  db.data.announcements = db.data.announcements || [];
  db.write();
};

module.exports = {
  db,
  dbPath,
  initDatabase
};
