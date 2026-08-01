const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../public/assets/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'icon-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制 2MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许常见位图/图标文件；不接受 SVG，避免脚本注入风险
    const allowedTypes = /jpeg|jpg|png|gif|ico|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传 jpeg、jpg、png、gif、ico、webp 图片文件'));
    }
  }
});

// 上传图标（需要管理员权限）
router.post('/icon', verifyToken, verifyAdmin, (req, res) => {
  upload.single('file')(req, res, (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    // 返回文件访问路径
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: '文件上传成功',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
  });
});

// 删除文件（需要管理员权限）
router.delete('/icon/:filename', verifyToken, verifyAdmin, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: '文件删除成功' });
    } else {
      return res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    console.error('文件删除错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
