const path = require('path');
const { JSONDatabase } = require('./utils/json-database');
const { categories, links } = require('./seed-data');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database', 'db.json');

const defaultData = {
  users: [],
  categories: [],
  links: [],
  announcements: []
};

const db = new JSONDatabase(dbPath, defaultData);

const importData = async () => {
  try {
    console.log('开始导入数据...\n');
    console.log(`数据库文件位置: ${dbPath}\n`);

    await db.read();
    db.data ||= { ...defaultData };
    db.data.categories = [];
    db.data.links = [];
    db.data.announcements = [];

    const categoryMap = new Map();

    categories.forEach((category, index) => {
      const id = index + 1;
      const item = {
        id,
        name: category.name,
        icon: category.icon,
        sort_order: category.sort_order,
        created_at: new Date().toISOString()
      };

      db.data.categories.push(item);
      categoryMap.set(category.name, id);
      console.log(`✓ 导入分类: ${category.name} (ID: ${id})`);
    });

    let successCount = 0;
    let failCount = 0;

    links.forEach((link, index) => {
      const categoryId = categoryMap.get(link.category);

      if (!categoryId) {
        console.error(`✗ 未找到分类 ${link.category}，跳过链接 ${link.title}`);
        failCount++;
        return;
      }

      db.data.links.push({
        id: index + 1,
        title: link.title,
        url: link.url,
        description: link.description || '',
        icon: link.icon || '',
        category_id: categoryId,
        is_pinned: link.is_pinned || 0,
        clicks: 0,
        sort_order: link.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      successCount++;
    });

    db.data.announcements.push({
      id: 1,
      title: '欢迎使用科研一站式导航！',
      content: '这是一个科研导航页面，为科研学习和日常效率工具提供分类入口。\n\n欢迎反馈建议，后续会持续优化。',
      is_active: 1,
      created_at: new Date().toISOString()
    });

    await db.write();

    console.log(`\n✓ 链接导入完成！成功: ${successCount} 个，失败: ${failCount} 个`);
    console.log(`分类总数: ${db.data.categories.length}`);
    console.log(`链接总数: ${db.data.links.length}`);
    console.log(`置顶链接: ${db.data.links.filter(link => link.is_pinned === 1).length}`);
    console.log(`公告总数: ${db.data.announcements.length}`);
  } catch (error) {
    console.error('\n✗ 数据导入失败:', error);
    process.exit(1);
  }
};

importData();
