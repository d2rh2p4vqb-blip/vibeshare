import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || "vibeshare-deploy-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret } = body;

    if (secret !== DEPLOY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: string[] = [];

    // Pull latest code
    const { stdout: pullOut } = await execAsync("cd /opt/vibeshare && git pull origin main 2>&1");
    results.push(`git pull: ${pullOut.trim()}`);

    // Install dependencies
    const { stdout: installOut } = await execAsync("cd /opt/vibeshare && npm install --production 2>&1");
    results.push(`npm install: ${installOut.trim()}`);

    // Generate Prisma client and run migrations
    const { stdout: prismaGenOut } = await execAsync("cd /opt/vibeshare && npx prisma generate 2>&1");
    results.push(`prisma generate: ${prismaGenOut.trim()}`);

    const { stdout: prismaMigrateOut } = await execAsync("cd /opt/vibeshare && npx prisma migrate deploy 2>&1");
    results.push(`prisma migrate: ${prismaMigrateOut.trim()}`);

    // Clean build
    const { stdout: buildOut } = await execAsync("cd /opt/vibeshare && rm -rf .next && npm run build 2>&1");
    results.push(`build: ${buildOut.trim().slice(-200)}`);

    // Restart
    const { stdout: restartOut } = await execAsync("pm2 restart vibeshare 2>&1");
    results.push(`pm2: ${restartOut.trim()}`);

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Deploy failed", message: error.message || String(error) },
      { status: 500 }
    );
  }
}
