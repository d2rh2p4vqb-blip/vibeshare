import { NextRequest, NextResponse } from "next/server";

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || "vibeshare-deploy-2026";
const DEPLOY_SCRIPT = "/opt/vibeshare/deploy-webhook.sh";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret } = body;

    if (secret !== DEPLOY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Spawn background deploy — must be async to not kill ourselves
    const { spawn } = await import("child_process");
    const child = spawn("/usr/bin/bash", [DEPLOY_SCRIPT], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env, PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin" },
    });
    child.unref();

    return NextResponse.json({ success: true, message: "Deploy started in background" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Deploy trigger failed", message: error.message || String(error) },
      { status: 500 }
    );
  }
}
