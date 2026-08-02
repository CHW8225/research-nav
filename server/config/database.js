const fs = require('fs');
const path = require('path');
const { JSONDatabase } = require('../utils/json-database');

const defaultData = {
  users: [],
  categories: [],
  links: [],
  announcements: []
};

// 数据库文件路径
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/db.json');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new JSONDatabase(dbPath, defaultData);

// 初始化数据库连接
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
