#!/bin/bash
# VibeShare 一键部署脚本 — Ubuntu 22.04 / 24.04
set -e

GITHUB_REPO="https://github.com/d2rh2p4vqb-blip/vibeshare.git"
APP_DIR="/opt/vibeshare"
DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
    echo "用法: ./setup-server.sh <你的域名>"
    echo "例如: ./setup-server.sh vibeshare.example.com"
    exit 1
fi

echo "========================================"
echo "  VibeShare 服务器部署"
echo "  域名: $DOMAIN"
echo "========================================"
echo ""

# 1. 更新系统
echo "[1/8] 更新系统..."
apt-get update -y && apt-get upgrade -y

# 2. 安装 Node.js 20 + Git + Nginx
echo "[2/8] 安装 Node.js 20 + Git + Nginx..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git nginx

# 3. 安装 PostgreSQL
echo "[3/8] 安装 PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# 4. 启动 PostgreSQL 并创建数据库
echo "[4/8] 配置数据库..."
systemctl start postgresql
systemctl enable postgresql
DB_PASSWORD=$(openssl rand -base64 16)
sudo -u postgres psql -c "CREATE USER vibeshare WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "用户已存在，跳过"
sudo -u postgres psql -c "CREATE DATABASE vibeshare OWNER vibeshare;" 2>/dev/null || echo "数据库已存在，跳过"
sudo -u postgres psql -c "ALTER USER vibeshare CREATEDB;"

# 5. 安装 PM2
echo "[5/8] 安装 PM2..."
npm install -g pm2

# 6. 克隆代码
echo "[6/8] 克隆项目..."
mkdir -p /opt
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# 7. 配置 Nginx
echo "[7/8] 配置 Nginx 反向代理..."
cat > /etc/nginx/sites-available/vibeshare << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/vibeshare /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 8. 配置 SSL (Certbot)
echo "[8/8] 配置 HTTPS..."
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" || echo "SSL 证书申请失败，请手动运行: certbot --nginx -d $DOMAIN"

echo ""
echo "========================================"
echo "  基础环境安装完成!"
echo "========================================"
echo ""
echo "  数据库: postgresql://vibeshare:$DB_PASSWORD@localhost:5432/vibeshare"
echo ""
echo "  *** 接下来手动执行 ***"
echo ""
echo "  cd $APP_DIR"
echo ""
echo "  # 1. 创建 .env 文件（填入你的真实配置）"
echo "  cp .env.example .env && nano .env"
echo ""
echo "  # 必须填写的变量:"
echo "  DATABASE_URL=postgresql://vibeshare:$DB_PASSWORD@localhost:5432/vibeshare"
echo "  NEXTAUTH_URL=https://$DOMAIN"
echo "  AUTH_SECRET=$(openssl rand -base64 32)"
echo "  TENCENT_SECRET_ID=xxx"
echo "  TENCENT_SECRET_KEY=xxx"
echo "  TENCENT_IM_SDKAPPID=xxx"
echo "  TENCENT_IM_SECRET=xxx"
echo "  NEXT_PUBLIC_TENCENT_IM_SDKAPPID=xxx"
echo "  COS_BUCKET=xxx"
echo "  COS_REGION=ap-guangzhou"
echo "  COS_DOMAIN=https://xxx.cos.ap-guangzhou.myqcloud.com"
echo ""
echo "  # 2. 安装依赖 + 初始化数据库"
echo "  npm install"
echo "  npx prisma generate"
echo "  npx prisma migrate deploy"
echo ""
echo "  # 3. 构建并启动"
echo "  npm run build"
echo "  pm2 start npm --name vibeshare -- start"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "  # 4. 查看状态"
echo "  pm2 status"
echo ""
