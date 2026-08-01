const jwt = require('jsonwebtoken');

const hasConfiguredSecret = Boolean(process.env.JWT_SECRET);

if (process.env.NODE_ENV === 'production' && !hasConfiguredSecret) {
  throw new Error('生产环境必须设置 JWT_SECRET 环境变量');
}

if (!hasConfiguredSecret && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️  当前使用开发默认 JWT_SECRET，上线前请设置环境变量 JWT_SECRET');
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-before-production';

// 验证 JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

// 验证管理员权限
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 生成 JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  verifyToken,
  verifyAdmin,
  generateToken
};
