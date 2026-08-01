const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 获取所有链接（公开）
router.get('/', async (req, res) => {
  try {
    await db.read();

    const { category_id, is_pinned } = req.query;

    let links = db.data.links;

    // 按分类筛选
    if (category_id) {
      links = links.filter(l => l.category_id === parseInt(category_id));
    }

    // 按置顶筛选
    if (is_pinned) {
      links = links.filter(l => l.is_pinned === 1);
    }

    // 按排序字段排序
    links = links.sort((a, b) => a.sort_order - b.sort_order);

    res.json(links);
  } catch (error) {
    console.error('获取链接错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个链接
router.get('/:id', async (req, res) => {
  try {
    await db.read();

    const link = db.data.links.find(l => l.id === parseInt(req.params.id));

    if (!link) {
      return res.status(404).json({ error: '链接不存在' });
    }

    res.json(link);
  } catch (error) {
    console.error('获取链接错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 记录点击（���开）
router.post('/:id/click', async (req, res) => {
  try {
    await db.read();

    const linkIndex = db.data.links.findIndex(l => l.id === parseInt(req.params.id));

    if (linkIndex === -1) {
      return res.status(404).json({ error: '链接不存在' });
    }

    // 增加点击次数
    db.data.links[linkIndex].clicks = (db.data.links[linkIndex].clicks || 0) + 1;

    await db.write();

    res.json({ message: '点击记录成功' });
  } catch (error) {
    console.error('记录点击错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建链接（需要管理员权限）
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, url, description, icon, category_id, is_pinned, sort_order } = req.body;

    if (!title || !url || !category_id) {
      return res.status(400).json({ error: '标题、URL和分类不能为空' });
    }

    await db.read();

    // 检查分类是否存在
    const category = db.data.categories.find(c => c.id === category_id);
    if (!category) {
      return res.status(400).json({ error: '分类不存在' });
    }

    const newLink = {
      id: db.data.links.length + 1,
      title,
      url,
      description: description || '',
      icon: icon || '',
      category_id,
      is_pinned: is_pinned || 0,
      clicks: 0,
      sort_order: sort_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.data.links.push(newLink);
    await db.write();

    res.status(201).json({
      message: '链接创建成功',
      link: newLink
    });
  } catch (error) {
    console.error('创建链接错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新链接（需要管理员权限）
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, url, description, icon, category_id, is_pinned, sort_order } = req.body;

    await db.read();

    const linkIndex = db.data.links.findIndex(l => l.id === parseInt(req.params.id));

    if (linkIndex === -1) {
      return res.status(404).json({ error: '链接不存在' });
    }

    // 如果更新分类，检查分类是否存在
    if (category_id) {
      const category = db.data.categories.find(c => c.id === category_id);
      if (!category) {
        return res.status(400).json({ error: '分类不存在' });
      }
    }

    // 更新链接信息
    const link = db.data.links[linkIndex];
    if (title) link.title = title;
    if (url) link.url = url;
    if (description !== undefined) link.description = description;
    if (icon !== undefined) link.icon = icon;
    if (category_id) link.category_id = category_id;
    if (is_pinned !== undefined) link.is_pinned = is_pinned;
    if (sort_order !== undefined) link.sort_order = sort_order;
    link.updated_at = new Date().toISOString();

    await db.write();

    res.json({
      message: '链接更新成功',
      link: db.data.links[linkIndex]
    });
  } catch (error) {
    console.error('更新链接错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除链接（需要管理员权限）
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.read();

    const linkIndex = db.data.links.findIndex(l => l.id === parseInt(req.params.id));

    if (linkIndex === -1) {
      return res.status(404).json({ error: '链接不存在' });
    }

    db.data.links.splice(linkIndex, 1);
    await db.write();

    res.json({ message: '链接删除成功' });
  } catch (error) {
    console.error('删除链接错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
