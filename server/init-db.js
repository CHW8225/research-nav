const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库文件路径
const dbPath = path.join(__dirname, 'database', 'db.json');

// 初始化 lowdb
const adapter = new JSONFile(dbPath);
const defaultData = {
  users: [],
  categories: [],
  links: [],
  announcements: []
};
const db = new Low(adapter, defaultData);

// 初始化数据库
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');
    console.log(`数据库文件位置: ${dbPath}`);

    // 读取数据
    await db.read();

    // 如果是空数据库，创建默认数据
    if (!db.data.users.length) {
      console.log('\n创建默认管理员账号...');

      const hashedPassword = bcrypt.hashSync('admin123', 10);

      db.data.users = [{
        id: 1,
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString()
      }];

      await db.write();
      console.log('✅ 默认管理员账号创建成功 (用户名: admin, 密码: admin123)');
    }

    console.log('\n✅ 数据库初始化完成！');
    console.log('\n接下来请运行: npm run seed-data');
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

// 运行初始化
initDatabase();
