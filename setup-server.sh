#!/bin/bash
# VibeShare 一键部署脚本 — OpenCloudOS / RHEL / CentOS
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
echo "  OS: OpenCloudOS/RHEL"
echo "========================================"
echo ""

# 1. 更新系统
echo "[1/8] 更新系统..."
yum update -y

# 2. 安装 Node.js 20
echo "[2/8] 安装 Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git nginx

# 3. 安装 PostgreSQL
echo "[3/8] 安装 PostgreSQL..."
yum install -y postgresql-server postgresql-contrib

# 4. 初始化并启动 PostgreSQL
echo "[4/8] 配置数据库..."
postgresql-setup --initdb || echo "数据库已初始化，跳过"
systemctl start postgresql
systemctl enable postgresql

# 生成随机密码
DB_PASSWORD=$(openssl rand -base64 16)

# 创建用户和数据库
sudo -u postgres psql -c "CREATE USER vibeshare WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "用户已存在，跳过"
sudo -u postgres psql -c "CREATE DATABASE vibeshare OWNER vibeshare;" 2>/dev/null || echo "数据库已存在，跳过"
sudo -u postgres psql -c "ALTER USER vibeshare CREATEDB;"

# 允许本地 md5 认证（OpenCloudOS 默认可能是 ident）
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | tr -d ' ')
if [ -f "$PG_HBA" ]; then
    sed -i 's/^host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+ident/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA"
    sed -i 's/^host\s\+all\s\+all\s\+::1\/128\s\+ident/host    all             all             ::1\/128                 md5/' "$PG_HBA"
    systemctl reload postgresql
fi

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
cat > /etc/nginx/conf.d/vibeshare.conf << NGINX
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

# 确保 nginx.conf 包含 conf.d
if ! grep -q "include /etc/nginx/conf.d/\*.conf;" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    include /etc/nginx/conf.d/*.conf;' /etc/nginx/nginx.conf
fi

systemctl enable nginx
nginx -t && systemctl reload nginx || systemctl start nginx

# 8. 配置 SSL
echo "[8/8] 配置 HTTPS..."
yum install -y epel-release 2>/dev/null || true
yum install -y certbot python3-certbot-nginx 2>/dev/null || pip3 install certbot-nginx 2>/dev/null || echo "certbot 安装跳过"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" 2>/dev/null || echo "SSL 证书申请失败，请手动运行: certbot --nginx -d $DOMAIN"

# 生成 AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo "========================================"
echo "  基础环境安装完成!"
echo "========================================"
echo ""
echo "  数据库: postgresql://vibeshare:$DB_PASSWORD@localhost:5432/vibeshare"
echo "  AUTH_SECRET: $AUTH_SECRET"
echo ""
echo "  *** 接下来手动执行 ***"
echo ""
echo "  cd $APP_DIR"
echo ""
echo "  # 1. 创建 .env 文件（填入你的腾讯云密钥）"
echo "  cat > .env << 'ENVEOF'"
echo "DATABASE_URL=postgresql://vibeshare:$DB_PASSWORD@localhost:5432/vibeshare"
echo "AUTH_SECRET=$AUTH_SECRET"
echo "NEXTAUTH_URL=https://$DOMAIN"
echo "TENCENT_SECRET_ID=<你的腾讯云SecretId>"
echo "TENCENT_SECRET_KEY=<你的腾讯云SecretKey>"
echo "TENCENT_IM_SDKAPPID=<你的IM应用ID>"
echo "TENCENT_IM_SECRET=<你的IM密钥>"
echo "TENCENT_IM_ADMIN=admin"
echo "NEXT_PUBLIC_TENCENT_IM_SDKAPPID=<你的IM应用ID>"
echo "COS_BUCKET=<你的COS桶名>"
echo "COS_REGION=ap-guangzhou"
echo "COS_DOMAIN=https://<你的COS桶名>.cos.ap-guangzhou.myqcloud.com"
echo "ENVEOF"
echo ""
echo "  # 2. 编辑 .env 填入真实值"
echo "  nano .env"
echo ""
echo "  # 3. 安装依赖 + 初始化数据库"
echo "  npm install"
echo "  npx prisma generate"
echo "  npx prisma migrate deploy"
echo ""
echo "  # 4. 构建并启动"
echo "  npm run build"
echo "  pm2 start npm --name vibeshare -- start"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "  # 5. 查看状态"
echo "  pm2 status"
echo ""
