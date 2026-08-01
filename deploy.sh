#!/bin/bash

# 科研一站式导航网站 - 一键部署脚本
# 适用于宝塔面板 + 腾讯云服务器

set -e

echo "=========================================="
echo "   科研一站式导航网站 - 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户或 sudo 运行此脚本${NC}"
    exit 1
fi

# 项目配置
PROJECT_DIR="/www/wwwroot/research-nav"
PROJECT_NAME="research-nav"
NODE_VERSION="16"
PORT=3000

echo -e "${YELLOW}[1/8] 检查系统环境...${NC}"
# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js 未安装，请先在宝塔面板安装 Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
echo -e "${GREEN}✓ NPM 版本: $(npm -v)${NC}"
echo ""

echo -e "${YELLOW}[2/8] 创建项目目录...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p "$PROJECT_DIR"
    echo -e "${GREEN}✓ 项目目录创建成功: $PROJECT_DIR${NC}"
else
    echo -e "${YELLOW}⚠ 项目目录已存在${NC}"
fi
echo ""

echo -e "${YELLOW}[3/8] 创建日志目录...${NC}"
mkdir -p "$PROJECT_DIR/logs"
echo -e "${GREEN}✓ 日志目录创建成功${NC}"
echo ""

echo -e "${YELLOW}[4/8] 安装项目依赖...${NC}"
cd "$PROJECT_DIR"

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: package.json 文件不存在${NC}"
    echo "请确保项目文件已上传到: $PROJECT_DIR"
    exit 1
fi

# 使用淘宝镜像安装依赖
echo "使用淘宝镜像安装依赖..."
npm install --registry=https://registry.npmmirror.com
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

echo -e "${YELLOW}[5/8] 设置文件权限...${NC}"
chmod -R 755 "$PROJECT_DIR"
chmod -R 777 "$PROJECT_DIR/logs"
chmod -R 755 "$PROJECT_DIR/server/database"
echo -e "${GREEN}✓ 文件权限设置完成${NC}"
echo ""

echo -e "${YELLOW}[6/8] 停止旧的 PM2 进程（如果存在）...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 delete "$PROJECT_NAME" 2>/dev/null || true
    echo -e "${GREEN}✓ 旧进程已停止${NC}"
else
    echo -e "${YELLOW}⚠ PM2 未安装，请先在宝塔面板安装 PM2 管理器${NC}"
fi
echo ""

echo -e "${YELLOW}[7/8] 启动 PM2 应用...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✓ 应用启动成功${NC}"

    # 显示状态
    sleep 2
    pm2 status
else
    echo -e "${RED}错误: PM2 未安装${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}[8/8] 验证服务状态...${NC}"
# 检查端口
if netstat -ntlp | grep -q ":$PORT "; then
    echo -e "${GREEN}✓ 服务正在运行，监听端口: $PORT${NC}"
else
    echo -e "${RED}✗ 服务未正常启动，请检查日志${NC}"
    pm2 logs "$PROJECT_NAME" --lines 50
    exit 1
fi

# 测试 API
if curl -s http://localhost:$PORT/api/health | grep -q "ok"; then
    echo -e "${GREEN}✓ API 响应正常${NC}"
else
    echo -e "${YELLOW}⚠ API 响应异常，请检查配置${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "=========================================="
echo ""
echo "项目信息："
echo "  - 项目目录: $PROJECT_DIR"
echo "  - 运行端口: $PORT"
echo "  - PM2 名称: $PROJECT_NAME"
echo ""
echo "常用命令："
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs $PROJECT_NAME"
echo "  重启应用: pm2 restart $PROJECT_NAME"
echo "  停止应用: pm2 stop $PROJECT_NAME"
echo ""
echo "下一步："
echo "  1. 在宝塔面板配置 Nginx 反向代理"
echo "  2. 配置域名解析（如有域名）"
echo "  3. 配置 SSL 证书（建议）"
echo "  4. 修改默认管理员密码"
echo ""
echo -e "${YELLOW}⚠ 重要提示：${NC}"
echo "  - 后台登录地址: http://你的IP/admin/login.html"
echo "  - 默认账号: admin / admin123"
echo "  - 请立即修改默认密码！"
echo ""
echo "=========================================="
