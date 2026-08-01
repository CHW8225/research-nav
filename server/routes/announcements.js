const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 获取所有公告（公开）
router.get('/', async (req, res) => {
  try {
    await db.read();

    let announcements = db.data.announcements;

    // 只返回启用的公告（默认）
    const { active_only } = req.query;
    if (active_only !== 'false') {
      announcements = announcements.filter(a => a.is_active === 1);
    }

    // 按创建时间倒序排序
    announcements = announcements.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(announcements);
  } catch (error) {
    console.error('获取公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个公告
router.get('/:id', async (req, res) => {
  try {
    await db.read();

    const announcement = db.data.announcements.find(a => a.id === parseInt(req.params.id));

    if (!announcement) {
      return res.status(404).json({ error: '公告不存在' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('获取公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建公告（需要管理员权限）
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, is_active } = req.body;

    if (!title) {
      return res.status(400).json({ error: '公告标题不能为空' });
    }

    await db.read();

    const newAnnouncement = {
      id: db.data.announcements.length + 1,
      title,
      content: content || '',
      is_active: is_active !== undefined ? is_active : 1,
      created_at: new Date().toISOString()
    };

    db.data.announcements.push(newAnnouncement);
    await db.write();

    res.status(201).json({
      message: '公告创建成功',
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error('创建公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新公告（需要管理员权限）
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, is_active } = req.body;

    await db.read();

    const announcementIndex = db.data.announcements.findIndex(
      a => a.id === parseInt(req.params.id)
    );

    if (announcementIndex === -1) {
      return res.status(404).json({ error: '公告不存在' });
    }

    // 更新公告信息
    const announcement = db.data.announcements[announcementIndex];
    if (title) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (is_active !== undefined) announcement.is_active = is_active;

    await db.write();

    res.json({
      message: '公告更新成功',
      announcement: db.data.announcements[announcementIndex]
    });
  } catch (error) {
    console.error('更新公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除公告（需要管理员权限）
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.read();

    const announcementIndex = db.data.announcements.findIndex(
      a => a.id === parseInt(req.params.id)
    );

    if (announcementIndex === -1) {
      return res.status(404).json({ error: '公告不存在' });
    }

    db.data.announcements.splice(announcementIndex, 1);
    await db.write();

    res.json({ message: '公告删除成功' });
  } catch (error) {
    console.error('删除公告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
