#!/bin/bash
# VibeShare 一键部署脚本 — 将本地代码同步到服务器并重新构建
# 用法: ./deploy.sh

set -e

SERVER="root@124.221.163.150"
SSH_KEY="$HOME/.ssh/id_ed25519_vibeshare"
APP_DIR="/opt/vibeshare"

echo "========================================"
echo "  VibeShare 部署"
echo "  服务器: $SERVER"
echo "========================================"

# 1. 同步源代码
echo "[1/4] 同步源代码..."
tar czf - \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.env' \
    src/ prisma/ tests/ public/ \
    package.json package-lock.json tsconfig.json \
    next.config.ts tailwind.config.ts postcss.config.mjs \
    components.json vitest.config.ts playwright.config.ts \
    vercel.json setup-server.sh \
    .env.example \
    | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER \
    "cd $APP_DIR && tar xzf - && echo 'Files synced'"

# 2. 安装依赖(如有新增)
echo "[2/4] 检查依赖..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER \
    "cd $APP_DIR && npm install --production 2>&1 | tail -3"

# 3. 生成 Prisma 客户端
echo "[3/4] 生成 Prisma 客户端..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER \
    "cd $APP_DIR && npx prisma generate 2>&1 | tail -3"

# 4. 构建并重启
echo "[4/4] 构建并重启..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER \
    "cd $APP_DIR && rm -rf .next && npm run build 2>&1 | tail -8 && pm2 restart vibeshare && sleep 3 && curl -s -o /dev/null -w 'HTTP: %{http_code}' http://localhost:3000 && echo ' - OK'"

echo ""
echo "========================================"
echo "  部署完成!"
echo "  https://vibeshare.com.cn"
echo "========================================"
