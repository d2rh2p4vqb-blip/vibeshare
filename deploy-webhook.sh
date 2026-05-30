#!/bin/bash
# VibeShare 自动部署 — 由 webhook 触发，在后台运行
set -e

LOG="/tmp/vibeshare-deploy.log"
APP_DIR="/opt/vibeshare"
export PATH="/usr/local/node-v20.19.6-linux-x64/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

echo "[$(date)] Deploy started" >> "$LOG"

{
    cd "$APP_DIR" || exit 1

    echo "[$(date)] Pulling..." >> "$LOG"
    git pull origin main >> "$LOG" 2>&1

    echo "[$(date)] Installing..." >> "$LOG"
    /usr/local/node-v20.19.6-linux-x64/bin/npm install >> "$LOG" 2>&1

    echo "[$(date)] Prisma generate..." >> "$LOG"
    /usr/local/node-v20.19.6-linux-x64/bin/npx prisma generate >> "$LOG" 2>&1

    echo "[$(date)] Prisma migrate..." >> "$LOG"
    /usr/local/node-v20.19.6-linux-x64/bin/npx prisma migrate deploy >> "$LOG" 2>&1

    echo "[$(date)] Building..." >> "$LOG"
    rm -rf .next
    /usr/local/node-v20.19.6-linux-x64/bin/npm run build >> "$LOG" 2>&1

    echo "[$(date)] Restarting..." >> "$LOG"
    /usr/local/node-v20.19.6-linux-x64/bin/pm2 restart vibeshare >> "$LOG" 2>&1

    sleep 3
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    echo "[$(date)] Deploy done. HTTP: $STATUS" >> "$LOG"
    echo "---" >> "$LOG"
} >> "$LOG" 2>&1
