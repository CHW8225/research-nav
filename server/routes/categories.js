const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 获取所有分类（公开）
router.get('/', async (req, res) => {
  try {
    await db.read();

    const categories = db.data.categories.sort((a, b) => a.sort_order - b.sort_order);

    res.json(categories);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    await db.read();

    const category = db.data.categories.find(c => c.id === parseInt(req.params.id));

    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }

    res.json(category);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建分类（需要管理员权限）
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ error: '分类名称不能为空' });
    }

    await db.read();

    // 检查分类名称是否已存在
    const existingCategory = db.data.categories.find(c => c.name === name);
    if (existingCategory) {
      return res.status(400).json({ error: '分类名称已存在' });
    }

    const newCategory = {
      id: db.data.categories.length + 1,
      name,
      icon: icon || '',
      sort_order: sort_order || 0,
      created_at: new Date().toISOString()
    };

    db.data.categories.push(newCategory);
    await db.write();

    res.status(201).json({
      message: '分类创建成功',
      category: newCategory
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新分类（需要管理员权限）
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;

    await db.read();

    const categoryIndex = db.data.categories.findIndex(c => c.id === parseInt(req.params.id));

    if (categoryIndex === -1) {
      return res.status(404).json({ error: '分类不存在' });
    }

    // 更新分类信息
    if (name) db.data.categories[categoryIndex].name = name;
    if (icon !== undefined) db.data.categories[categoryIndex].icon = icon;
    if (sort_order !== undefined) db.data.categories[categoryIndex].sort_order = sort_order;

    await db.write();

    res.json({
      message: '分类更新成功',
      category: db.data.categories[categoryIndex]
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除分类（需要管理员权限）
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.read();

    const categoryIndex = db.data.categories.findIndex(c => c.id === parseInt(req.params.id));

    if (categoryIndex === -1) {
      return res.status(404).json({ error: '分类不存在' });
    }

    // 检查该分类下是否有链接
    const hasLinks = db.data.links.some(l => l.category_id === parseInt(req.params.id));

    if (hasLinks) {
      return res.status(400).json({ error: '该分类下还有链接，无法删除' });
    }

    db.data.categories.splice(categoryIndex, 1);
    await db.write();

    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
